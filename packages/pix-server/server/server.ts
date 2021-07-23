import { Application, send } from "https://deno.land/x/oak/mod.ts";
//import { sleep } from "https://deno.land/x/sleep/mod.ts";
import { apiRouter } from './api-pix-server/api-pix-server.ts';

const app = new Application();

app.use(async (context, next) => {
  try {
    if ( context.request.url.pathname.indexOf( '/proxy') < 0 ) {
      await next();
    }
    else {
      const remoteUrl = context.request.url.searchParams.get('url');

      console.log( "URL = ", remoteUrl);

      if ( remoteUrl ) {
        const response = (await fetch( remoteUrl, { mode: 'cors' } ) );

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

const api = apiRouter();

app.use( api.routes(), api.allowedMethods() );

/*app.use(async (context) => {

  console.log( "Got Req:", context.request.url);
  console.log( "Headers: " ); context.request.headers.forEach( (v,k) => { console.log( k + ': ' + v ); } );

  try {
    //await sleep( 60 );

    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  }
  catch( E ) {
    console.log( "Error: ", E );
  }
});*/

await app.listen({ port: 9666 });
