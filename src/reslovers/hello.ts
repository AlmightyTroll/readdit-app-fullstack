import { Query, Resolver } from 'type-graphql';

@Resolver()
export class HelloResolver { //1st graphql querry. our schema is a single querry that says hello world.
    @Query(() => String)
    hello() {
        return "hello world"
    }
}