import { RouterContext, helpers } from "https://deno.land/x/oak/mod.ts";

const { getQuery } = helpers;
export const getQueryParams = getQuery;

export function getRouteParams<A>( context: RouterContext ): A {
  const params = context.params ?? {};

  return params as unknown as A;
}

export async function getBodyJSON<A=any>( context: RouterContext ): Promise<A> {
  if ( context.request.hasBody ) {
    const body = context.request.body( {type: 'json' });

    return (await body.value) as unknown as A;
  }
  else {
    return null as unknown as A;
  }
}
