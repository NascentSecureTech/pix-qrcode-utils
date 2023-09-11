// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const TAG_CRC = 63;
const mod = function() {
    return {
        TAG_INIT: 0,
        TAG_CRC: 63,
        TAG_MAX: 99,
        TAG_POI_METHOD: 2,
        TAG_MCC: 52,
        TAG_TRANSACTION_CURRENCY: 53,
        TAG_TRANSACTION_AMOUNT: 54,
        TAG_COUNTRY_CODE: 58,
        TAG_MERCHANT_NAME: 59,
        TAG_MERCHANT_CITY: 60,
        MAI_STANDARD_FIRST: 2,
        MAI_TEMPLATE_FIRST: 26,
        MAI_TEMPLATE_LAST: 51,
        TAG_TEMPLATE_GUI: 0,
        TAG_ADDITIONAL_DATA: 62,
        TAG_AD_REF_LABEL: 5
    };
}();
function getLengths(b64) {
    const len = b64.length;
    let validLen = b64.indexOf("=");
    if (validLen === -1) {
        validLen = len;
    }
    const placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
    return [
        validLen,
        placeHoldersLen
    ];
}
function init(lookup, revLookup, urlsafe = false) {
    function _byteLength(validLen, placeHoldersLen) {
        return Math.floor((validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen);
    }
    function tripletToBase64(num) {
        return lookup[num >> 18 & 0x3f] + lookup[num >> 12 & 0x3f] + lookup[num >> 6 & 0x3f] + lookup[num & 0x3f];
    }
    function encodeChunk(buf, start, end) {
        const out = new Array((end - start) / 3);
        for(let i = start, curTriplet = 0; i < end; i += 3){
            out[curTriplet++] = tripletToBase64((buf[i] << 16) + (buf[i + 1] << 8) + buf[i + 2]);
        }
        return out.join("");
    }
    return {
        byteLength (b64) {
            return _byteLength.apply(null, getLengths(b64));
        },
        toUint8Array (b64) {
            const [validLen, placeHoldersLen] = getLengths(b64);
            const buf = new Uint8Array(_byteLength(validLen, placeHoldersLen));
            const len = placeHoldersLen ? validLen - 4 : validLen;
            let tmp;
            let curByte = 0;
            let i;
            for(i = 0; i < len; i += 4){
                tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
                buf[curByte++] = tmp >> 16 & 0xff;
                buf[curByte++] = tmp >> 8 & 0xff;
                buf[curByte++] = tmp & 0xff;
            }
            if (placeHoldersLen === 2) {
                tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
                buf[curByte++] = tmp & 0xff;
            } else if (placeHoldersLen === 1) {
                tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
                buf[curByte++] = tmp >> 8 & 0xff;
                buf[curByte++] = tmp & 0xff;
            }
            return buf;
        },
        fromUint8Array (buf) {
            const maxChunkLength = 16383;
            const len = buf.length;
            const extraBytes = len % 3;
            const len2 = len - extraBytes;
            const parts = new Array(Math.ceil(len2 / 16383) + (extraBytes ? 1 : 0));
            let curChunk = 0;
            let chunkEnd;
            for(let i = 0; i < len2; i += maxChunkLength){
                chunkEnd = i + maxChunkLength;
                parts[curChunk++] = encodeChunk(buf, i, chunkEnd > len2 ? len2 : chunkEnd);
            }
            let tmp;
            if (extraBytes === 1) {
                tmp = buf[len2];
                parts[curChunk] = lookup[tmp >> 2] + lookup[tmp << 4 & 0x3f];
                if (!urlsafe) parts[curChunk] += "==";
            } else if (extraBytes === 2) {
                tmp = buf[len2] << 8 | buf[len2 + 1] & 0xff;
                parts[curChunk] = lookup[tmp >> 10] + lookup[tmp >> 4 & 0x3f] + lookup[tmp << 2 & 0x3f];
                if (!urlsafe) parts[curChunk] += "=";
            }
            return parts.join("");
        }
    };
}
const lookup = [];
const revLookup = [];
const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for(let i = 0, l = code.length; i < l; ++i){
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
const { byteLength, toUint8Array, fromUint8Array } = init(lookup, revLookup);
function numToHex(n, digits) {
    const hex = n.toString(16).toUpperCase();
    if (digits) {
        return ("0".repeat(digits) + hex).slice(-digits);
    }
    return hex.length % 2 == 0 ? hex : "0" + hex;
}
function valueIn(setof, value) {
    return setof.indexOf(value) >= 0;
}
class ValidationError extends Error {
    errorCode;
    errorName;
    constructor(errorCode, message){
        super(message);
        this.errorCode = errorCode;
        this.errorName = "";
    }
}
class RuleValidator {
    ruleInfo;
    parent;
    childValidators;
    constructor(ruleInfo){
        this.ruleInfo = ruleInfo;
        this.childValidators = [];
        this.result = {
            status: "none"
        };
    }
    static get(info) {
        const v = new RuleValidator(info);
        return v;
    }
    addRule(info) {
        return this.addValidator(RuleValidator.get(info));
    }
    addValidator(rule) {
        rule.parent = this;
        this.childValidators.push(rule);
        return this;
    }
    result;
    handleResult(res, observer, isFinal = false) {
        const previousStatus = this.result.status;
        switch(res.status){
            case "none":
            case "not-applicable":
            case "running":
                this.result = res;
                break;
            case "pass":
                if (isFinal && this.result.status == "running") {
                    this.result = res;
                }
                break;
            case "inconclusive":
                if (this.result.status != "fail") {
                    this.result = res;
                }
                break;
            case "fail":
                if (this.result.status != "fail") {
                    this.result = res;
                }
                break;
        }
        if (observer && previousStatus != this.result.status) observer(this, this.result);
        return this.result;
    }
    async executeRule(context) {
        let result = {
            status: "pass"
        };
        if (this.ruleInfo.rule) {
            try {
                const res = this.ruleInfo.rule(context, this);
                if (res) {
                    result = res instanceof Promise ? await Promise.resolve(res) : res;
                }
            } catch (E) {
                result = {
                    status: "fail",
                    error: E instanceof ValidationError ? E : new ValidationError(E)
                };
            }
        }
        return result;
    }
    async validate(context, observer) {
        this.result = {
            status: "none"
        };
        const shouldExec = !this.ruleInfo.when || this.ruleInfo.when(context, this);
        if (shouldExec) {
            this.handleResult({
                status: "running"
            }, observer);
            if (this.ruleInfo.rule) {
                this.handleResult(await this.executeRule(context), observer);
            }
            for (const child of this.childValidators){
                if (this.result.status != "running") break;
                const childResult = await child.validate(context, observer);
                this.handleResult(childResult, observer);
            }
            if (this.result.status == "running") this.handleResult({
                status: "pass"
            }, observer, true);
        } else {
            this.handleResult({
                status: "not-applicable"
            }, observer, true);
        }
        return this.result;
    }
}
const paymentSystemSpecificTemplateMap = {
    0: {
        name: 'Globally Unique Identifier',
        length: {
            max: 32
        },
        optional: true
    },
    1: {
        lastTag: 99,
        name: 'Payment System specific',
        optional: true
    }
};
const reservedTemplateMap = {
    0: {
        name: 'Globally Unique Identifier',
        length: {
            max: 32
        },
        optional: true
    },
    1: {
        lastTag: 99,
        name: 'Context specific data',
        optional: true
    }
};
const additionalDataFieldMap = {
    1: {
        name: 'Bill Number',
        length: {
            max: 25
        },
        optional: true
    },
    2: {
        name: 'Mobile Number',
        length: {
            max: 25
        },
        optional: true
    },
    3: {
        name: 'Store Label',
        length: {
            max: 25
        },
        optional: true
    },
    4: {
        name: 'Loyalty Number',
        length: {
            max: 25
        },
        optional: true
    },
    5: {
        name: 'Reference Label',
        length: {
            max: 25
        },
        optional: true
    },
    6: {
        name: 'Customer Label',
        length: {
            max: 25
        },
        optional: true
    },
    7: {
        name: 'Terminal Label',
        length: {
            max: 25
        },
        optional: true
    },
    8: {
        name: 'Purpose of Transaction',
        length: {
            max: 25
        },
        optional: true
    },
    9: {
        name: 'Additional Consumer Data Request',
        length: {
            max: 25
        },
        optional: true
    },
    10: {
        lastTag: 49,
        name: 'RFU for EMVCo',
        optional: true
    },
    50: {
        lastTag: 99,
        name: 'Payment System specific template',
        optional: true,
        elementMap: paymentSystemSpecificTemplateMap
    }
};
const merchantInformationLanguageTemplateMap = {
    0: {
        name: 'Language Preference',
        optional: true
    },
    1: {
        name: 'Merchant Name - Alternate Language',
        optional: true
    },
    3: {
        name: 'Merchant City - Alternate Language',
        optional: true
    }
};
const rootSchemaMap = {
    0: {
        name: 'Payload Format Indicator',
        length: 2,
        pattern: /^01$/
    },
    1: {
        name: 'Point of Initiation Method',
        optional: true,
        length: 2,
        pattern: /^1[12]$/
    },
    2: {
        lastTag: 25,
        name: 'Merchant Account Information',
        length: {
            max: 99
        }
    },
    26: {
        lastTag: 51,
        name: 'Merchant Account Information',
        elementMap: paymentSystemSpecificTemplateMap
    },
    52: {
        name: 'Merchant Category Code',
        length: 4,
        pattern: /^\d*$/
    },
    53: {
        name: 'Transaction Currency',
        length: 3,
        pattern: /^\d*$/
    },
    54: {
        name: 'Transaction Amount',
        length: {
            max: 13
        },
        pattern: /^[\d]+(.\d\d)?$/
    },
    55: {
        name: 'Tip or Convenience Indicator',
        length: 2,
        optional: true
    },
    56: {
        name: 'Value of Convenience Fee Fixed',
        length: {
            max: 13
        },
        pattern: /^[\d]+(.\d\d)?$/
    },
    57: {
        name: 'Value of Convenience Fee Percentage'
    },
    58: {
        name: 'Country Code',
        length: 2
    },
    59: {
        name: 'Merchant Name',
        length: {
            max: 25
        }
    },
    60: {
        name: 'Merchant City',
        length: {
            max: 15
        }
    },
    61: {
        name: 'Postal Code',
        optional: true
    },
    62: {
        name: 'Additional Data Field Template',
        optional: true,
        elementMap: additionalDataFieldMap
    },
    63: {
        name: 'CRC',
        length: 4,
        pattern: /^[A-Fa-f\d]*$/
    },
    64: {
        name: 'Merchant Information — Language Template',
        optional: true,
        elementMap: merchantInformationLanguageTemplateMap
    },
    65: {
        lastTag: 79,
        name: 'RFU for EMVCo',
        optional: true
    },
    80: {
        lastTag: 99,
        name: 'Unreserved Templates',
        optional: true,
        elementMap: reservedTemplateMap
    }
};
const rootEMVSchema = {
    name: 'root',
    elementMap: rootSchemaMap
};
function lookupNodeSchema(schema, node, tag) {
    let elementMap = schema?.elementMap;
    if (schema?.identifiedElementMap) {
        if (node.hasElement(0)) {
            const gui = node.getElement(0).content.toUpperCase();
            for(const xx in schema.identifiedElementMap){
                if (xx.toUpperCase() == gui) {
                    elementMap = {
                        ...elementMap,
                        ...schema.identifiedElementMap[xx]
                    };
                }
            }
        }
    }
    let nodeSchema = {
        name: 'Unknown',
        elementMap: {}
    };
    if (elementMap?.[tag]) {
        nodeSchema = elementMap[tag];
    } else {
        for(const xx in elementMap){
            const elTag = parseInt(xx);
            const el = elementMap[elTag];
            if (tag >= elTag && el.lastTag && tag <= el.lastTag) {
                nodeSchema = el;
            }
        }
    }
    return nodeSchema;
}
export { rootEMVSchema as rootEMVSchema };
export { lookupNodeSchema as lookupNodeSchema };
function computeCRC(str, invert = false) {
    const bytes = new TextEncoder().encode(str);
    const crcTable = [
        0x0000,
        0x1021,
        0x2042,
        0x3063,
        0x4084,
        0x50a5,
        0x60c6,
        0x70e7,
        0x8108,
        0x9129,
        0xa14a,
        0xb16b,
        0xc18c,
        0xd1ad,
        0xe1ce,
        0xf1ef,
        0x1231,
        0x0210,
        0x3273,
        0x2252,
        0x52b5,
        0x4294,
        0x72f7,
        0x62d6,
        0x9339,
        0x8318,
        0xb37b,
        0xa35a,
        0xd3bd,
        0xc39c,
        0xf3ff,
        0xe3de,
        0x2462,
        0x3443,
        0x0420,
        0x1401,
        0x64e6,
        0x74c7,
        0x44a4,
        0x5485,
        0xa56a,
        0xb54b,
        0x8528,
        0x9509,
        0xe5ee,
        0xf5cf,
        0xc5ac,
        0xd58d,
        0x3653,
        0x2672,
        0x1611,
        0x0630,
        0x76d7,
        0x66f6,
        0x5695,
        0x46b4,
        0xb75b,
        0xa77a,
        0x9719,
        0x8738,
        0xf7df,
        0xe7fe,
        0xd79d,
        0xc7bc,
        0x48c4,
        0x58e5,
        0x6886,
        0x78a7,
        0x0840,
        0x1861,
        0x2802,
        0x3823,
        0xc9cc,
        0xd9ed,
        0xe98e,
        0xf9af,
        0x8948,
        0x9969,
        0xa90a,
        0xb92b,
        0x5af5,
        0x4ad4,
        0x7ab7,
        0x6a96,
        0x1a71,
        0x0a50,
        0x3a33,
        0x2a12,
        0xdbfd,
        0xcbdc,
        0xfbbf,
        0xeb9e,
        0x9b79,
        0x8b58,
        0xbb3b,
        0xab1a,
        0x6ca6,
        0x7c87,
        0x4ce4,
        0x5cc5,
        0x2c22,
        0x3c03,
        0x0c60,
        0x1c41,
        0xedae,
        0xfd8f,
        0xcdec,
        0xddcd,
        0xad2a,
        0xbd0b,
        0x8d68,
        0x9d49,
        0x7e97,
        0x6eb6,
        0x5ed5,
        0x4ef4,
        0x3e13,
        0x2e32,
        0x1e51,
        0x0e70,
        0xff9f,
        0xefbe,
        0xdfdd,
        0xcffc,
        0xbf1b,
        0xaf3a,
        0x9f59,
        0x8f78,
        0x9188,
        0x81a9,
        0xb1ca,
        0xa1eb,
        0xd10c,
        0xc12d,
        0xf14e,
        0xe16f,
        0x1080,
        0x00a1,
        0x30c2,
        0x20e3,
        0x5004,
        0x4025,
        0x7046,
        0x6067,
        0x83b9,
        0x9398,
        0xa3fb,
        0xb3da,
        0xc33d,
        0xd31c,
        0xe37f,
        0xf35e,
        0x02b1,
        0x1290,
        0x22f3,
        0x32d2,
        0x4235,
        0x5214,
        0x6277,
        0x7256,
        0xb5ea,
        0xa5cb,
        0x95a8,
        0x8589,
        0xf56e,
        0xe54f,
        0xd52c,
        0xc50d,
        0x34e2,
        0x24c3,
        0x14a0,
        0x0481,
        0x7466,
        0x6447,
        0x5424,
        0x4405,
        0xa7db,
        0xb7fa,
        0x8799,
        0x97b8,
        0xe75f,
        0xf77e,
        0xc71d,
        0xd73c,
        0x26d3,
        0x36f2,
        0x0691,
        0x16b0,
        0x6657,
        0x7676,
        0x4615,
        0x5634,
        0xd94c,
        0xc96d,
        0xf90e,
        0xe92f,
        0x99c8,
        0x89e9,
        0xb98a,
        0xa9ab,
        0x5844,
        0x4865,
        0x7806,
        0x6827,
        0x18c0,
        0x08e1,
        0x3882,
        0x28a3,
        0xcb7d,
        0xdb5c,
        0xeb3f,
        0xfb1e,
        0x8bf9,
        0x9bd8,
        0xabbb,
        0xbb9a,
        0x4a75,
        0x5a54,
        0x6a37,
        0x7a16,
        0x0af1,
        0x1ad0,
        0x2ab3,
        0x3a92,
        0xfd2e,
        0xed0f,
        0xdd6c,
        0xcd4d,
        0xbdaa,
        0xad8b,
        0x9de8,
        0x8dc9,
        0x7c26,
        0x6c07,
        0x5c64,
        0x4c45,
        0x3ca2,
        0x2c83,
        0x1ce0,
        0x0cc1,
        0xef1f,
        0xff3e,
        0xcf5d,
        0xdf7c,
        0xaf9b,
        0xbfba,
        0x8fd9,
        0x9ff8,
        0x6e17,
        0x7e36,
        0x4e55,
        0x5e74,
        0x2e93,
        0x3eb2,
        0x0ed1,
        0x1ef0
    ];
    let crc = 0xFFFF;
    for(let i = 0; i < bytes.length; i++){
        const c = bytes[i];
        const j = (c ^ crc >> 8) & 0xFF;
        crc = crcTable[j] ^ crc << 8;
    }
    let answer = (crc ^ 0) & 0xFFFF;
    let hex = numToHex(answer, 4);
    if (invert) return hex.slice(2) + hex.slice(0, 2);
    return hex;
}
var QRErrorCode;
(function(QRErrorCode) {
    QRErrorCode[QRErrorCode["INVALID_PARAM"] = 0] = "INVALID_PARAM";
    QRErrorCode[QRErrorCode["INVALID_QRCODE"] = 1] = "INVALID_QRCODE";
    QRErrorCode[QRErrorCode["CRC_MISMATCH"] = 2] = "CRC_MISMATCH";
    QRErrorCode[QRErrorCode["MISSING_MANDATORY_ELEMENT"] = 3] = "MISSING_MANDATORY_ELEMENT";
    QRErrorCode[QRErrorCode["INVALID_ELEMENT"] = 4] = "INVALID_ELEMENT";
})(QRErrorCode || (QRErrorCode = {}));
class QRCodeError extends ValidationError {
    errorCode;
    constructor(errorCode, message){
        super(errorCode, message);
        this.errorCode = errorCode;
        this.errorName = "EMVQR-" + QRErrorCode[errorCode];
    }
}
const mandatoryElements = [
    0,
    52,
    53,
    58,
    59,
    60,
    63
];
function validateElement(val, schema, path) {
    if (val == undefined) {
        if (!schema.optional) {
            throw new QRCodeError(QRErrorCode.MISSING_MANDATORY_ELEMENT, `Element ${path} missing and is mandatory`);
        }
        return;
    }
    if (schema.length != undefined) {
        if (schema.length instanceof Object) {
            const lenInfo = schema.length;
            if (lenInfo.max && val.length > lenInfo.max) throw new QRCodeError(QRErrorCode.INVALID_ELEMENT, `Element ${path} must have maximum length of ${lenInfo.max}`);
            if (lenInfo.min && val.length < lenInfo.min) throw new QRCodeError(QRErrorCode.INVALID_ELEMENT, `Element ${path} must have minimum length of ${lenInfo.min}`);
        } else {
            if (val.length != schema.length) throw new QRCodeError(QRErrorCode.INVALID_ELEMENT, `Element ${path} must have length of ${schema.length}`);
        }
    }
    if (schema.pattern != undefined) {
        const pattern = schema.pattern instanceof RegExp ? schema.pattern : new RegExp(schema.pattern);
        if (!pattern.test(val)) throw new QRCodeError(QRErrorCode.INVALID_ELEMENT, `Element ${path} has invalid contents`);
    }
}
function validateNode(node, schema, path = "") {
    if (node.isType('data')) {
        validateElement(node.content, schema, path);
    } else {
        node.elements.forEach((element)=>{
            const nodeSchema = lookupNodeSchema(schema, node, element.tag);
            const elementPath = path + (path.length ? ":" : "") + ("00" + element.tag).slice(-2);
            validateNode(element, nodeSchema, elementPath);
        });
    }
}
function getRuleValidator() {
    return RuleValidator.get({
        id: "EMVQR"
    }).addRule({
        id: "start-element-00",
        description: "Initial element is '00' with contents '01'",
        rule: (root, _val)=>{
            if (root.getElement(0).baseOffset != 0) {
                throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "Missing start element (00)");
            }
            if (root.getElement(0).content != '01') {
                throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "Invalid value for start element (00)");
            }
        }
    }).addRule({
        id: "final-element-63",
        description: "Final element is CRC '63'",
        rule: (root, _val)=>{
            const crcEl = root.getElement(63);
            if (crcEl.baseOffset != root.content.length - 8 || root.content.slice(-8, -4) != '6304') {
                throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "CRC must be final element (63)");
            }
        }
    }).addRule({
        id: "valid-crc",
        description: "CRC is valid",
        rule: (root, _val)=>{
            const crcEl = root.getElement(63);
            const calculatedCRC = computeCRC(root.content.slice(0, -4));
            if (calculatedCRC != crcEl.content.toUpperCase()) {
                throw new QRCodeError(QRErrorCode.CRC_MISMATCH, "Invalid CRC");
            }
        }
    }).addRule({
        id: "one-or-more-mai",
        description: "Contains one or more Merchant Account Information elements",
        rule: (root, _val)=>{
            const maiList = Array.from(root.elements.keys()).filter((v)=>v >= 2 && v <= 51);
            if (maiList.length == 0) {
                throw new QRCodeError(QRErrorCode.MISSING_MANDATORY_ELEMENT, "Must have at least one Merchant Account Information");
            }
        }
    }).addRule({
        id: "mandatory-elements",
        description: "Contains EMV mandatory elements",
        rule: (root, _val)=>{
            mandatoryElements.forEach((tag)=>{
                if (!root.hasElement(tag)) throw new QRCodeError(QRErrorCode.MISSING_MANDATORY_ELEMENT, "Missing mandatory tag (" + tag + ")");
            });
        }
    }).addRule({
        id: "valid-elements",
        description: "Elements are valid",
        rule: (root, _val)=>{
            validateNode(root, rootEMVSchema);
        }
    });
}
class QRCodeNode {
    type;
    isType(type) {
        return this.type == type;
    }
    isTemplate() {
        return this.isType('template') || this.isType('identified-template');
    }
    _content;
    get content() {
        return this._content;
    }
    set content(content) {
        this._content = content;
    }
    tag;
    baseOffset;
    elements;
    constructor(type, content, tag, baseOffset = 0){
        this.type = type;
        this.baseOffset = baseOffset;
        this.tag = tag;
        this._content = content;
        switch(type){
            case "root":
            case "template":
                this.elements = this.parseElementSequence(content, baseOffset);
                break;
            default:
                this.elements = new Map();
        }
    }
    parseElementSequence(sequence, baseOffset = 0) {
        let elements = new Map();
        let end = sequence.length;
        let index = 0;
        while(index + 4 < end){
            let pos = baseOffset + index;
            if (!/^\d{4}$/.test(sequence.substr(index, 4))) {
                throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: invalid tag or length characters @ " + (1 + pos));
            }
            let tag = parseInt(sequence.substr(index, 2));
            let len = parseInt(sequence.substr(index + 2, 2));
            if (index + len + 4 > end) {
                throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: invalid length @" + (1 + pos));
            }
            let content = sequence.substr(index + 2 + 2, len);
            elements.set(tag, new QRCodeNode('data', content, tag, pos));
            index += 4 + len;
        }
        if (index != end) {
            throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: extra characters at end @" + (1 + baseOffset + index));
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
        if (!this.elements.has(tag)) return new QRCodeNode("void", "", tag);
        return this.elements.get(tag);
    }
    newDataElement(tag, content) {
        let node = new QRCodeNode("data", content, tag);
        this.elements.set(tag, node);
        return node;
    }
    newTemplateElement(tag, lastTag, isIdentified = false, nodes) {
        if (!lastTag) lastTag = tag;
        while(tag <= lastTag){
            if (!this.hasElement(tag)) {
                let node = new QRCodeNode(isIdentified ? "identified-template" : "template", "", tag);
                if (nodes) {
                    for (const child of nodes)node.elements.set(child.tag, child);
                }
                this.elements.set(tag, node);
                return node;
            }
            ++tag;
        }
        throw new QRCodeError(QRErrorCode.INVALID_ELEMENT, "Unable to insert template");
    }
    deleteElement(tag) {
        this.elements.delete(tag);
    }
    toJSON() {
        let json = {
            type: this.type,
            tag: this.tag ?? undefined,
            content: this.content,
            elements: !this.isType("data") ? Array.from(this.elements.values()).map((value)=>value.toJSON()) : undefined
        };
        return json;
    }
    ensureDataElement(tag, defaultContent = "") {
        return this.hasElement(tag) ? this.getElement(tag) : this.newDataElement(tag, defaultContent);
    }
    buildTagLength() {
        let ts = ("00" + this.tag.toString()).slice(-2);
        let len = ("00" + this.content.length.toString()).slice(-2);
        return ts + len;
    }
    buildQRString(offset = 0) {
        const isRoot = this.isType("root");
        if (isRoot) {
            this.elements = new Map([
                ...this.elements
            ].sort((a, b)=>a[0] > b[0] ? 1 : -1));
        }
        this.baseOffset = offset;
        if (!isRoot) offset += 2 + 2;
        if (!this.isType("data")) {
            let qrs = [];
            this.elements.forEach((element)=>{
                if (!isRoot || !valueIn([
                    0,
                    63
                ], element.tag)) {
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
        this.elements.forEach((element)=>{
            if (element.isType('identified-template') && element.tag >= first && element.tag <= last && element.hasElement(0) && element.getElement(0).content.toUpperCase() == id.toUpperCase()) {
                found.push(element);
            }
        });
        return found;
    }
}
export { QRCodeNode as QRCodeNode };
const defaultParams = {
    encoding: 'utf8'
};
function convertCode(qrCode = '', encoding) {
    switch(encoding ?? 'utf8'){
        case 'utf8':
            return qrCode;
        case 'base64':
            {
                const u8 = toUint8Array(qrCode);
                return new TextDecoder().decode(u8);
            }
        default:
            throw new QRCodeError(QRErrorCode.INVALID_PARAM, "encoding must be 'utf8' or 'base64'");
    }
}
class EMVMerchantQRCode extends QRCodeNode {
    type = "root";
    constructor(qrCode, params = defaultParams){
        super('root', convertCode(qrCode, params.encoding));
    }
    static createCode(basicElements) {
        const root = new EMVMerchantQRCode();
        if (basicElements) {
            root.newDataElement(52, basicElements.merchantCategoryCode);
            root.newDataElement(53, ("000" + basicElements.transactionCurrency).slice(-3));
            root.newDataElement(58, basicElements.countryCode);
            root.newDataElement(59, basicElements.merchantName);
            root.newDataElement(60, basicElements.merchantCity);
            if (basicElements.oneTime) root.newDataElement(2, "12");
            if (basicElements.transactionAmount) {
                let amount = basicElements.transactionAmount.toFixed(2);
                if (amount.endsWith(".00")) amount = amount.slice(0, -3);
                root.newDataElement(54, amount);
            }
        }
        return root;
    }
    static parseCode(qrCode, params) {
        params = {
            ...defaultParams,
            ...params
        };
        const root = new EMVMerchantQRCode(qrCode, params);
        function toTemplate(node, isIdentified, tag, lastTag) {
            for(let index = tag; index <= (lastTag ?? tag); ++index){
                if (node.hasElement(index)) node.getElement(index).parseAsTemplate(isIdentified);
            }
        }
        toTemplate(root, true, 26, 51);
        if (root.hasElement(62)) {
            toTemplate(root, false, 62);
            toTemplate(root.getElement(62), true, 50, 99);
        }
        toTemplate(root, false, 64);
        toTemplate(root, true, 80, 99);
        return root;
    }
    extractElements() {
        const emvQR = this;
        function getDataElement(tag) {
            if (emvQR.hasElement(tag)) {
                return emvQR.getElement(tag).content;
            }
            return "";
        }
        const basicElements = {
            merchantCategoryCode: getDataElement(52),
            transactionCurrency: parseInt(getDataElement(53)),
            countryCode: getDataElement(58),
            merchantName: getDataElement(59),
            merchantCity: getDataElement(60),
            transactionAmount: parseFloat(getDataElement(54)),
            oneTime: getDataElement(2) == '12'
        };
        return basicElements;
    }
    validateCode(observer) {
        return getRuleValidator().validate(this, observer);
    }
    buildQRString() {
        let content = this.content;
        content = this.ensureDataElement(0, "01").buildQRString();
        content += super.buildQRString(content.length);
        content += this.newDataElement(TAG_CRC, "0000").buildQRString(content.length).slice(0, -4);
        const crc = computeCRC(content);
        this.getElement(TAG_CRC).content = crc;
        this.baseOffset = 0;
        this.content = content = content + crc;
        return content;
    }
    dumpCode() {
        function dumpNode(node, schema, indent) {
            let result = "";
            if (node.isType('data')) {
                result += indent + ("00" + node.tag).slice(-2) + ' (' + schema.name + ')' + "\n";
                result += indent + '  ' + node.content + "\n";
            } else {
                if (!node.isType('root')) {
                    result += indent + '(' + ("00" + node.tag).slice(-2) + '): ' + schema.name + "\n";
                    indent += "  ";
                }
                node.elements.forEach((element)=>{
                    const nodeSchema = schema?.elementMap?.[element.tag] ?? {
                        name: 'unknown',
                        elementMap: {}
                    };
                    result += dumpNode(element, nodeSchema, indent);
                });
            }
            return result;
        }
        return dumpNode(this, rootEMVSchema, "");
    }
}
export { EMVMerchantQRCode as EMVMerchantQRCode };
export { QRCodeError as QRCodeError, QRErrorCode as QRErrorCode };
export { mod as EMVQR };
