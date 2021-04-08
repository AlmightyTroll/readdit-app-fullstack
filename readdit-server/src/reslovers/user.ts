import { User } from '../entities/User';
import { MyContext } from '../types';
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';
import { getConnection } from 'typeorm';

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
};

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]
    @Field(() => User, {nullable: true})
    user?: User
};

@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() {redis, req}: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 3) {
            return { errors: [
                {
                    field: "newPassword",
                    message: "Length must be greater than 3."
                }
            ] }
        }

        const key = FORGET_PASSWORD_PREFIX + token
        const userId = await redis.get(key)
        if (!userId) {
            return { errors: [
                {
                    field: "token",
                    message: "token expired."
                }
            ] } 
        }

        const userIdNum = parseInt(userId)
        const user = await User.findOne(userIdNum)

        if (!user) {
            return { errors: [
                {
                    field: "token",
                    message: "user no longer exists."
                }
            ] }
        }

        await User.update({id: userIdNum}, {password: await argon2.hash(newPassword)})

        await redis.del(key)

        // Login user after change password.
        req.session.userId = user.id

        return { user }
    }

    @Mutation(() => Boolean)
    async forgotPassword(@Arg('email') email: string, @Ctx() {redis} : MyContext) {
        const user = await User.findOne({where: {email}}) // have to say where if you are searching by column that is not the primary key.
        if (!user) {
            //email not in database.
            return true
        }

        const token = v4()

        await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, "ex", 1000 * 60 * 60 * 24 * 3) // 3 days

        await sendEmail(email, 
            `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
            )

        return true
    }

    @Query(() => User, {nullable: true})
        me(
        @Ctx() { req }: MyContext
    ) {
        // you are not logged in.
        if (!req.session.userId) {
            return null
        }
        return User.findOne(req.session.userId )
    } 

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {req}: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options) // not tied to the shape of our response
        if (errors) {
            return { errors }
        }

        const hashedPassword = await argon2.hash(options.password)
        let user
        try {
            // User.create({}).save()  pass the values into create({})
            // Insert using Query Builder from typeorm. Don't need to use this we can just use User.create()
            const result = await getConnection().createQueryBuilder().insert().into(User).values( 
                {
                    username: options.username,
                    email: options.email, 
                    password: hashedPassword,
                }
            ).returning("*").execute() 
            console.log("result: ", result)
            user = result.raw[0]
        } catch (err) {
            console.log('error: ', err)
            // duplicate username error.
            if (err.code === '23505' || err.detail.includes('already exists')) {  
                return {
                    errors: [{
                        field: "usernameOrEmail",
                        message: "username already exists"
                    }]
                }
            }
            console.log('message', err.message)
        }
        // stores user id session.
        //sets a cookie on the user.
        // auto login after you register. 
        req.session!.userId = user.id

        return {user}
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() {req}: MyContext
    ): Promise <UserResponse> {
        const user = await User.findOne( 
            usernameOrEmail.includes('@') 
            ? {where: {email: usernameOrEmail}}
            : {where: {username: usernameOrEmail}}
            );
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "That username does not exist."
                    },
                ]
            }
        }
        const valid = await argon2.verify(user.password, password)
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password"
                    }
                ]
            }
        }

        req.session!.userId = user.id

        return {
            user,
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() {req, res}: MyContext
    ) {
        return new Promise (resolve => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME)
            if (err) {
                console.log(err)
                resolve(false)
                return
            } 

            resolve(true)
        })
        )
    }
};