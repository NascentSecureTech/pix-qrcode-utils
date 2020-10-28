// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("https://deno.land/x/base64@v0.2.1/base", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function getLengths(b64) {
        const len = b64.length;
        let validLen = b64.indexOf("=");
        if (validLen === -1) {
            validLen = len;
        }
        const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
        return [validLen, placeHoldersLen];
    }
    function init(lookup, revLookup, urlsafe = false) {
        function _byteLength(validLen, placeHoldersLen) {
            return Math.floor(((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen);
        }
        function tripletToBase64(num) {
            return (lookup[(num >> 18) & 0x3f] +
                lookup[(num >> 12) & 0x3f] +
                lookup[(num >> 6) & 0x3f] +
                lookup[num & 0x3f]);
        }
        function encodeChunk(buf, start, end) {
            const out = new Array((end - start) / 3);
            for (let i = start, curTriplet = 0; i < end; i += 3) {
                out[curTriplet++] = tripletToBase64((buf[i] << 16) + (buf[i + 1] << 8) + buf[i + 2]);
            }
            return out.join("");
        }
        return {
            byteLength(b64) {
                return _byteLength.apply(null, getLengths(b64));
            },
            toUint8Array(b64) {
                const [validLen, placeHoldersLen] = getLengths(b64);
                const buf = new Uint8Array(_byteLength(validLen, placeHoldersLen));
                const len = placeHoldersLen ? validLen - 4 : validLen;
                let tmp;
                let curByte = 0;
                let i;
                for (i = 0; i < len; i += 4) {
                    tmp = (revLookup[b64.charCodeAt(i)] << 18) |
                        (revLookup[b64.charCodeAt(i + 1)] << 12) |
                        (revLookup[b64.charCodeAt(i + 2)] << 6) |
                        revLookup[b64.charCodeAt(i + 3)];
                    buf[curByte++] = (tmp >> 16) & 0xff;
                    buf[curByte++] = (tmp >> 8) & 0xff;
                    buf[curByte++] = tmp & 0xff;
                }
                if (placeHoldersLen === 2) {
                    tmp = (revLookup[b64.charCodeAt(i)] << 2) |
                        (revLookup[b64.charCodeAt(i + 1)] >> 4);
                    buf[curByte++] = tmp & 0xff;
                }
                else if (placeHoldersLen === 1) {
                    tmp = (revLookup[b64.charCodeAt(i)] << 10) |
                        (revLookup[b64.charCodeAt(i + 1)] << 4) |
                        (revLookup[b64.charCodeAt(i + 2)] >> 2);
                    buf[curByte++] = (tmp >> 8) & 0xff;
                    buf[curByte++] = tmp & 0xff;
                }
                return buf;
            },
            fromUint8Array(buf) {
                const maxChunkLength = 16383;
                const len = buf.length;
                const extraBytes = len % 3;
                const len2 = len - extraBytes;
                const parts = new Array(Math.ceil(len2 / maxChunkLength) + (extraBytes ? 1 : 0));
                let curChunk = 0;
                let chunkEnd;
                for (let i = 0; i < len2; i += maxChunkLength) {
                    chunkEnd = i + maxChunkLength;
                    parts[curChunk++] = encodeChunk(buf, i, chunkEnd > len2 ? len2 : chunkEnd);
                }
                let tmp;
                if (extraBytes === 1) {
                    tmp = buf[len2];
                    parts[curChunk] = lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f];
                    if (!urlsafe)
                        parts[curChunk] += "==";
                }
                else if (extraBytes === 2) {
                    tmp = (buf[len2] << 8) | (buf[len2 + 1] & 0xff);
                    parts[curChunk] = lookup[tmp >> 10] +
                        lookup[(tmp >> 4) & 0x3f] +
                        lookup[(tmp << 2) & 0x3f];
                    if (!urlsafe)
                        parts[curChunk] += "=";
                }
                return parts.join("");
            },
        };
    }
    exports_1("init", init);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/base64@v0.2.1/mod", ["https://deno.land/x/base64@v0.2.1/base"], function (exports_2, context_2) {
    "use strict";
    var base_ts_1, lookup, revLookup, code, _a, byteLength, toUint8Array, fromUint8Array;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (base_ts_1_1) {
                base_ts_1 = base_ts_1_1;
            }
        ],
        execute: function () {
            lookup = [];
            revLookup = [];
            code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            for (let i = 0, l = code.length; i < l; ++i) {
                lookup[i] = code[i];
                revLookup[code.charCodeAt(i)] = i;
            }
            revLookup["-".charCodeAt(0)] = 62;
            revLookup["_".charCodeAt(0)] = 63;
            _a = base_ts_1.init(lookup, revLookup), exports_2("byteLength", byteLength = _a.byteLength), exports_2("toUint8Array", toUint8Array = _a.toUint8Array), exports_2("fromUint8Array", fromUint8Array = _a.fromUint8Array);
        }
    };
});
System.register("file:///Users/sean/Projects/deno/pix-qrcode-utils/packages/pix-payload/src/fetch-payload", ["https://deno.land/x/base64@v0.2.1/mod"], function (exports_3, context_3) {
    "use strict";
    var base64, url, PIXPayloadRetriever;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (base64_1) {
                base64 = base64_1;
            }
        ],
        execute: function () {
            url = "apidev.banrisul.com.br/pix/qrcode/R4upP-FJICfcIcsouWXSyar1F0Q";
            PIXPayloadRetriever = class PIXPayloadRetriever {
                constructor() {
                }
                fetchPayload(_url) {
                    fetch("https://" + url)
                        .then((response) => {
                        return response.text();
                    })
                        .then((jws) => {
                        console.log(jws);
                        let parts = jws.split('.')
                            .map((b64) => base64.toUint8Array(b64))
                            .map((u8) => new TextDecoder().decode(u8));
                        return parts[1];
                    })
                        .then((json) => {
                        let payload = JSON.parse(json);
                        console.log(payload);
                    })
                        .catch((error) => console.log(error.message));
                }
            };
            exports_3("PIXPayloadRetriever", PIXPayloadRetriever);
            new PIXPayloadRetriever().fetchPayload(url);
        }
    };
});
System.register("file:///Users/sean/Projects/deno/pix-qrcode-utils/packages/pix-payload/src/pix-payload", ["file:///Users/sean/Projects/deno/pix-qrcode-utils/packages/pix-payload/src/fetch-payload"], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_4(exports);
    }
    return {
        setters: [
            function (fetch_payload_ts_1_1) {
                exportStar_1(fetch_payload_ts_1_1);
            }
        ],
        execute: function () {
        }
    };
});

const __exp = __instantiate("file:///Users/sean/Projects/deno/pix-qrcode-utils/packages/pix-payload/src/pix-payload", false);
export const PIXPayloadRetriever = __exp["PIXPayloadRetriever"];
