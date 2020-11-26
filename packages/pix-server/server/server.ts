import { Application, send } from "https://deno.land/x/oak/mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";

const app = new Application();

app.use(async (context, next) => {
  try {
    if ( context.request.url.pathname.indexOf( '/proxy') < 0 ) {
      await next();
    }
    else {
      let remoteUrl = context.request.url.searchParams.get('url');

      console.log( "URL = ", remoteUrl);

      if ( remoteUrl ) {
        let response = (await fetch( remoteUrl, { mode: 'cors' } ) );

        context.response.status = response.status;
        context.response.type = response.type;

        context.response.body = await response.text();
      }
    }

  }
  catch( E ) {
    console.log( "Proxy Error: ", E );
  }
});

app.use(async (context) => {

  console.log( "Got Req:", context.request.url);

  try {
    await sleep( 60 );

    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  }
  catch( E ) {
    console.log( "Error: ", E );
  }
});

await app.listen({ port: 9666 });
