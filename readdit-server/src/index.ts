import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './reslovers/hello';
import { PostResolver } from './reslovers/post';
import { UserResolver } from "./reslovers/user";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from "cors";
import {createConnection} from 'typeorm';
import { User } from "./entities/User";
import { Post } from "./entities/Post";

const main = async () => {
    const connection = await createConnection({
        type: 'postgres',
        database: 'readit',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true, // creates tables automattically for you and you don't need to run a migration.
        entities: [Post, User]
    })
    

    const app = express()
    app.listen(4000, ()=> {
        console.log("server started on localhost:4000") // Just a test
    })

    const RedisStore = connectRedis(session)
    const redis = new Redis()

    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }))

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ client: redis, disableTouch: true, disableTTL: true }),
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
        context: ({ req, res }) => ({ req, res, redis })
    })

    apolloServer.applyMiddleware({ app, cors: false })

    app.get('/', (_, res) => {
        res.send("Hello")
    })
}

main().catch((err) => {
    console.error(err)
}); // throws an error in the console if it catches an error.
