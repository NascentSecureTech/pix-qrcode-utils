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
      const e = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(e)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
      return v;
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

System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/data-utils", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function stringToHex(str) {
        let buf = new TextEncoder().encode(str);
        return [...buf]
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }
    exports_1("stringToHex", stringToHex);
    function numToHex(n, digits) {
        let hex = n.toString(16).toUpperCase();
        if (digits) {
            return ("0".repeat(digits) + hex).slice(-digits);
        }
        return (hex.length % 2 == 0) ? hex : "0" + hex;
    }
    exports_1("numToHex", numToHex);
    function valueIn(setof, value) {
        return setof.indexOf(value) >= 0;
    }
    exports_1("valueIn", valueIn);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/crc", ["file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/data-utils"], function (exports_2, context_2) {
    "use strict";
    var data_utils_ts_1;
    var __moduleName = context_2 && context_2.id;
    function computeCRC(str, invert = false) {
        const bytes = new TextEncoder().encode(str);
        const crcTable = [0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d, 0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823, 0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a, 0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067, 0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d, 0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634, 0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a, 0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1, 0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0];
        let crc = 0xFFFF;
        for (let i = 0; i < bytes.length; i++) {
            const c = bytes[i];
            const j = (c ^ (crc >> 8)) & 0xFF;
            crc = crcTable[j] ^ (crc << 8);
        }
        let answer = ((crc ^ 0) & 0xFFFF);
        let hex = data_utils_ts_1.numToHex(answer);
        if (invert)
            return hex.slice(2) + hex.slice(0, 2);
        return hex;
    }
    exports_2("computeCRC", computeCRC);
    return {
        setters: [
            function (data_utils_ts_1_1) {
                data_utils_ts_1 = data_utils_ts_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/qrcode-validator", ["file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/crc"], function (exports_3, context_3) {
    "use strict";
    var crc_ts_1, QRErrorCode, QRCodeError, mandatoryElements, QRCodeValidator;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (crc_ts_1_1) {
                crc_ts_1 = crc_ts_1_1;
            }
        ],
        execute: function () {
            (function (QRErrorCode) {
                QRErrorCode[QRErrorCode["OK"] = 0] = "OK";
                QRErrorCode[QRErrorCode["INVALID_QRCODE"] = 1] = "INVALID_QRCODE";
                QRErrorCode[QRErrorCode["CRC_MISMATCH"] = 2] = "CRC_MISMATCH";
                QRErrorCode[QRErrorCode["MISSING_MANDATORY_ELEMENT"] = 3] = "MISSING_MANDATORY_ELEMENT";
            })(QRErrorCode || (QRErrorCode = {}));
            exports_3("QRErrorCode", QRErrorCode);
            QRCodeError = class QRCodeError extends Error {
                constructor(errorCode, message) {
                    super(message);
                    this.errorCode = errorCode;
                }
            };
            exports_3("QRCodeError", QRCodeError);
            mandatoryElements = [
                0,
                52,
                53,
                58,
                59,
                60,
                63
            ];
            (function (QRCodeValidator) {
                function validateRoot(root) {
                    if (root.getElement(0).baseOffset != 0) {
                        throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "Missing start element (00)");
                    }
                    let crcEl = root.getElement(63);
                    if ((crcEl.baseOffset != root.content.length - 8) || (root.content.slice(-8, -4) != '6304')) {
                        throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "CRC must be final element (63)");
                    }
                    let calculatedCRC = crc_ts_1.computeCRC(root.content.slice(0, -4));
                    if (calculatedCRC != crcEl.content) {
                        throw new QRCodeError(QRErrorCode.CRC_MISMATCH, "Invalid CRC");
                    }
                    let maiList = Array.from(root.elements.keys()).filter((v) => (v >= 2) && (v <= 51));
                    if (maiList.length == 0) {
                        throw new QRCodeError(QRErrorCode.MISSING_MANDATORY_ELEMENT, "Must have at least one Merchant Account Information");
                    }
                    mandatoryElements.forEach((tag) => {
                        if (!root.hasElement(tag))
                            throw new QRCodeError(QRErrorCode.MISSING_MANDATORY_ELEMENT, "Missing mandatory tag (" + tag + ")");
                    });
                }
                QRCodeValidator.validateRoot = validateRoot;
            })(QRCodeValidator || (QRCodeValidator = {}));
            exports_3("QRCodeValidator", QRCodeValidator);
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/qrcode-node", ["file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/data-utils", "file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/qrcode-validator"], function (exports_4, context_4) {
    "use strict";
    var data_utils_ts_2, qrcode_validator_ts_1, TAG_INIT, TAG_CRC, QRCodeNode;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (data_utils_ts_2_1) {
                data_utils_ts_2 = data_utils_ts_2_1;
            },
            function (qrcode_validator_ts_1_1) {
                qrcode_validator_ts_1 = qrcode_validator_ts_1_1;
            }
        ],
        execute: function () {
            exports_4("TAG_INIT", TAG_INIT = 0);
            exports_4("TAG_CRC", TAG_CRC = 63);
            QRCodeNode = class QRCodeNode {
                constructor(type, content, tag, baseOffset = 0) {
                    this.type = type;
                    this.baseOffset = baseOffset;
                    this.tag = tag;
                    this._content = content;
                    switch (type) {
                        case "root":
                        case "template":
                            this.elements = this.parseElementSequence(content, baseOffset);
                            break;
                        default:
                            this.elements = new Map();
                    }
                }
                isType(type) { return this.type == type; }
                ;
                isTemplate() { return this.isType('template') || this.isType('identified-template'); }
                get content() {
                    return this._content;
                }
                set content(content) {
                    this._content = content;
                }
                parseElementSequence(sequence, baseOffset = 0) {
                    let elements = new Map();
                    let end = sequence.length;
                    let index = 0;
                    while (index + 4 < end) {
                        let pos = baseOffset + index;
                        if (!/^\d{4}$/.test(sequence.substr(index, 4))) {
                            throw new qrcode_validator_ts_1.QRCodeError(qrcode_validator_ts_1.QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: invalid tag or length characters @ " + (1 + pos));
                        }
                        let tag = parseInt(sequence.substr(index, 2));
                        let len = parseInt(sequence.substr(index + 2, 2));
                        if (index + len + 4 > end) {
                            throw new qrcode_validator_ts_1.QRCodeError(qrcode_validator_ts_1.QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: invalid length @" + (1 + pos));
                        }
                        let content = sequence.substr(index + 2 + 2, len);
                        elements.set(tag, new QRCodeNode('element', content, tag, pos));
                        index += 4 + len;
                    }
                    if (index != end) {
                        throw new qrcode_validator_ts_1.QRCodeError(qrcode_validator_ts_1.QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: extra characters at end @" + (1 + baseOffset + index));
                    }
                    return elements;
                }
                parseAsTemplate(isIdentified) {
                    if (!this.isTemplate()) {
                        this.elements = this.parseElementSequence(this.content, this.baseOffset);
                        this.type = isIdentified ? 'identified-template' : 'template';
                    }
                    return this;
                }
                hasElement(tag) {
                    return this.elements.has(tag);
                }
                getElement(tag) {
                    if (!this.elements.has(tag))
                        return new QRCodeNode("void", "", tag);
                    return this.elements.get(tag);
                }
                newElement(tag, content) {
                    let node = new QRCodeNode("element", content, tag);
                    this.elements.set(tag, node);
                    return node;
                }
                deleteElement(tag) {
                    this.elements.delete(tag);
                }
                toJSON() {
                    let json = {
                        type: this.type,
                        tag: this.tag ?? undefined,
                        content: this.content,
                        elements: !this.isType("element") ? Array.from(this.elements.values()).map((value) => value.toJSON()) : undefined
                    };
                    return json;
                }
                ensureElement(tag, defaultContent = "") {
                    return this.hasElement(tag) ? this.getElement(tag) : this.newElement(tag, defaultContent);
                }
                buildTagLength() {
                    let ts = ("00" + this.tag.toString()).slice(-2);
                    let len = ("00" + this.content.length.toString()).slice(-2);
                    return ts + len;
                }
                buildQRString(offset = 0) {
                    const isRoot = this.isType("root");
                    this.baseOffset = offset;
                    if (!isRoot)
                        offset += 2 + 2;
                    if (!this.isType("element")) {
                        let qrs = [];
                        this.elements.forEach((element) => {
                            if (!isRoot || !data_utils_ts_2.valueIn([TAG_INIT, TAG_CRC], element.tag)) {
                                let els = element.buildQRString(offset);
                                qrs.push(els);
                                offset += els.length;
                            }
                        });
                        this._content = qrs.join("");
                    }
                    let content = this._content;
                    if (!isRoot) {
                        content = this.buildTagLength() + content;
                    }
                    return content;
                }
                findIdentifiedTemplate(id, first = 0, last = 99) {
                    let found = [];
                    this.elements.forEach((element) => {
                        if (element.isType('identified-template')
                            && element.tag >= first
                            && element.tag <= last
                            && element.hasElement(0)
                            && element.getElement(0).content.toUpperCase() == id.toUpperCase()) {
                            found.push(element);
                        }
                    });
                    return found;
                }
            };
            exports_4("QRCodeNode", QRCodeNode);
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/element-scheme", [], function (exports_5, context_5) {
    "use strict";
    var paymentSystemSpecificTemplateMap, reservedTemplateMap, additionalDataFieldMap, merchantInformationLanguageTemplateMap, rootSchemeMap, rootScheme;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [],
        execute: function () {
            paymentSystemSpecificTemplateMap = {
                0: {
                    name: 'Globally Unique Identifier',
                    optional: true,
                },
                1: {
                    lastTag: 99,
                    name: 'Payment System specific',
                    optional: true,
                },
            };
            reservedTemplateMap = {
                0: {
                    name: 'Globally Unique Identifier',
                    optional: true,
                },
                1: {
                    lastTag: 99,
                    name: 'Context specific data',
                    optional: true,
                },
            };
            additionalDataFieldMap = {
                1: {
                    name: 'Bill Number',
                    optional: true,
                },
                2: {
                    name: 'Mobile Number',
                    optional: true,
                },
                3: {
                    name: 'Store Label',
                    optional: true,
                },
                4: {
                    name: 'Loyalty Number',
                    optional: true,
                },
                5: {
                    name: 'Reference Label',
                    optional: true,
                },
                6: {
                    name: 'Customer Label',
                    optional: true,
                },
                7: {
                    name: 'Terminal Label',
                    optional: true,
                },
                8: {
                    name: 'Purpose of Transaction',
                    optional: true,
                },
                9: {
                    name: 'Additional Consumer Data Request',
                    optional: true,
                },
                10: {
                    lastTag: 49,
                    name: 'RFU for EMVCo',
                    optional: true,
                },
                50: {
                    lastTag: 99,
                    name: 'Payment System specific template',
                    optional: true,
                    elementMap: paymentSystemSpecificTemplateMap
                },
            };
            merchantInformationLanguageTemplateMap = {
                0: {
                    name: 'Language Preference',
                    optional: true,
                },
                1: {
                    name: 'Merchant Name - Alternate Language',
                    optional: true,
                },
                3: {
                    name: 'Merchant City - Alternate Language',
                    optional: true,
                },
            };
            rootSchemeMap = {
                0: {
                    name: 'Payload Format Indicator',
                    pattern: '^01$'
                },
                1: {
                    name: 'Point of Initiation Method',
                    optional: true,
                    pattern: '^1[12]\d\d$'
                },
                2: {
                    lastTag: 25,
                    name: 'Merchant Account Information',
                },
                26: {
                    lastTag: 51,
                    name: 'Merchant Account Information',
                    elementMap: paymentSystemSpecificTemplateMap
                },
                52: {
                    name: 'Merchant Category Code',
                },
                53: {
                    name: 'Transaction Currency',
                },
                54: {
                    name: 'Transaction Amount',
                },
                55: {
                    name: 'Tip or Convenience Indicator',
                    optional: true,
                },
                56: {
                    name: 'Value of Convenience Fee Fixed',
                },
                57: {
                    name: 'Value of Convenience Fee Percentage',
                },
                58: {
                    name: 'Country Code',
                    minLength: 2, maxLength: 2,
                },
                59: {
                    name: 'Merchant Name',
                },
                60: {
                    name: 'Merchant City',
                },
                61: {
                    name: 'Postal Code',
                    optional: true,
                },
                62: {
                    name: 'Additional Data Field Template',
                    optional: true,
                    elementMap: additionalDataFieldMap,
                },
                63: {
                    name: 'CRC',
                },
                64: {
                    name: 'Merchant Information — Language Template',
                    optional: true,
                    elementMap: merchantInformationLanguageTemplateMap
                },
                65: {
                    lastTag: 79,
                    name: 'RFU for EMVCo',
                    optional: true,
                },
                80: {
                    lastTag: 99,
                    name: 'Unreserved Templates',
                    optional: true,
                    elementMap: reservedTemplateMap
                },
            };
            exports_5("rootScheme", rootScheme = {
                name: 'root',
                elementMap: rootSchemeMap
            });
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/emv-merchant-qrcode", ["file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/qrcode-node", "file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/qrcode-validator", "file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/crc", "file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/element-scheme"], function (exports_6, context_6) {
    "use strict";
    var qrcode_node_ts_1, qrcode_validator_ts_2, crc_ts_2, element_scheme_ts_1, defaultParams, EMVMerchantQRCode;
    var __moduleName = context_6 && context_6.id;
    function convertCode(qrCode, _encoding) {
        return qrCode ?? '';
    }
    return {
        setters: [
            function (qrcode_node_ts_1_1) {
                qrcode_node_ts_1 = qrcode_node_ts_1_1;
            },
            function (qrcode_validator_ts_2_1) {
                qrcode_validator_ts_2 = qrcode_validator_ts_2_1;
                exports_6({
                    "QRCodeError": qrcode_validator_ts_2_1["QRCodeError"],
                    "QRErrorCode": qrcode_validator_ts_2_1["QRErrorCode"]
                });
            },
            function (crc_ts_2_1) {
                crc_ts_2 = crc_ts_2_1;
            },
            function (element_scheme_ts_1_1) {
                element_scheme_ts_1 = element_scheme_ts_1_1;
            }
        ],
        execute: function () {
            defaultParams = {
                encoding: 'utf8',
                validate: false,
            };
            EMVMerchantQRCode = class EMVMerchantQRCode extends qrcode_node_ts_1.QRCodeNode {
                constructor(qrCode, params = defaultParams) {
                    super('root', convertCode(qrCode, params.encoding));
                    this.type = "root";
                }
                static parseCode(qrCode, params = defaultParams) {
                    params = {
                        ...defaultParams,
                        ...params
                    };
                    let root = new EMVMerchantQRCode(qrCode, params);
                    function toContainer(node, isIdentified, tag, lastTag) {
                        for (let index = tag; index <= (lastTag ?? tag); ++index) {
                            if (node.hasElement(index))
                                node.getElement(index).parseAsTemplate(isIdentified);
                        }
                    }
                    toContainer(root, true, 26, 51);
                    if (root.hasElement(62)) {
                        toContainer(root, false, 62);
                        toContainer(root.getElement(62), true, 50, 99);
                    }
                    toContainer(root, false, 64);
                    toContainer(root, true, 80, 99);
                    if (params.validate)
                        qrcode_validator_ts_2.QRCodeValidator.validateRoot(root);
                    return root;
                }
                validateCode() {
                    qrcode_validator_ts_2.QRCodeValidator.validateRoot(this);
                }
                buildQRString() {
                    let content = this.content;
                    content = this.ensureElement(0, "01").buildQRString();
                    content += super.buildQRString(content.length);
                    content += this.newElement(qrcode_node_ts_1.TAG_CRC, "0000").buildQRString(content.length).slice(0, -4);
                    const crc = crc_ts_2.computeCRC(content);
                    this.getElement(qrcode_node_ts_1.TAG_CRC).content = crc;
                    this.baseOffset = 0;
                    this.content = content = content + crc;
                    return content;
                }
                dumpCode() {
                    function dumpNode(node, scheme, indent) {
                        let result = "";
                        if (node.isType('element')) {
                            result += indent + ("00" + node.tag).slice(-2) + ' (' + scheme.name + ')' + "\n";
                            result += indent + '  ' + node.content + "\n";
                        }
                        else {
                            if (!node.isType('root')) {
                                result += indent + '(' + ("00" + node.tag).slice(-2) + '): ' + scheme.name + "\n";
                                indent += "  ";
                            }
                            node.elements.forEach((element) => {
                                let nodeScheme = scheme?.elementMap?.[element.tag] ?? { name: 'unknown', elementMap: {} };
                                result += dumpNode(element, nodeScheme, indent);
                            });
                        }
                        return result;
                    }
                    return dumpNode(this, element_scheme_ts_1.rootScheme, "");
                }
            };
            exports_6("EMVMerchantQRCode", EMVMerchantQRCode);
        }
    };
});
System.register("https://deno.land/x/base64@v0.2.1/base", [], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
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
    exports_7("init", init);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("https://deno.land/x/base64@v0.2.1/mod", ["https://deno.land/x/base64@v0.2.1/base"], function (exports_8, context_8) {
    "use strict";
    var base_ts_1, lookup, revLookup, code, _a, byteLength, toUint8Array, fromUint8Array;
    var __moduleName = context_8 && context_8.id;
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
            _a = base_ts_1.init(lookup, revLookup), exports_8("byteLength", byteLength = _a.byteLength), exports_8("toUint8Array", toUint8Array = _a.toUint8Array), exports_8("fromUint8Array", fromUint8Array = _a.fromUint8Array);
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-payload/src/fetch-payload", ["https://deno.land/x/base64@v0.2.1/mod"], function (exports_9, context_9) {
    "use strict";
    var base64, PIXPayloadRetriever, qrs;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (base64_1) {
                base64 = base64_1;
            }
        ],
        execute: function () {
            PIXPayloadRetriever = class PIXPayloadRetriever {
                constructor() {
                }
                async fetchPayload(url) {
                    let pl = await fetch("https://" + url)
                        .then((response) => {
                        if (!response.ok)
                            throw new Error("HTTP " + response.status);
                        return response.text();
                    })
                        .then((jws) => {
                        let parts = jws.split('.')
                            .map((b64) => base64.toUint8Array(b64))
                            .map((u8) => new TextDecoder().decode(u8));
                        return parts[1];
                    })
                        .then((json) => {
                        let payload = JSON.parse(json);
                        return payload;
                    })
                        .catch((error) => console.log(error));
                    return pl;
                }
            };
            exports_9("PIXPayloadRetriever", PIXPayloadRetriever);
            qrs = [
                "00020101021226740014br.gov.bcb.pix2552pix.nascent.com.br/codes/k7nXuhpOMeHbkbNw6UUEoXwdkdM5204752153039865802BR5915Testes Banrisul6012Porto Alegre61089000000062070503***6304802C",
                "00020101021226840014br.gov.bcb.pix2562qrcodepix-h.bb.com.br/pix/766b3e9c-7d5b-4a2c-b912-6f34cb4b0f4c52040000530398654046.545802BR5920EPITACIO NEVES BRAGA6012RONDONOPOLIS62070503***6304B43B",
                "00020101021126950014BR.GOV.BCB.PIX2573spi.hom.cloud.itau.com.br/documentos/ae40f1f9-daa1-41ea-83c7-62fe15efa0a25204000053039865802BR5917TESTE PIX PORTAB 6009SAO PAULO623450300017BR.GOV.BCB.BRCODE01051.0.0630410C4",
                "00020101021226760014BR.GOV.BCB.PIX2554pix-h.safra.com.br/gi/8985c9ad21494cb4bf0bdf2d9928ad48520400005303986540513.135802BR5921COM E IMP SERTIC LTDA6009SAO PAULO62230519202010251755fd714176304CED5",
                "00020101021226760014BR.GOV.BCB.PIX2554pix-h.safra.com.br/gi/972769006bcf4c5ea3d12cb07ee16479520400005303986540413.05802BR5921COM E IMP SERTIC LTDA6009SAO PAULO62230519202010251755fcbd3e56304F64C",
                "00020101021226760014BR.GOV.BCB.PIX2554pix-h.safra.com.br/gi/cc39d712fc0646bfaf01348c89ecabe052040000530398654049.455802BR5921COM E IMP SERTIC LTDA6009SAO PAULO62230519202010251755fc725ae63048F33",
                "00020101021226850014BR.GOV.BCB.PIX2563PIX-HOM.HOMOLOGACAO.COM.BR/API/BRCODE/ZSX3020382321603660337879520400005303986540544.225802BR5911IRVING KUHN6008BRASILIA62290525ZSX302038232160366033787963049224"
            ];
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-payload/src/pix-payload-v1", [], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [],
        execute: function () {
            ;
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-payload/src/pix-payload", ["file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-payload/src/fetch-payload"], function (exports_11, context_11) {
    "use strict";
    var ex, PIXPayload;
    var __moduleName = context_11 && context_11.id;
    var exportedNames_1 = {
        "PIXPayload": true
    };
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_11(exports);
    }
    return {
        setters: [
            function (fetch_payload_ts_1_1) {
                exportStar_1(fetch_payload_ts_1_1);
            }
        ],
        execute: function () {
            ex = {
                $version: "v1",
                txId: "fc9a4366-ff3d-4964-b5db-c6c91a8722d3",
                revisao: 3,
                calendario: {
                    criacao: "2020-09-15T19:39:54.013Z",
                    apresentacao: "2020-04-01T18:00:00Z",
                    expiracao: 3600
                },
                status: "ATIVA",
                valor: {
                    original: "500.00",
                    final: "500.00"
                },
                chave: "7407c9c8-f78b-11ea-adc1-0242ac120002",
                solicitacaoPagador: "Informar cartão fidelidade",
                infoAdicionais: [
                    { nome: "quantidade",
                        valor: "2"
                    }
                ]
            };
            (function (PIXPayload) {
                function fromJSON_v1(obj) {
                    let payload = {
                        $version: "v1",
                        ...obj
                    };
                    return payload;
                }
                PIXPayload.fromJSON_v1 = fromJSON_v1;
                function fromJSON(obj, version = 1) {
                    switch (version) {
                        default:
                        case 1:
                            return fromJSON_v1(obj);
                    }
                }
                PIXPayload.fromJSON = fromJSON;
                function validatePayload(_payload) {
                }
                PIXPayload.validatePayload = validatePayload;
            })(PIXPayload || (PIXPayload = {}));
            exports_11("PIXPayload", PIXPayload);
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-qrcode/src/deps", ["file:///var/www/pix-tools/pix-qrcode-utils/packages/emv-merchant-qrcode/src/emv-merchant-qrcode", "file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-payload/src/pix-payload"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    function exportStar_2(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_12(exports);
    }
    return {
        setters: [
            function (emv_merchant_qrcode_ts_1_1) {
                exportStar_2(emv_merchant_qrcode_ts_1_1);
            },
            function (pix_payload_ts_1_1) {
                exportStar_2(pix_payload_ts_1_1);
            }
        ],
        execute: function () {
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-qrcode/src/pix-qrcode-validator", [], function (exports_13, context_13) {
    "use strict";
    var PIXQRErrorCode, PIXQRCodeError;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [],
        execute: function () {
            (function (PIXQRErrorCode) {
                PIXQRErrorCode[PIXQRErrorCode["OK"] = 0] = "OK";
                PIXQRErrorCode[PIXQRErrorCode["INVALID_QRCODE"] = 1] = "INVALID_QRCODE";
                PIXQRErrorCode[PIXQRErrorCode["CRC_MISMATCH"] = 2] = "CRC_MISMATCH";
                PIXQRErrorCode[PIXQRErrorCode["MISSING_MANDATORY_ELEMENT"] = 3] = "MISSING_MANDATORY_ELEMENT";
                PIXQRErrorCode[PIXQRErrorCode["MISSING_PIX_MAI"] = 4] = "MISSING_PIX_MAI";
                PIXQRErrorCode[PIXQRErrorCode["PIX_MAI_INVALID"] = 5] = "PIX_MAI_INVALID";
                PIXQRErrorCode[PIXQRErrorCode["DUPLICATE_PIX_MAI"] = 6] = "DUPLICATE_PIX_MAI";
            })(PIXQRErrorCode || (PIXQRErrorCode = {}));
            exports_13("PIXQRErrorCode", PIXQRErrorCode);
            PIXQRCodeError = class PIXQRCodeError extends Error {
                constructor(errorCode, message) {
                    super(message);
                    this.errorCode = errorCode;
                }
            };
            exports_13("PIXQRCodeError", PIXQRCodeError);
        }
    };
});
System.register("file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-qrcode/src/pix-qrcode", ["file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-qrcode/src/deps", "file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-qrcode/src/pix-qrcode-validator"], function (exports_14, context_14) {
    "use strict";
    var deps_ts_1, pix_qrcode_validator_ts_1, PIX_MAI_DICT, PIX_MAI_URL, defaultParams, GUI_PIX, PIXQRCode;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (deps_ts_1_1) {
                deps_ts_1 = deps_ts_1_1;
            },
            function (pix_qrcode_validator_ts_1_1) {
                pix_qrcode_validator_ts_1 = pix_qrcode_validator_ts_1_1;
            }
        ],
        execute: function () {
            exports_14("PIXQRErrorCode", pix_qrcode_validator_ts_1.PIXQRErrorCode);
            exports_14("PIXQRCodeError", pix_qrcode_validator_ts_1.PIXQRCodeError);
            PIX_MAI_DICT = 1;
            PIX_MAI_URL = 25;
            defaultParams = {
                encoding: 'utf8',
                validate: false,
            };
            exports_14("GUI_PIX", GUI_PIX = 'br.gov.bcb.pix');
            PIXQRCode = class PIXQRCode {
                constructor(qrCode, params = defaultParams) {
                    this._emvQRCode = deps_ts_1.EMVMerchantQRCode.parseCode(qrCode, params);
                }
                get emvQRCode() { return this._emvQRCode; }
                static parseCode(qrCode, params = defaultParams) {
                    params = {
                        ...defaultParams,
                        ...params
                    };
                    let pixQRCode = new PIXQRCode(qrCode, params);
                    if (params.validate)
                        pixQRCode.validateCode();
                    return pixQRCode;
                }
                validateCode() {
                    let emv = this.emvQRCode;
                    emv.validateCode();
                    let maiList = emv.findIdentifiedTemplate(GUI_PIX, 26, 51);
                    if (maiList.length == 0) {
                        throw new pix_qrcode_validator_ts_1.PIXQRCodeError(pix_qrcode_validator_ts_1.PIXQRErrorCode.MISSING_PIX_MAI, "PIX MAI not found");
                    }
                    if (maiList.length > 1) {
                        throw new pix_qrcode_validator_ts_1.PIXQRCodeError(pix_qrcode_validator_ts_1.PIXQRErrorCode.DUPLICATE_PIX_MAI, "PIX MAI duplicated");
                    }
                    let pixMAI = maiList[0];
                    let pixStatic = pixMAI.hasElement(PIX_MAI_DICT);
                    if (pixStatic) {
                        if (pixMAI.hasElement(PIX_MAI_URL)) {
                            throw new pix_qrcode_validator_ts_1.PIXQRCodeError(pix_qrcode_validator_ts_1.PIXQRErrorCode.PIX_MAI_INVALID, "PIX MAI contains both DICT and URL elements");
                        }
                    }
                    else {
                        if (!pixMAI.hasElement(PIX_MAI_URL)) {
                            throw new pix_qrcode_validator_ts_1.PIXQRCodeError(pix_qrcode_validator_ts_1.PIXQRErrorCode.PIX_MAI_INVALID, "PIX MAI contains neither static ou dynamic elements");
                        }
                    }
                }
                isPIX(test) {
                    let maiList = this.emvQRCode.findIdentifiedTemplate(GUI_PIX, 26, 51);
                    let hasPIX = (maiList.length == 1);
                    if (!hasPIX)
                        return false;
                    let pixMAI = maiList[0];
                    let isStatic = pixMAI.hasElement(PIX_MAI_DICT);
                    let isDynamic = pixMAI.hasElement(PIX_MAI_URL);
                    switch (test) {
                        case "pix": return true;
                        case "valid": return isStatic || isDynamic;
                        case "static": return isStatic;
                        case "dynamic": return isDynamic;
                    }
                }
            };
            exports_14("PIXQRCode", PIXQRCode);
        }
    };
});

const __exp = __instantiate("file:///var/www/pix-tools/pix-qrcode-utils/packages/pix-qrcode/src/pix-qrcode", false);
export const PIXQRErrorCode = __exp["PIXQRErrorCode"];
export const PIXQRCodeError = __exp["PIXQRCodeError"];
export const GUI_PIX = __exp["GUI_PIX"];
export const PIXQRCode = __exp["PIXQRCode"];
