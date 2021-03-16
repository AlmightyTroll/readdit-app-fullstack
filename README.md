# readdit-app-fullstack
This reddit app using React, TypeScript, GraphQL, PostgreSQL.

## step 1:
   - Install dependencies & scripts:

### Devdependencies: 
   - typescript, @typs/node typescript, ts-node and nodemon.
   - types/node gives access to the different type info.
   - ts-node allows you to runs any ts file in node. wont be using this but have it setup anyway.
### scripts:
   - watch: tsc -w (creates a dist folder and a js file from the ts file. it recompiles our ts code and reruns it), dev: nodemon dist/index.js (reexecutes the js code everytime there is a change), start: "node dist/index.js".

#### install tsconfig.json file to configure typescript.
### dependencies: 
   - mikro-orm/cli, mikro-orm/core, mikro-orm/migrations, mikro-orm/postgresql, pg.
        - mikro-orm is how we interact with our database, create tables, insert data, select data etc..
