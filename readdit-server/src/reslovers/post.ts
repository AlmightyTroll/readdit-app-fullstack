import { Post } from '../entities/Post';
import { Arg, Int, Mutation, Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver { //1st graphql querry. our schema is a single querry that says hello world.
    @Query(() => [Post]) // [Type]
    async posts(): Promise<Post[]> {
        return Post.find()
    }

    @Query(() => Post, { nullable: true })  
    post(
        @Arg('id', () => Int) id: number,
    ): Promise<Post | undefined> {
        return Post.findOne(id)
    }

    @Mutation(() => Post) 
    async createPost(
        @Arg('title') title: string, // title type of string is inferred by TS already so we don't need to asign it.
    ): Promise<Post> {
        return Post.create({title}).save() // 2 SQL queries. 1 to insert and 1 to select. 
    }

    @Mutation(() => Post, { nullable: true }) 
    async updatePost(
        @Arg('id') id: number, 
        @Arg('title', () => String, { nullable: true }) title: string, 
    ): Promise<Post | null> {
        const post = await Post.findOne(id) // 1 SQL query to select 
        if (!post) {
            return null
        }
        if (typeof title !== 'undefined') {
            await Post.update({id}, {title}) // 1 SQL query to insert.
        }
        return post
    } 

    @Mutation(() => Boolean) 
    async deletePost(
        @Arg('id') id: number, 
    ): Promise<boolean> {
        await Post.delete(id)
        return true
    }
};