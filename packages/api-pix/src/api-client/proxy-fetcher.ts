import { IJSONFetcher, JSONFetcher, FetchOptions, FetchMethod, FetchHeaders } from './mod.ts';

export interface ProxyRequest {
  method: FetchMethod;
  url: string;
  headers: string;
  body?: string;
}

export interface ProxyResponse {
  status: number,
  body?: string;
}

export class ProxyFetcher implements IJSONFetcher {
  readonly fetcher: IJSONFetcher;
  readonly options: FetchOptions

  constructor( public readonly proxyUrl: string, options?: FetchOptions) {
    this.fetcher = new JSONFetcher();

    this.options = {
      debug: false,
      ...options,
    }
  }

  //
  async fetchJSON<DATA extends Object = Object, RET extends Object = Object>(
    method: FetchMethod,
    path: string,
    data?: DATA,
    additionalHeaders?: FetchHeaders,
    isOK?: (status: number) => boolean
  ): Promise<RET> {
    const url = new URL(path, this.options.baseUrl);

    try {
      if ( this.options.debug ) {
        console.log(method, decodeURIComponent(url.toString()));
      }

      let fetchRequest = JSONFetcher.buildFetchRequest( this.options, method, data, additionalHeaders );

      const req: ProxyRequest = {
        method,
        url: url.toString(),
        body: fetchRequest.body,
        headers: JSON.stringify( Object.fromEntries( fetchRequest.headers.entries() ) )
      }

      const resp = await fetch(this.proxyUrl, {
        method: "POST",
        body: JSON.stringify(req),
        headers: {
          'content-type': 'application/json',
          'accept': 'applicaton/json'
        }
      });

      if ( resp.status != 200 ) {

      }

      const proxyResp: ProxyResponse = await resp.json();

      const ok = isOK ? isOK(proxyResp.status) : ( proxyResp.status == 200 );

      if (!ok) {
        const text = proxyResp.body ?? "";

        throw new Error(`Fetch error: ${proxyResp.status}\n${text}`);
      }

      //console.log("headers-resp", resp.headers);

      //console.log(json);

      return (proxyResp.body) ? JSON.parse( proxyResp.body ) : undefined;
    } catch (e) {
      throw e;
    }
  }
}
