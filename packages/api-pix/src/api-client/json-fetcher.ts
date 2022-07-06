import { FetchMethod, FetchHeaders, FetchOptions, Fetcher, AnyObject } from './fetcher.ts';

/*//
export type FetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

//
export type FetchHeaders = Headers | Record<string, string>;

//
export type FetchQueryParams = Record<string, string>;
*/
//
export interface IJSONFetcher {
  readonly options: FetchOptions;

  fetchJSON<RET extends AnyObject = AnyObject>(
    method: FetchMethod,
    path: string
  ): Promise<RET>;

  fetchJSON<DATA = AnyObject, RET = AnyObject>(
    method: FetchMethod,
    path: string,
    data?: DATA,
    additionalHeaders?: FetchHeaders,
    isOK?: (status: number) => boolean
  ): Promise<RET>;
}

/*
export interface FetchOptions {
  baseUrl?: string;

  headers?: FetchHeaders;

  debug?: boolean;

  privateKey?: any;

  clientCert?: any;
}*/

//
export class JSONFetcher implements IJSONFetcher {
  readonly options: FetchOptions;

  constructor(options?: FetchOptions) {
    this.options = {
      ...options,
    };

    //console.log( "JSONFetcher options:", options )
  }

  //
  async fetchJSON<DATA extends AnyObject = AnyObject, RET extends AnyObject = AnyObject>(
    method: FetchMethod,
    path: string,
    data?: DATA,
    additionalHeaders?: FetchHeaders,
    isOK?: (status: number) => boolean
  ): Promise<RET> {
    const url = new URL(path, this.options.baseUrl);

    try {
      if (this.options.debug) {
        console.log(method, decodeURIComponent(url.toString()));
      }

      const fetchRequest = Fetcher.buildFetchRequest(
        method,
        this.options,
        data,
        additionalHeaders
      );

      //const resp = await fetch(url, fetchRequest);
      const resp = await Fetcher.fetchRequest(url, fetchRequest, this.options, isOK);

      let json;

      if (
        !(resp.headers.get("content-type") ?? "").startsWith("application/json")
      ) {
        // Did not get JSON .. oops
        if (this.options.debug) {
          console.log(await resp.text());
        }

        throw new Error(
          `Fetch error: Response is not JSON. Content-type = '${resp.headers.get(
            "content-type"
          )}'`
        );
      } else {
        // got some JSON .. great!
        json = await resp.json();

        if (this.options.debug) {
          console.log("Body:", json);
        }
      }

      return json;
    } catch (e) {
      throw e;
    }
  }
}
