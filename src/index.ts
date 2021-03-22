import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './reslovers/hello';

const main = async () => {
    //console.log("dirname: ", __dirname)
    const orm = await MikroORM.init(mikroConfig)
    await orm.getMigrator().up() // auto run migrations:

    const app = express()
    app.listen(4000, ()=> {
        console.log("server started on localhost:4000") // Just a test
    })

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            validate: false
        })
    })

    apolloServer.applyMiddleware({ app })

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
