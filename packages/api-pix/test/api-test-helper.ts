import {
  ClientCredentialsFlowClient,
  FetchError,
  JSONFetcher,
  FetchOptions,
  OAuth2ClientConfig,
  OAuth2Token,
} from "../src/mod.ts";
import { CobClient } from "../src/mod.ts";

export type AnyObject = Record<never, never>

const config = {
  ...(await import("./test-credentials.ts")).banrisulHomolNascent, //siCoob, // bancoDoBrasil, //gerenciaNet, //banrisulDev, //

  //debug: true,
};

const clientCache: Record<string, CobClient> = {};

export async function initCobClient(cobType: "cob" | "cobv" = "cobv") {
  if (clientCache[cobType]) {
    return clientCache[cobType];
  }

  const token = await authenticate(config);
  const fetcher = getFetcher(config, token);

  // BB requires a non-standard query-param
  const gwAppKey = (config as Record<string, string>)["gw-dev-app-key"];

  const client = new CobClient(
    fetcher,
    cobType,
    gwAppKey ? { "gw-dev-app-key": gwAppKey } : undefined
  );

  clientCache[cobType] = client;

  return client;
}

export async function authenticate(config: OAuth2ClientConfig) {
  const fetcher = getFetcher(config);

  const ccf = new ClientCredentialsFlowClient(config, fetcher);

  const token = await ccf.getAccessToken("cob.read cob.write pix.read");
  //console.log("TOKEN:", token);

  return token;
}

export function getFetcher(config: { baseUrl?: string, privateKey?: BufferSource, clientCert?: BufferSource, debug?: boolean }, token?: OAuth2Token) {
  const hdrs = token && {
    authorization: token.tokenType + " " + token.accessToken,
  };

  const fetchOptions: FetchOptions = {
    baseUrl: config.baseUrl,
    headers: hdrs,
    privateKey: config.privateKey,
    clientCert: config.clientCert,
    debug: config.debug ?? false,
  };

  //console.log( fetchOptions )
  return new JSONFetcher(fetchOptions);
}

export async function mustFail(testName: string, testFn: () => Promise<unknown>, status: number[]): Promise<{ status: number, json: unknown }> {
  console.log(`Test: ${testName}`);

  try {
    await testFn();

    throw new Error("Should have failed");
  }
  catch (e) {
    if (e instanceof FetchError) {
      if (status.indexOf(e.status) >= 0) {
        console.log(`PASS: ${e.status} - ${JSON.stringify(e.json)}`)

        return {
          status: e.status,
          json: e.json
        }
      }
    }

    throw e;
  }
}

export function generateTXID() {
  const txid: string = crypto.randomUUID();

  return txid.replaceAll("-", "");
}

export async function timedExec<STATE = AnyObject>(args: {
  name?: string,
  init?: (count: number, state: STATE) => Promise<STATE> | undefined,
  exec: (iter: number, state: STATE) => Promise<void>,
  cleanup?: (count: number, state: STATE) => Promise<void>,
  count?: number
}) {
  const count = args.count ?? 1
  const times: number[] = [];
  let state = {} as STATE;

  // 1st exec
  if (args.init)
    state = (await args.init(count, state)) ?? state;

  for (let iter = 0; iter < count; ++iter) {
    const initTime = Date.now();

    await args.exec(iter, state);

    const elapsed = Date.now() - initTime;

    times.push(elapsed);
  }

  if (args.cleanup)
    await args.cleanup(count, state);

  const sum = times.reduce((prev, cur) => prev + cur, 0);
  const max = times.reduce((prev, cur) => (cur > prev) ? cur : prev, 0);
  const min = times.reduce((prev, cur) => (cur < prev) ? cur : prev, times[0]);
  const avg = sum / count;
  const med = times.sort((a, b) => (a - b))[Math.floor(count / 2)];

  if (args.name)
    console.log(args.name);

  console.log(`total(${count}):${sum}ms, min:${min}ms, max:${max}ms, avg:${avg}ms, median:${med}ms`);
}

export async function timedExecParallel<STATE = AnyObject>(args: {
  name?: string,
  init?: (count: number, state: STATE) => Promise<STATE> | undefined,
  exec: (iter: number, state: STATE) => Promise<void>,
  cleanup?: (count: number, state: STATE) => Promise<void>,
  count?: number
}) {
  const count = args.count ?? 1
  const times: number[] = [];
  let state = {} as STATE;

  // 1st exec
  if (args.init)
    state = (await args.init(count, state)) ?? state;

  const proms = [];

  const initTime = Date.now();
  for (let iter = 0; iter < count; ++iter) {
    //    console.log( `${iter}: ${initTime}`)
    proms.push(
      args.exec(iter, state)
        .then(() => {
          const elapsed = Date.now() - initTime;
          //console.log( `${iter}: ${Date.now()} = ${elapsed}`)

          times.push(elapsed);
        })
    );
  }
  const finish = Date.now() - initTime;

  const res = await Promise.allSettled(proms);
  const ok = res.filter(p => p.status == "fulfilled").length;

  if (args.cleanup)
    await args.cleanup(count, state);

  const sum = times.reduce((prev, cur) => prev + cur, 0);
  const max = times.reduce((prev, cur) => (cur > prev) ? cur : prev, 0);
  const min = times.reduce((prev, cur) => (cur < prev) ? cur : prev, times[0]);
  const avg = sum / count;
  const med = times.sort((a, b) => (a - b))[Math.floor(count / 2)];

  if (args.name)
    console.log(args.name);

  console.log(`tps(${ok}/${count})=${Math.round(count * 1000 / max * 100) / 100}tps, send=${finish} first=${min}ms, last=${max}ms, avg=${avg}ms, median=${med}ms`);
}
