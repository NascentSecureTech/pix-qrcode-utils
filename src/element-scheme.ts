export interface QRSchemeElement {
  lastTag?: number;

  optional?: boolean;

  name: string;

  elementMap?: QRElementSchemeMap;
}

export type QRElementSchemeMap = Record<number, QRSchemeElement>;

const paymentSystemSpecificTemplateMap = {
  0: {
    name: 'Globally Unique Identifier',
    optional: true,
  },
  1: {
    lastTag: 99,
    name: 'Payment System specific',
    optional: true,
  },
}

const reservedTemplateMap = {
  0: {
    name: 'Globally Unique Identifier',
    optional: true,
  },
  1: {
    lastTag: 99,
    name: 'Context specific data',
    optional: true,
  },
}

const additionalDataFieldMap: QRElementSchemeMap = {
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

const merchantInformationLanguageTemplateMap = {
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
}

export const emvElementScheme: QRElementSchemeMap = {
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
//    presence: 'C',
  },
  55: {
    name: 'Tip or Convenience Indicator',
    optional: true,
  },
  56: {
    name: 'Value of Convenience Fee Fixed',
//    presence: 'C',
  },
  57: {
    name: 'Value of Convenience Fee Percentage',
//    presence: 'C',
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
