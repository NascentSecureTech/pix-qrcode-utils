export interface Calendario {
  /** Timestamp que indica o momento em que foi criada a cobrança. Respeita o formato definido na RFC 3339. */
  criacao?: string;

  /** Timestamp que indica o momento em que o payload JSON que representa a cobrança foi recuperado. Ou seja, idealmente, é o momento em que o usuário realizou a captura do QR
 Code para verificar os dados de pagamento. Respeita o formato definido na RFC 3339. */
  apresentacao?: string;

  /** Tempo de vida da cobrança, especificado em segundos a partir da data de criação (Calendario.criacao) */
  expiracao?: number;

  /** Data, no formato `YYYY-MM-DD`, segundo ISO 8601. É a data de vencimento da cobrança. A cobrança pode ser honrada até esse dia, inclusive, em qualquer hor
ário do dia. */
  dataDeVencimento?: string;

  /** Quantidade de dias corridos após calendario.dataDeVencimento, em que a cobrança poderá ser paga. */
  validadeAposVencimento?: number;
}
