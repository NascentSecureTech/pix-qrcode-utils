export interface ElementSchema {
  name: string;

  type?: 'string'|'integer'|'boolean'|'date';

  optional?: boolean;

  pattern?: string | RegExp;

  length?: number | { min?: number; max?: number; };
}
