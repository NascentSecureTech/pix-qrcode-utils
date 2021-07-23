export interface DB {}

export interface DBContext {
  db?: DB;
}

export interface DBCursor<A> {
  //
  count: number;
  //
  getItem(): A;
  //
  nextItem(): boolean;
  //
  isEOF(): boolean;
  //
  abort(): void;
}
