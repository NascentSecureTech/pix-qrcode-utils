//
export type FetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

//
export type FetchHeaders = Headers | Record<string, string>;

//
export type FetchQueryParams = Record<string, string>;

//
export interface IJSONFetcher {
  readonly options: FetchOptions;

  fetchJSON<RET extends Object = Object>(
    method: FetchMethod,
    path: string
  ): Promise<RET>;

  fetchJSON<DATA = object, RET = object>(
    method: FetchMethod,
    path: string,
    data?: DATA,
    additionalHeaders?: FetchHeaders,
    isOK?: (status: number) => boolean
  ): Promise<RET>;
}

//
export interface FetchOptions {
  baseUrl?: string;

  headers?: FetchHeaders;

  debug?: boolean;

  privateKey?: any;

  clientCert?: any;
}

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
  async fetchJSON<DATA extends Object = Object, RET extends Object = Object>(
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

      let fetchRequest = IJSONFetcher.buildFetchRequest(
        this.options,
        method,
        data,
        additionalHeaders
      );

      const resp = await fetch(url, fetchRequest);

      const ok = isOK ? isOK(resp.status) : resp.status == 200;

      if (fetchRequest.client) {
        fetchRequest.client.close();
      }

      if (this.options.debug) {
        console.log("\nRESP: ", resp.status);
        console.log("Headers: ", Object.fromEntries(resp.headers.entries()));
      }

      if (!ok) {
        const text = await resp.text();

        if (this.options.debug) {
          console.log(`Status: ${resp.status}\n${text}`);
        }

        throw new Error(`Fetch error: ${resp.status}\n${text}`);
      }

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

export namespace IJSONFetcher {
  //
  export function buildFetchRequest(
    options: FetchOptions,
    method: FetchMethod,
    data: any,
    additionalHeaders?: FetchHeaders
  ) {
    let headers = new Headers(options.headers);

    if (additionalHeaders) {
      new Headers(additionalHeaders).forEach((value, key) => {
        headers.append(key, value);
      });
    }

    let body: string | undefined;

    if (typeof data === "string") {
      body = data;
    } else if (data instanceof URLSearchParams) {
      body = data.toString();
      headers.set("content-type", "application/x-www-form-urlencoded");
    } else if (typeof data === "object") {
      body = JSON.stringify(data);
      headers.append("content-type", "application/json");
    } else {
      body = undefined;
    }

    if (options.debug) {
      console.log("Headers: ", Object.fromEntries(headers.entries()));
      if (body) {
        console.log("Body:", body);
      }
    }

    const client =
      options.privateKey && options.clientCert && 
         (Deno as any).createHttpClient({
            certChain: new TextDecoder().decode(options.clientCert),
            privateKey: new TextDecoder().decode(options.privateKey),
          })
        //: undefined;

    let request = {
      method: method,
      body,
      headers,
      client,
    }; // as RequestInit;

    return request;
  }

  export function buildFetchPath(
    path: string,
    query?: FetchQueryParams,
    additionalQuery?: FetchQueryParams
  ): string {
    if (query || additionalQuery) {
      let queryParams = new URLSearchParams(query);

      if (additionalQuery) {
        let additionalParams = new URLSearchParams(additionalQuery);

        additionalParams.forEach((value, key) => {
          queryParams.append(key, value);
        });
      }

      let queryString = queryParams.toString();

      if (queryString.length > 0) {
        path += "?" + queryString;
      }

      //console.log( "?", queryString )
    }

    return path;
  }
}
