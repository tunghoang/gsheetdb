interface SpreadSheetDBOptions {
  accessToken: string,
  spreadsheetId: string,
  sheetSpecs?: object,
  header_row?: number
  id_column?: string,
  column_names?: Array<string>,
  init?: boolean,
}
export class SpreadSheetDB {
  constructor(options: SpreadSheetDBOptions);
  from<T = any>(tableName: string): SpreadSheetTable<T>;
  join<LT = any, RT = any>(leftSheet: string, rightSheet: string, joinKey: string, joinProp?: string): SpreadSheetJoint<LT, RT>;
}
interface SpreadSheetJoint<LT, RT> {
  sWhere(field: string, searchValue: any): SpreadSheetJoint<LT, RT>;
  sWhere(field: string, operator: string, searchValue: any, raw?: string): SpreadSheetJoint<LT, RT>;
  dWhere: SpreadSheetJoint<LT, RT>["sWhere"];
  setType(type: 'left' | 'inner'): SpreadSheetJoint<LT, RT>;
  toJSON(numRecords?: number): Array<any>;
}
interface SpreadSheetTable<T> {
  query: QueryBuilder<T>
  insert(record: T): boolean;
  update(key: string | number, field: string, value: any): boolean;
  update(key: string | number, updateObject: {}): boolean;
  delete(key: string | number): boolean;
  getLastRow(): T;
  getDataJSON(): Array<T>;
}
export class QueryBuilder<T> {
  select(...fields: Array<string>): QueryBuilder<T>;
  where(field: string, searchValue: any): QueryBuilder<T>;
  where(field: string, operator: string, searchValue: any, raw?: string): QueryBuilder<T>;
  toJSON(numRecords?: number): Array<T>;
  orWhere: QueryBuilder<T>["where"];
  raw(query: string): QueryBuilder<T>;
  getColId(colName: string): string;
}

export as namespace gsheetdb;
