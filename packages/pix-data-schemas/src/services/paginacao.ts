//
export interface Paginacao {
  //
  paginaAtual?: number;
  //
  itensPorPagina?: number;
}

//
export interface Paginado<A> extends Paginacao {
  //
  quantidadeDePaginas: number;
  //
  quantidadeTotalDeItens: number;
  //
  items?: A[];
}
