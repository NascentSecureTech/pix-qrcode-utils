import { IFetchClient, FetchMethodType } from "./client-transport.ts";

export interface W3CFetchOptions {
  headers?: Headers | Record<string,string>;

  debug?: boolean;
}
export class W3CFetchClient implements IFetchClient {
  private options: Required<W3CFetchOptions>;

  constructor(public readonly baseUrl?: string, options?: W3CFetchOptions) {
    this.options = {
      headers: new Headers(options?.headers),
      debug: options?.debug ?? false
    }
  }

  //
  async fetchJSON<DATA extends Object = Object, RET extends Object = Object>(
    method: FetchMethodType,
    path: string,
    data?: DATA,
    additionalHeaders?: HeadersInit,
    isOK?: (resp: Response) => boolean
  ): Promise<RET> {
    const url = new URL(path, this.baseUrl);

    try {
      if ( this.options.debug ) {
        console.log(method, decodeURIComponent(url.toString()));
      }

      let headers = new Headers(this.options.headers);
      if (additionalHeaders) {
        new Headers(additionalHeaders).forEach((value, key) => {
          headers.append(key, value);
        });
      }

      let body: BodyInit | undefined;

      if (typeof data === "string") {
        body = data;
      } else if (data instanceof URLSearchParams) {
        body = data;
        headers.delete('content-type')
      } else if (typeof data === "object") {
        body = JSON.stringify(data);
        headers.append('content-type', 'application/json')
      }

      //console.log("Headers: ", headers);
      //console.log( body )

      const resp = await fetch(url, {
        method: method,
        body,
        headers,
      });

      let ok = isOK ? isOK(resp) : resp.status == 200;

      if (!ok) {
        const text = await resp.text();

        throw new Error(`Fetch error: ${resp.status}\n${text}`);
      }

      //console.log("headers-resp", resp.headers);
      const json = resp.json();

      //console.log(json);

      return json;
    } catch (e) {
      throw e;
    }
  }
}
