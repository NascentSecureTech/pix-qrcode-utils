export var QRErrorCode;
(function(QRErrorCode1) {
    QRErrorCode1[QRErrorCode1["INVALID_PARAM"] = 0] = "INVALID_PARAM";
    QRErrorCode1[QRErrorCode1["INVALID_QRCODE"] = 1] = "INVALID_QRCODE";
    QRErrorCode1[QRErrorCode1["CRC_MISMATCH"] = 2] = "CRC_MISMATCH";
    QRErrorCode1[QRErrorCode1["MISSING_MANDATORY_ELEMENT"] = 3] = "MISSING_MANDATORY_ELEMENT";
    QRErrorCode1[QRErrorCode1["INVALID_ELEMENT"] = 4] = "INVALID_ELEMENT";
})(QRErrorCode || (QRErrorCode = {
}));
const mandatoryElements = [
    0,
    52,
    53,
    58,
    59,
    60,
    63
];
export const TAG_INIT = 0;
export const TAG_CRC = 63;
export const TAG_TEMPLATE_GUI = 0;
function numToHex(n, digits) {
    let hex = n.toString(16).toUpperCase();
    if (digits) {
        return ("0".repeat(digits) + hex).slice(-digits);
    }
    return hex.length % 2 == 0 ? hex : "0" + hex;
}
function valueIn(setof, value) {
    return setof.indexOf(value) >= 0;
}
class ValidationError extends Error {
    errorName = "";
    constructor(errorCode, message){
        super(message);
        this.errorCode = errorCode;
    }
}
class RuleValidator {
    childValidators = [];
    constructor(ruleInfo){
        this.ruleInfo = ruleInfo;
    }
    static get(info) {
        let v = new RuleValidator(info);
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
    result = {
        status: "none"
    };
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
                let res = this.ruleInfo.rule(context, this);
                if (res != undefined) {
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
        let shouldExec = !this.ruleInfo.when || this.ruleInfo.when(context, this);
        if (shouldExec) {
            this.handleResult({
                status: "running"
            }, observer);
            if (this.ruleInfo.rule) {
                this.handleResult(await this.executeRule(context), observer);
            }
            for (let child of this.childValidators){
                if (this.result.status != "running") break;
                let childResult = await child.validate(context, observer);
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
const rootSchemeMap = {
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
        name: 'Merchant City'
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
export const rootScheme = {
    name: 'root',
    elementMap: rootSchemeMap
};
const defaultParams = {
    encoding: 'utf8'
};
export class QRCodeError extends ValidationError {
    constructor(errorCode1, message1){
        super(errorCode1, message1);
        this.errorCode = errorCode1;
        this.errorName = "EMVQR-" + QRErrorCode[errorCode1];
    }
}
function validateElement(val, schema, path) {
    if (val == undefined) {
        if (!schema.optional) {
            throw new QRCodeError(QRErrorCode.MISSING_MANDATORY_ELEMENT, `Element ${path} missing and is mandatory`);
        }
        return;
    }
    if (schema.length != undefined) {
        if (schema.length instanceof Object) {
            let lenInfo = schema.length;
            if (lenInfo.max && val.length > lenInfo.max) throw new QRCodeError(QRErrorCode.INVALID_ELEMENT, `Element ${path} must have maximum length of ${lenInfo.max}`);
            if (lenInfo.min && val.length < lenInfo.min) throw new QRCodeError(QRErrorCode.INVALID_ELEMENT, `Element ${path} must have minimum length of ${lenInfo.min}`);
        } else {
            if (val.length != schema.length) throw new QRCodeError(QRErrorCode.INVALID_ELEMENT, `Element ${path} must have length of ${schema.length}`);
        }
    }
    if (schema.pattern != undefined) {
        let pattern = schema.pattern instanceof RegExp ? schema.pattern : new RegExp(schema.pattern);
        if (!pattern.test(val)) throw new QRCodeError(QRErrorCode.INVALID_ELEMENT, `Element ${path} has invalid contents`);
    }
}
function validateNode(node, schema, path = "") {
    if (node.isType('data')) {
        validateElement(node.content, schema, path);
    } else {
        node.elements.forEach((element)=>{
            let nodeScheme = schema?.elementMap?.[element.tag] ?? {
                name: 'unknown',
                elementMap: {
                }
            };
            let elementPath = path + (path.length ? ":" : "") + ("00" + element.tag).slice(-2);
            validateNode(element, nodeScheme, elementPath);
        });
    }
}
export class QRCodeNode {
    isType(type) {
        return this.type == type;
    }
    isTemplate() {
        return this.isType('template') || this.isType('identified-template');
    }
    get content() {
        return this._content;
    }
    set content(content) {
        this._content = content;
    }
    constructor(type1, content1, tag1, baseOffset1 = 0){
        this.type = type1;
        this.baseOffset = baseOffset1;
        this.tag = tag1;
        this._content = content1;
        switch(type1){
            case "root":
            case "template":
                this.elements = this.parseElementSequence(content1, baseOffset1);
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
            let tag1 = parseInt(sequence.substr(index, 2));
            let len = parseInt(sequence.substr(index + 2, 2));
            if (index + len + 4 > end) {
                throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: invalid length @" + (1 + pos));
            }
            let content1 = sequence.substr(index + 2 + 2, len);
            elements.set(tag1, new QRCodeNode('data', content1, tag1, pos));
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
            elements: !this.isType("data") ? Array.from(this.elements.values()).map((value)=>value.toJSON()
            ) : undefined
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
        let content2 = this._content;
        if (!isRoot) {
            content2 = this.buildTagLength() + content2;
        }
        return content2;
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
function computeCRC(str, invert = false) {
    const bytes = new TextEncoder().encode(str);
    const crcTable = [
        0,
        4129,
        8258,
        12387,
        16516,
        20645,
        24774,
        28903,
        33032,
        37161,
        41290,
        45419,
        49548,
        53677,
        57806,
        61935,
        4657,
        528,
        12915,
        8786,
        21173,
        17044,
        29431,
        25302,
        37689,
        33560,
        45947,
        41818,
        54205,
        50076,
        62463,
        58334,
        9314,
        13379,
        1056,
        5121,
        25830,
        29895,
        17572,
        21637,
        42346,
        46411,
        34088,
        38153,
        58862,
        62927,
        50604,
        54669,
        13907,
        9842,
        5649,
        1584,
        30423,
        26358,
        22165,
        18100,
        46939,
        42874,
        38681,
        34616,
        63455,
        59390,
        55197,
        51132,
        18628,
        22757,
        26758,
        30887,
        2112,
        6241,
        10242,
        14371,
        51660,
        55789,
        59790,
        63919,
        35144,
        39273,
        43274,
        47403,
        23285,
        19156,
        31415,
        27286,
        6769,
        2640,
        14899,
        10770,
        56317,
        52188,
        64447,
        60318,
        39801,
        35672,
        47931,
        43802,
        27814,
        31879,
        19684,
        23749,
        11298,
        15363,
        3168,
        7233,
        60846,
        64911,
        52716,
        56781,
        44330,
        48395,
        36200,
        40265,
        32407,
        28342,
        24277,
        20212,
        15891,
        11826,
        7761,
        3696,
        65439,
        61374,
        57309,
        53244,
        48923,
        44858,
        40793,
        36728,
        37256,
        33193,
        45514,
        41451,
        53516,
        49453,
        61774,
        57711,
        4224,
        161,
        12482,
        8419,
        20484,
        16421,
        28742,
        24679,
        33721,
        37784,
        41979,
        46042,
        49981,
        54044,
        58239,
        62302,
        689,
        4752,
        8947,
        13010,
        16949,
        21012,
        25207,
        29270,
        46570,
        42443,
        38312,
        34185,
        62830,
        58703,
        54572,
        50445,
        13538,
        9411,
        5280,
        1153,
        29798,
        25671,
        21540,
        17413,
        42971,
        47098,
        34713,
        38840,
        59231,
        63358,
        50973,
        55100,
        9939,
        14066,
        1681,
        5808,
        26199,
        30326,
        17941,
        22068,
        55628,
        51565,
        63758,
        59695,
        39368,
        35305,
        47498,
        43435,
        22596,
        18533,
        30726,
        26663,
        6336,
        2273,
        14466,
        10403,
        52093,
        56156,
        60223,
        64286,
        35833,
        39896,
        43963,
        48026,
        19061,
        23124,
        27191,
        31254,
        2801,
        6864,
        10931,
        14994,
        64814,
        60687,
        56684,
        52557,
        48554,
        44427,
        40424,
        36297,
        31782,
        27655,
        23652,
        19525,
        15522,
        11395,
        7392,
        3265,
        61215,
        65342,
        53085,
        57212,
        44955,
        49082,
        36825,
        40952,
        28183,
        32310,
        20053,
        24180,
        11923,
        16050,
        3793,
        7920
    ];
    let crc = 65535;
    for(let i = 0; i < bytes.length; i++){
        const c = bytes[i];
        const j = (c ^ crc >> 8) & 255;
        crc = crcTable[j] ^ crc << 8;
    }
    let answer = (crc ^ 0) & 65535;
    let hex = numToHex(answer, 4);
    if (invert) return hex.slice(2) + hex.slice(0, 2);
    return hex;
}
function convertCode(qrCode, _encoding) {
    if (_encoding && _encoding != 'utf8') throw new QRCodeError(QRErrorCode.INVALID_PARAM, "encoding must be 'utf8'");
    return qrCode ?? '';
}
export function getRuleValidator() {
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
            let crcEl = root.getElement(63);
            if (crcEl.baseOffset != root.content.length - 8 || root.content.slice(-8, -4) != '6304') {
                throw new QRCodeError(QRErrorCode.INVALID_QRCODE, "CRC must be final element (63)");
            }
        }
    }).addRule({
        id: "valid-crc",
        description: "CRC is valid",
        rule: (root, _val)=>{
            let crcEl = root.getElement(63);
            let calculatedCRC = computeCRC(root.content.slice(0, -4));
            if (calculatedCRC != crcEl.content) {
                throw new QRCodeError(QRErrorCode.CRC_MISMATCH, "Invalid CRC");
            }
        }
    }).addRule({
        id: "one-or-more-mai",
        description: "Contains one or more Merchant Account Information elements",
        rule: (root, _val)=>{
            let maiList = Array.from(root.elements.keys()).filter((v)=>v >= 2 && v <= 51
            );
            if (maiList.length == 0) {
                throw new QRCodeError(QRErrorCode.MISSING_MANDATORY_ELEMENT, "Must have at least one Merchant Account Information");
            }
        }
    }).addRule({
        id: "mandatory-elements",
        description: "Contains EMV mandatory elements",
        rule: (root, _val)=>{
            mandatoryElements.forEach((tag2)=>{
                if (!root.hasElement(tag2)) throw new QRCodeError(QRErrorCode.MISSING_MANDATORY_ELEMENT, "Missing mandatory tag (" + tag2 + ")");
            });
        }
    }).addRule({
        id: "valid-elements",
        description: "Elements are valid",
        rule: (root, _val)=>{
            validateNode(root, rootScheme);
        }
    });
}
export class EMVMerchantQRCode extends QRCodeNode {
    type = "root";
    constructor(qrCode1, params1 = defaultParams){
        super('root', convertCode(qrCode1, params1.encoding));
    }
    static createCode(basicElements) {
        let root = new EMVMerchantQRCode();
        if (basicElements) {
            root.newDataElement(52, basicElements.merchantCategoryCode);
            root.newDataElement(53, ("000" + basicElements.transactionCurrency).slice(-3));
            root.newDataElement(58, basicElements.countryCode);
            root.newDataElement(59, basicElements.merchantCity);
            root.newDataElement(70, basicElements.merchantName);
            if (basicElements.oneTime) root.newDataElement(2, "12");
            if (basicElements.transactionAmount) root.newDataElement(54, basicElements.transactionAmount.toFixed(2));
        }
        return root;
    }
    static parseCode(qrCode, params) {
        params = {
            ...defaultParams,
            ...params
        };
        let root = new EMVMerchantQRCode(qrCode, params);
        function toTemplate(node, isIdentified, tag2, lastTag) {
            for(let index = tag2; index <= (lastTag ?? tag2); ++index){
                if (node.hasElement(index)) node.getElement(index).parseAsTemplate(isIdentified);
            }
        }
        toTemplate(root, true, EMVQR.MAI_TEMPLATE_FIRST, EMVQR.MAI_TEMPLATE_LAST);
        if (root.hasElement(62)) {
            toTemplate(root, false, 62);
            toTemplate(root.getElement(62), true, 50, 99);
        }
        toTemplate(root, false, 64);
        toTemplate(root, true, 80, 99);
        return root;
    }
    async validateCode(observer) {
        return getRuleValidator().validate(this, observer);
    }
    buildQRString() {
        let content2 = this.content;
        content2 = this.ensureDataElement(0, "01").buildQRString();
        content2 += super.buildQRString(content2.length);
        content2 += this.newDataElement(63, "0000").buildQRString(content2.length).slice(0, -4);
        const crc = computeCRC(content2);
        this.getElement(63).content = crc;
        this.baseOffset = 0;
        this.content = content2 = content2 + crc;
        return content2;
    }
    dumpCode() {
        function dumpNode(node, scheme, indent) {
            let result = "";
            if (node.isType('data')) {
                result += indent + ("00" + node.tag).slice(-2) + ' (' + scheme.name + ')' + "\n";
                result += indent + '  ' + node.content + "\n";
            } else {
                if (!node.isType('root')) {
                    result += indent + '(' + ("00" + node.tag).slice(-2) + '): ' + scheme.name + "\n";
                    indent += "  ";
                }
                node.elements.forEach((element)=>{
                    let nodeScheme = scheme?.elementMap?.[element.tag] ?? {
                        name: 'unknown',
                        elementMap: {
                        }
                    };
                    result += dumpNode(element, nodeScheme, indent);
                });
            }
            return result;
        }
        return dumpNode(this, rootScheme, "");
    }
}
