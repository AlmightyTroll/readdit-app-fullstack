import { Post } from "./entities/Post";
import { __prod__ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/, // migrations file pattern
    }, 
    entities: [Post, User],
    dbName: "readdit",
    type: "postgresql",
    password: "postgres",
    debug: !__prod__  
} as Parameters<typeof MikroORM.init>[0]; // Grabs the type of the init function. confirms type is right and allows us to continue the autocompletion.
