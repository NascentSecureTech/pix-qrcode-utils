import { ValidationObserver } from "./deps.ts";
import { EMVMerchantQRCode, QRCodeNode, EMVMerchantQRParams, EMVQRCodeBasicElements, EMVQR } from "./deps.ts";
import { getPIXRuleValidator, PIXQRCodeError, PIXQRErrorCode } from './pix-qrcode-validator.ts';

export class PIX {
  static GUI = 'br.gov.bcb.pix';

  static TAG_MAI_CHAVE = 1;
  static TAG_MAI_INFO_ADD = 2;
  static TAG_MAI_URL = 25
}

export interface PIXDynamicElements extends EMVQRCodeBasicElements {
  type: "dynamic";

  //
  url: string;

  // PIX v2 - must be "***"
  txid?: string;
}

export interface PIXStaticElements extends EMVQRCodeBasicElements {
  type: "static";

  //
  chave: string;

  //
  txid?: string;

  //
  infoAdicional?: string;
}

export type PIXQRCodeElements = PIXStaticElements | PIXDynamicElements;

const defaultPIXCodeElements = {
  merchantCategoryCode: "0000",
  transactionCurrency: 986,
  countryCode: "BR",
  merchantName: "PIX",
  merchantCity: "Cidade",
  txid: "***",
}


const defaultParams: EMVMerchantQRParams = {
  encoding: 'utf8',
}

export class PIXQRCode {
  protected _emvQRCode: EMVMerchantQRCode;

  get emvQRCode() { return this._emvQRCode }

  getMAI(): QRCodeNode {
    const maiList = this.emvQRCode.findIdentifiedTemplate(PIX.GUI, EMVQR.MAI_TEMPLATE_FIRST, EMVQR.MAI_TEMPLATE_LAST);

    return maiList[0];
  }

  protected constructor(emvQRCode: EMVMerchantQRCode) {
    this._emvQRCode = emvQRCode;
  }

  static createCode(elements: PIXQRCodeElements): PIXQRCode {
    const cleanupObject = (obj: any) => Object.entries(obj).reduce((a, [k, v]) => (v === undefined ? a : (a[k] = v, a)), {} as any);

    const pixElements: PIXQRCodeElements = {
      ...defaultPIXCodeElements,
      ...cleanupObject(elements)
    }
    const pixQRCode = new PIXQRCode(EMVMerchantQRCode.createCode(pixElements));
    const emvQRCode = pixQRCode.emvQRCode;

    const guiNode = new QRCodeNode('data', PIX.GUI, EMVQR.TAG_TEMPLATE_GUI);

    const maiPIX = emvQRCode.newTemplateElement(EMVQR.MAI_TEMPLATE_FIRST, EMVQR.MAI_TEMPLATE_LAST, true, [guiNode]);

    if (pixElements.type == "static") {
      if (pixElements.chave)
        maiPIX.newDataElement(PIX.TAG_MAI_CHAVE, pixElements.chave);

      if (pixElements.infoAdicional)
        maiPIX.newDataElement(PIX.TAG_MAI_INFO_ADD, pixElements.infoAdicional);

    } else {
      if (pixElements.url)
        maiPIX.newDataElement(PIX.TAG_MAI_URL, pixElements.url);
    }

    const el62 = emvQRCode.newTemplateElement(EMVQR.TAG_ADDITIONAL_DATA);
    el62.newDataElement(EMVQR.TAG_AD_REF_LABEL, pixElements.txid ?? "***");

    return pixQRCode;
  }

  static parseCode(qrCode: string,
    params?: EMVMerchantQRParams): PIXQRCode {

    params = {
      ...defaultParams,
      ...params
    };

    const pixQRCode = new PIXQRCode(EMVMerchantQRCode.parseCode(qrCode, params));

    return pixQRCode;
  }

  public async validateCode(observer?: ValidationObserver) {
    return await getPIXRuleValidator().validate(this, observer);
  }

  isPIX(test: "pix" | "valid" | "static" | "dynamic"): boolean {
    const pixMAI = this.getMAI();
    if (!pixMAI)
      return false;

    const isStatic = pixMAI.hasElement(PIX.TAG_MAI_CHAVE);
    const isDynamic = pixMAI.hasElement(PIX.TAG_MAI_URL);

    switch (test) {
      case "pix": return true;
      case "valid": return isStatic || isDynamic;
      case "static": return isStatic;
      case "dynamic": return isDynamic;
    }
  }

  extractElements(): PIXQRCodeElements {
    const emvQR = this.emvQRCode;
    const basicElements = emvQR.extractElements();
    const pixMAI = this.getMAI();

    if (this.isPIX('static')) {

      return {
        type: 'static',
        ...basicElements,
        chave: pixMAI?.getElement(PIX.TAG_MAI_CHAVE).content,
        infoAdicional: pixMAI?.hasElement(PIX.TAG_MAI_INFO_ADD) ? pixMAI?.getElement(PIX.TAG_MAI_INFO_ADD).content : undefined,
        transactionAmount: emvQR.hasElement(EMVQR.TAG_TRANSACTION_AMOUNT) ? parseFloat(emvQR.getElement(EMVQR.TAG_TRANSACTION_AMOUNT).content) : undefined,
        txid: emvQR.getElement(EMVQR.TAG_ADDITIONAL_DATA)?.getElement(EMVQR.TAG_AD_REF_LABEL)?.content,
      }
    }
    else if (this.isPIX('dynamic')) {
      return {
        type: 'dynamic',
        ...basicElements,
        url: this.getMAI()?.getElement(PIX.TAG_MAI_URL).content
      }
    }

    throw new PIXQRCodeError(PIXQRErrorCode.INVALID_QRCODE, "Unable to extract static/dynamic elements")
  }
}
