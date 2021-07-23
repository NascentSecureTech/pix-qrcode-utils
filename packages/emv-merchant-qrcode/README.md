# emv-merchant-qrcode

## Importing
This package exports a javascript ES6 module in './dist/emv-merchant-qrcode.bundle.js'

## Parsing QR Code strings

`
let qrs = "" // EMV QR Code as UTF8 string

// Parse QR Code
let qr = EMVMerchantQRCode.parseCode( qrs );

// qr is the 'root' node of the QR Code and has a set of child elements, indexed by 'tag'
```
  qr.hasTag( tag )      returns true/false if tag exists`

  qr.getElement( tag )  returns a child node, that may be a data element or a template
```

  data:       content string
  template:
  qr.isType('data')
  qr.isType('template')
  qr.isType('identifier-template')    S
