import "reflect-metadata";
import { MikroORM } from '@mikro-orm/core';
import { COOKIE_NAME, __prod__ } from './constants';
//import { Post } from './entities/Post';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './reslovers/hello';
import { PostResolver } from './reslovers/post';
import { UserResolver } from "./reslovers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from "cors";

const main = async () => {
    console.log("dirname: ", __dirname)
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up() // auto run migrations:

    const app = express()
    app.listen(4000, ()=> {
        console.log("server started on localhost:4000") // Just a test
    })

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }))

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ client: redisClient, disableTouch: true, disableTTL: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax', // protects the csrf.
                secure: __prod__ // cookie only works in https. if we are in prod, set secure to prod which = true. production will be in https but not build.
            },
            saveUninitialized: false,
            secret: 'djdjdmasoakdwqfbsdfbsfn',
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res })
    })

    apolloServer.applyMiddleware({ app, cors: false })

    app.get('/', (_, res) => {
        res.send("Hello")
    })


    // const post = orm.em.create(Post, {title: "my first post"})
    // await orm.em.persistAndFlush(post)

    // const posts = await orm.em.find(Post, {})
    // console.log(posts)

    // console.log("------SQL 2--------")
    // await orm.em.nativeInsert(Post, {title: "my 2nd post"})
};

main().catch((err) => {
    console.error(err)
}); // throws an error in the console if it catches an error.
