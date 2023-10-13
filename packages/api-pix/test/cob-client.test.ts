import { CobClient, JSONFetcher } from '../src/mod.ts';
import { Cobranca, PartialCobranca } from '../src/deps.ts';

const baseUrl = "http://localhost:9666/api/";

function getCobClient( ): CobClient {
  const fc = new JSONFetcher({baseUrl});
  const client = new CobClient(fc, "cob");

  return client;
}

const cobData1: Cobranca = {
  chave: "99999999999",
  calendario: { expiracao: 86400 },
  valor: { original: "1234.00", modalidadeAlteracao: 1 },
}

Deno.test( {
  name: "COB  ",
  fn: async () => {
    const cobCli = getCobClient();
    const now = new Date();
    const txid = "1234";

    //console.log('\n');

    // List COBS
    console.log(await cobCli.getCobs( {
      inicio: now,
      fim: new Date(now.valueOf()+1),
    } ), '\n');

    // create
    console.log(await cobCli.putCob(txid, cobData1 ), '\n');

    // get it
    console.log(await cobCli.getCob(txid), '\n');

    // alter it's "chave"
    console.log(await cobCli.patchCob(txid, { chave: "11111111111" } ), '\n');

    // and alter a sub-field of "valor"
    const diff1: PartialCobranca = {
      valor: {
        desconto: {
          modalidade: 1,
          valorPerc: "100.00"
        }
      }
    };

    console.log(await cobCli.patchCob(txid, diff1 ), '\n');

    // now list again
    console.log(await cobCli.getCobs( {
      inicio: new Date( "2020-01-01"),
      fim: new Date()
    } ), '\n');
  } } );
