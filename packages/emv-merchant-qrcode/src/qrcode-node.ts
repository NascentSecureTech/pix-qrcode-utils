import { valueIn } from './data-utils.ts';
import { QRCodeError, QRErrorCode } from './qrcode-validator.ts';

export const TAG_INIT = 0;
export const TAG_CRC = 63;

type QRElementMap = Map<number, QRCodeNode>;

type QRNodeType = 'root' | 'element' | 'template' | 'identified-template' | 'void';

export class QRCodeNode {
  type: QRNodeType;
  isType( type: QRNodeType ) { return this.type == type };
  isTemplate() { return this.isType( 'template' ) || this.isType('identified-template')}

  protected _content: string;
  get content(): string {
    return this._content;
  }

  set content( content: string ) {
    this._content = content;
  }

  readonly tag?: number;

  baseOffset: number;

  elements: QRElementMap;

  constructor( type: QRNodeType, content: string, tag?: number, baseOffset: number = 0 ) {
    this.type = type;

    this.baseOffset = baseOffset;

    this.tag = tag;

    this._content = content;

    switch( type ) {
      case "root":
      case "template":
        this.elements = this.parseElementSequence( content, baseOffset );
        break;

      default:
        this.elements = new Map();
    }
  }

  protected parseElementSequence( sequence: string, baseOffset: number = 0 ): QRElementMap {
    let elements: QRElementMap = new Map();
    let end = sequence.length;

    let index = 0;
    while( index + 4 < end ) {
      let pos = baseOffset + index;

      if ( !/^\d{4}$/.test( sequence.substr( index, 4 ) ) ) {
        throw new QRCodeError( QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: invalid tag or length characters @ " + (1 + pos) );
      }

      let tag = parseInt( sequence.substr( index, 2 ) );
      let len = parseInt( sequence.substr( index+2, 2 ) );

      if ( index + len + 4 > end ) {
        throw new QRCodeError( QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: invalid length @" + (1 + pos) );
      }

      let content = sequence.substr( index+2+2, len );

      elements.set( tag, new QRCodeNode( 'element', content, tag, pos ) );

      index += 4 + len;
    }

    if ( index != end ) {
      throw new QRCodeError( QRErrorCode.INVALID_QRCODE, "Error parsing qrcode string: extra characters at end @" + (1 + baseOffset + index) );
    }

    return elements;
  }

  parseAsTemplate( isIdentified: boolean ): this {
    if ( !this.isTemplate( ) ) {
      this.elements = this.parseElementSequence( this.content, this.baseOffset );
      this.type = isIdentified ? 'identified-template' : 'template';
    }

    return this;
  }


  hasElement( tag: number ): boolean {
    return this.elements.has( tag );
  }

  getElement( tag: number ): QRCodeNode {
    if ( !this.elements.has( tag ) )
      return new QRCodeNode( "void", "", tag );

    return this.elements.get( tag )!;
  }

  newElement( tag: number, content: string ): QRCodeNode {
    let node = new QRCodeNode( "element", content, tag );

    this.elements.set( tag, node );

    return node;
  }

  deleteElement( tag: number ) {
    this.elements.delete( tag );
  }

  toJSON(): {} {
    let json = {
      type: this.type,
      tag: this.tag??undefined,
      content: this.content,
      elements: !this.isType( "element" ) ? Array.from( this.elements.values() ).map( (value: QRCodeNode ) => value.toJSON() ): undefined
    };

    return json;
  }

  ensureElement( tag: number, defaultContent: string = "" ): QRCodeNode {
    return this.hasElement( tag ) ? this.getElement( tag ) : this.newElement( tag, defaultContent );
  }

  buildTagLength(): string {
    let ts = ("00" + this.tag!.toString()).slice(-2);

    let len = ("00" + this.content.length.toString()).slice(-2);

    return ts + len;
  }

  buildQRString( offset: number = 0 ): string {
    const isRoot = this.isType( "root" );

    this.baseOffset = offset;

    if ( !isRoot )
      offset += 2 + 2;

    // rebuild content from children
    if ( !this.isType( "element" ) ) {
      let qrs: string[] = [];

      this.elements.forEach( ( element )=> {
        if ( !isRoot || !valueIn( [ TAG_INIT, TAG_CRC ], element.tag )  ) {
          let els = element.buildQRString( offset );

          qrs.push( els );

          offset += els.length;
        }
      } );

      this._content = qrs.join( "" );
    }

    let content = this._content;

    if ( !isRoot ) {
      content = this.buildTagLength() + content;
    }

    return content;
  }

  findIdentifiedTemplate( id: string, first: number = 0, last: number = 99 ): QRCodeNode[] {
    let found: QRCodeNode[] = [];

    this.elements.forEach( (element) => {
      if ( element.isType('identified-template')
        && element.tag! >= first
        && element.tag! <= last
        && element.hasElement( 0 )
        && element.getElement(0).content.toUpperCase() == id.toUpperCase() ) {
          found.push( element );
        }
    })

    return found;
  }
}
