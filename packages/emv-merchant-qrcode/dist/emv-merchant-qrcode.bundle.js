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

System.register("data-utils", [], function (exports_1, context_1) {
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
System.register("crc", ["data-utils"], function (exports_2, context_2) {
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
System.register("qrcode-validator", ["crc"], function (exports_3, context_3) {
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
System.register("qrcode-node", ["data-utils", "qrcode-validator"], function (exports_4, context_4) {
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
                        case "container":
                            this.elements = this.parseElementSequence(content, baseOffset);
                            break;
                        default:
                            this.elements = new Map();
                    }
                }
                isType(type) { return this.type == type; }
                ;
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
                parseAsContainer() {
                    if (!this.isType('container')) {
                        this.elements = this.parseElementSequence(this.content, this.baseOffset);
                        this.type = 'container';
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
            };
            exports_4("QRCodeNode", QRCodeNode);
        }
    };
});
System.register("element-scheme", [], function (exports_5, context_5) {
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
                },
                1: {
                    name: 'Point of Initiation Method',
                    optional: true,
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
System.register("emv-merchant-qrcode", ["qrcode-node", "qrcode-validator", "crc", "element-scheme"], function (exports_6, context_6) {
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
                    function toContainer(node, tag, lastTag) {
                        for (let index = tag; index <= (lastTag ?? tag); ++index) {
                            if (node.hasElement(index))
                                node.getElement(index).parseAsContainer();
                        }
                    }
                    toContainer(root, 26, 51);
                    if (root.hasElement(62)) {
                        toContainer(root, 62);
                        toContainer(root.getElement(62), 50, 99);
                    }
                    toContainer(root, 64);
                    toContainer(root, 80, 99);
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

const __exp = __instantiate("emv-merchant-qrcode", false);
export const QRCodeError = __exp["QRCodeError"];
export const QRErrorCode = __exp["QRErrorCode"];
export const EMVMerchantQRCode = __exp["EMVMerchantQRCode"];
