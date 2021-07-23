import { PIX, EMVQR, PIXQRCode, PIXQRCodeElements, QRCodeNode, QRElementSchema, rootEMVSchema } from "./deps.ts";
import { createCode } from './pix-qrcode-wrapper.ts';

var document = (window as any).document;

function createTable( el: any, hdrs: string[] ) {
  // Create a table element
  let table = document.createElement("table");

  table.classList.add("table");

  // Create table row tr element of a table
  let tr = table.insertRow(-1);

  for (let i = 0; i < hdrs.length; i++) {
    // Create the table header th element
    let theader = document.createElement("th");
    theader.innerText = hdrs[i];

    // Append columnName to the table row
    tr.appendChild(theader);
  }

  el.innerHTML = "";
  el.appendChild(table);

  return table;
}

function insertRow( table: any, cols: string[] ) {
  // Create a new row
  let trow = table.insertRow(-1);

  for (let j = 0; j < cols.length; j++) {
    let cell = trow.insertCell(-1);

    // Inserting the cell at particular place
    cell.innerHTML = cols[j];
  }

  return trow;
}

export function renderQRTable( value: string ) {
  var el = document.getElementById("results");
  let qr = PIXQRCode.parseCode( value );

  function render( el: any, qrn: QRCodeNode, schema: QRElementSchema ) {
    let table = createTable( el, [ "", "ID", "EMV Name", "Len", "Value" ] );
    let elementMap = schema?.elementMap;

    if ( schema?.identifiedElementMap ) {
      if ( qrn.hasElement( EMVQR.TAG_TEMPLATE_GUI ) ) {
        let gui = qrn.getElement( EMVQR.TAG_TEMPLATE_GUI ).content.toUpperCase();

        for( let xx in schema.identifiedElementMap ) {
          if ( xx.toUpperCase() == gui ) {
            elementMap = {
              ...elementMap,
              ...schema.identifiedElementMap[xx]
            }
          }
        }
      }
    }

    for( let nn of qrn.elements ) {
      const node = nn[1];
      let ch = ( node.isTemplate() ) ? "-" : "";
      let nodeSchema = elementMap?.[ node.tag! ] ?? { name: 'unknown', elementMap: {} };

      let trow = insertRow( table, [ ch, node.tag!.toString(), nodeSchema.name, node.content.length.toString(), node.content ] );

      if ( node.isTemplate() ) {
        trow.firstChild.outerHTML = "<td onclick='openCloseRow(this);'><i class='fas fa-chevron-down'></i></td>";

        // Create a new row
        trow = table.insertRow(-1);
        trow.classList.add('is-collapsed');

        let cell = trow.insertCell(-1);

        cell = trow.insertCell(-1);
        cell.colSpan = 4;

        render( cell, node, nodeSchema );
      }
    }
  }
  let qrn = qr.emvQRCode;

  let elMap: { [index:string]:any } = rootEMVSchema.elementMap[26].identifiedElementMap = { };
  elMap[ PIX.GUI ] = {
    1: { name: "Chave PIX" },
    2: { name: "Informações Adicionais"},
    25: { name: "URL do Payload" }
  }

  render( el, qrn, rootEMVSchema );
}

export function openCloseRow( el: any ) {
  let row = el.parentNode.nextSibling;

  if ( row.classList.contains('is-collapsed') ) {
    row.classList.remove('is-collapsed');
    row.firstChild.outerHTML = "<td onclick='openCloseRow(this);'><i class='fas fa-chevron-up'></i></td>";
  }
  else {
    row.classList.add('is-collapsed');
    row.firstChild.outerHTML = "<td onclick='openCloseRow(this);'><i class='fas fa-chevron-down'></i></td>";
  }
}

var tabIndex = 0;

export function closePIXDialog( ok: boolean ) {
  const $qrInfoModal = document.getElementById("qr-info-modal");

  let qrInfo: PIXQRCodeElements;

  const defs = {
    merchantCategoryCode: "0000",
    transactionCurrency: 986,
    countryCode: "BR",
    merchantCity: "Porto Alegre",
    merchantName: "PIX"
  }

  switch( tabIndex ) {
    case 0: // static
      qrInfo = {
        type: "static",
        ...defs,
        chave: document.getElementById("pix-chave").value,
        merchantName: document.getElementById("pix-nome").value,
        txid: document.getElementById("pix-txid").value,
        infoAdicional: document.getElementById("pix-info-add").value,
      };
      if ( ok && ( qrInfo.chave.length == 0 ) )
        return;
      break;


    default:
    case 1: // dynamic
      qrInfo = {
        type: "dynamic",
        ...defs,
        url: document.getElementById("pix-url").value,
      };
      if ( ok && ( qrInfo.url.length == 0 ) )
        return;
      break;
  }

  if ( ok ) {
    createCode( qrInfo );
  }

  $qrInfoModal.classList.remove("is-active");
}

export function showPIXDialog( qrInfos: PIXQRCodeElements ) {
  const $qrInfoModal = document.getElementById("qr-info-modal");

  if ( !qrInfos ) {
    qrInfos = { type: "static" } as any;
  }

  if ( qrInfos.type == "static" ) {
    document.getElementById("pix-chave").value = qrInfos.chave??"";
    document.getElementById("pix-nome").value = qrInfos.merchantName??"";
    document.getElementById("pix-txid").value = qrInfos.txid??"";
    document.getElementById("pix-info-add").value = qrInfos.infoAdicional??"";

    changeTab( 0 );
  }
  else {
    document.getElementById("pix-url").value = qrInfos.url??"";
    changeTab( 1 );
  }

  $qrInfoModal.classList.add("is-active");
}

function changeTab(tab: number) {
  const $qrInfoModal = document.getElementById("qr-info-modal");
  const $tabs = $qrInfoModal.getElementsByClassName("tabs")[0];

  let $tabList = $tabs.getElementsByTagName("li");
  let $tabContentList = $qrInfoModal.getElementsByClassName("content-tab");

  for (let $tab of $tabList) {
    $tab.classList.remove("is-active");
  }
  $tabList[tab].classList.add("is-active");

  for (let $tabContent of $tabContentList) {
    $tabContent.classList.add("is-hidden");
  }
  $tabContentList[tab].classList.remove("is-hidden");

  tabIndex = tab;
}
