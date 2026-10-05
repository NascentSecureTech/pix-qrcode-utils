// pix.nascent.com.br — Deno Deploy entrypoint.
// Replaces nginx static hosting + the oak server that ran on EC2.
//
//   /proxy?url=https://...  fetch a remote PIX payload URL (used by the QR decoder)
//   /codes/...              static files, served after a 3s delay (as on EC2)
//   /tools/pix-qr-decoder/  alias for the decoder at /
//   everything else         static files from ./public
//
// public/index.html and public/js/ are produced by `deno task build`.

import { serveDir } from "jsr:@std/http@1/file-server";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const TOKEN_PLACEHOLDER = "__PROXY_TOKEN__";

// Set PROXY_TOKEN_SECRET in Deno Deploy; the random fallback only works for a single isolate.
const secret = Deno.env.get("PROXY_TOKEN_SECRET") ?? crypto.randomUUID();
if (!Deno.env.get("PROXY_TOKEN_SECRET")) console.warn("PROXY_TOKEN_SECRET not set; using ephemeral secret");
const hmacKey = await crypto.subtle.importKey(
  "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"],
);

const toHex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

async function makeToken(): Promise<string> {
  const exp = String(Date.now() + TOKEN_TTL_MS);
  const sig = await crypto.subtle.sign("HMAC", hmacKey, new TextEncoder().encode(exp));
  return `${exp}.${toHex(sig)}`;
}

async function verifyToken(token: string | null): Promise<boolean> {
  const m = token?.match(/^(\d+)\.([0-9a-f]{64})$/);
  if (!m || Number(m[1]) < Date.now()) return false;
  const sig = Uint8Array.from(m[2].match(/../g)!, (h) => parseInt(h, 16));
  return crypto.subtle.verify("HMAC", hmacKey, sig, new TextEncoder().encode(m[1]));
}

async function serveIndex(req: Request): Promise<Response> {
  const res = await serveDir(req, { fsRoot: PUBLIC_DIR, quiet: true });
  if (res.status !== 200) return res;
  const html = (await res.text()).replace(TOKEN_PLACEHOLDER, await makeToken());
  const headers = new Headers({ "content-type": "text/html; charset=UTF-8", "cache-control": "no-store" });
  return new Response(html, { headers });
}

const PUBLIC_DIR = `${import.meta.dirname}/public`;
const CODES_DELAY_MS = 3000;

function isBlockedHost(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal")) return true;

  // IPv4 literals in private / loopback / link-local / CGNAT ranges
  const v4 = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    return a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168);
  }

  // IPv6 loopback / unique-local / link-local / v4-mapped
  if (h.includes(":")) {
    return h === "::" || h === "::1" || /^f[cd]/.test(h) || /^fe[89ab]/.test(h) || h.startsWith("::ffff:");
  }

  return false;
}

async function handleProxy(req: Request): Promise<Response> {
  const params = new URL(req.url).searchParams;
  if (!(await verifyToken(params.get("token")))) return new Response("Invalid token", { status: 401 });
  const remoteUrl = params.get("url");
  console.log("URL = ", remoteUrl);
  if (!remoteUrl) return new Response("Missing url", { status: 400 });

  let target: URL;
  try {
    target = new URL(remoteUrl);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (target.protocol !== "https:" || isBlockedHost(target.hostname)) {
    return new Response("Forbidden url", { status: 403 });
  }

  try {
    const response = await fetch(target, { redirect: "follow", signal: AbortSignal.timeout(110_000) });
    const finalUrl = new URL(response.url);
    if (finalUrl.protocol !== "https:" || isBlockedHost(finalUrl.hostname)) {
      return new Response("Forbidden redirect", { status: 403 });
    }
    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": "text/plain;charset=UTF-8" },
    });
  } catch (e) {
    console.log("Proxy Error: ", e);
    return new Response("Proxy Error", { status: 502 });
  }
}

const DECODER_ALIAS = "/tools/pix-qr-decoder";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const { pathname } = url;

  // Original server matched "/proxy" anywhere in the path.
  if (pathname.includes("/proxy")) return handleProxy(req);

  if (pathname === DECODER_ALIAS) {
    url.pathname += "/";
    return Response.redirect(url, 301);
  }
  if (pathname === `${DECODER_ALIAS}/` || pathname === `${DECODER_ALIAS}/index.html`) {
    url.pathname = "/";
    return serveIndex(new Request(url, req));
  }
  if (pathname === "/" || pathname === "/index.html") return serveIndex(req);

  if (pathname === "/codes" || pathname.startsWith("/codes/")) {
    await new Promise((r) => setTimeout(r, CODES_DELAY_MS));
  }

  return serveDir(req, { fsRoot: PUBLIC_DIR, quiet: true });
});
