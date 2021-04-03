import { Cache, QueryInput } from '@urql/exchange-graphcache';

//WHERE WE ARE CREATING THE URQL CLIENT.
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query) {
  return cache.updateQuery(qi, data => fn(result, data as any) as any);
}
