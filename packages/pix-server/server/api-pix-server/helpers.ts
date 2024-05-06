import { RouterContext } from "https://deno.land/x/oak/mod.ts";

export function getRouteParams<A,S extends string>( context: RouterContext<S> ): A {
  const params = context.params ?? {};

  return params as unknown as A;
}

export async function getBodyJSON<A=any, S extends string=string>( context: RouterContext<S> ): Promise<A> {
  if ( context.request.hasBody ) {
    const body = context.request.body.json(); 

    return (await body) as unknown as A;
  }
  else {
    return null as unknown as A;
  }
}
