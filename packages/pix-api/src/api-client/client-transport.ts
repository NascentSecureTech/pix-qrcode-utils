export type FetchMethodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface IFetchClient {
  baseUrl?: string;

  fetchJSON<RET extends Object = Object>(
    method: FetchMethodType,
    path: string
  ): Promise<RET>;

  fetchJSON<DATA = object, RET = object>(
    method: FetchMethodType,
    path: string,
    data?: DATA
  ): Promise<RET>;
}

export function buildPath(
  path: string,
  query?: Record<string, string>,
  additionalQuery?: Record<string, string>
): string {
  if (query || additionalQuery) {
    let queryParams = new URLSearchParams(query);

    if ( additionalQuery ) {
      let additionalParams = new URLSearchParams(additionalQuery);
      additionalParams.forEach( (value, key) => {
        queryParams.append( key, value );
      })
    }

    let queryString = queryParams.toString();

    if (queryString.length > 0) {
      path += "?" + queryString;
    }

    console.log( "?", queryString )
  }

  return path;
}

export interface IClientTransport {
  readonly client: IFetchClient;

  //
  get<RET extends Object = Object>(
    path: string,
    query: Record<string, string>
  ): Promise<RET>;

  //
  put<DATA extends Object = Object, RET extends Object = Object>(
    path: string,
    data: DATA
  ): Promise<RET>;

  //
  patch<DATA extends Object = Object, RET extends Object = Object>(
    path: string,
    data: DATA
  ): Promise<RET>;

  //
  delete<DATA extends Object = Object, RET extends Object = Object>(
    path: string,
    data: DATA
  ): Promise<RET>;
}

//
export class ClientTransport implements IClientTransport {
  constructor(public readonly client: IFetchClient) {
  }

  //
  get<RET extends Object = Object>(path: string): Promise<RET> {
    return this.client.fetchJSON<RET>("GET", path);
  }

  //
  put<DATA extends Object = Object, RET extends Object = Object>(
    path: string,
    data: DATA
  ): Promise<RET> {
    return this.client.fetchJSON<DATA, RET>("PUT", path, data);
  }

  //
  patch<DATA extends Object = Object, RET extends Object = Object>(
    path: string,
    data: DATA
  ): Promise<RET> {
    return this.client.fetchJSON<DATA, RET>("PATCH", path, data);
  }

  //
  delete<DATA extends Object = Object, RET extends Object = Object>(
    path: string,
    data: DATA
  ): Promise<RET> {
    return this.client.fetchJSON<DATA, RET>("PUT", path, data);
  }
}
