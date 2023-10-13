
export type AnyObject = Record<never,never>

//
export type FetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

//
export type FetchHeaders = Headers | Record<string, string>;

//
export type FetchQueryParams = Record<string, string>;

//
export interface FetchOptions {
  baseUrl?: string;

  headers?: FetchHeaders;

  debug?: boolean;

  privateKey?: BufferSource;

  clientCert?: BufferSource;
}

export class FetchError extends Error {
  json: string | AnyObject = "";

  constructor(public status: number, error: string | AnyObject) {
    super((typeof error == "string") ? error : `HTTP status ${status}`);

    if (typeof error !== "string") {
      this.json = error;
    }
  }
}

export const Fetcher = {
  //
  async fetchRequest(
    url: URL | string,
    fetchRequest: FetchRequest,
    options?: FetchOptions,
    isOK?: (status: number) => boolean
  ): Promise<Response> {
    const debug = options?.debug || true;

    try {
      if (debug) {
        console.log(fetchRequest?.method, decodeURIComponent(url.toString()));
      }

      const resp = await fetch(url, fetchRequest);

      const ok = isOK ? isOK(resp.status) : resp.status == 200;

      if (fetchRequest?.client) {
        fetchRequest.client.close();
      }

      if (debug) {
        console.log("\nRESP: ", resp.status);
        console.log("Headers: ", Object.fromEntries(resp.headers.entries()));
      }

      if (!ok) {
        const text = await resp.text();

        if (debug) {
          console.log(`Status: ${resp.status}\n${text}`);
        }

        if ((resp.headers.get("content-type") ?? "").startsWith("application/json")) {
          throw new FetchError(resp.status, text);
        }

        throw new FetchError(resp.status, `Fetch error: ${resp.status}\n${text}`);
      }

      return resp;
    } catch (e) {
      throw e;
    }
  },

  //
  buildFetchRequest(
    method: FetchMethod,
    options: FetchOptions,
    data?: unknown,
    additionalHeaders?: FetchHeaders
  ) {
    const headers = new Headers(options.headers);

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
      // deno-lint-ignore no-explicit-any
      (Deno as any).createHttpClient({
        certChain: new TextDecoder().decode(options.clientCert),
        privateKey: new TextDecoder().decode(options.privateKey),
      })
    //: undefined;

    const request: FetchRequest = {
      method: method,
      body,
      headers,
      client,
    };

    return request;
  },

  buildFetchPath(
    path: string,
    query?: FetchQueryParams,
    additionalQuery?: FetchQueryParams
  ): string {
    if (query || additionalQuery) {
      const queryParams = new URLSearchParams(query);

      if (additionalQuery) {
        const additionalParams = new URLSearchParams(additionalQuery);

        additionalParams.forEach((value, key) => {
          queryParams.append(key, value);
        });
      }

      const queryString = queryParams.toString();

      if (queryString.length > 0) {
        path += "?" + queryString;
      }

      //console.log( "?", queryString )
    }

    return path;
  }
}

// deno-lint-ignore no-explicit-any
export type FetchRequest = RequestInit & { client: any }; //ReturnType<typeof Fetcher.buildFetchRequest>;

