interface SpreadSheetDBOptions {
  source_url: string,
  sheetSpecs: object,
  header_row?: number
  id_column?: string,
  column_names?: string[],
}
export class SpreadSheetDB {
  constructor(options: SpreadSheetDBOptions);
  from<T = any>(tableName: string): SpreadSheetTable<T>;
  join<LT = any, RT = any>(leftSheet: string, rightSheet: string, joinKey: string, joinProp?: string): SpreadSheetJoint<LT, RT>;
}
interface SpreadSheetJoint<LT, RT> {
  sWhere: QueryBuilder<LT>["where"];
  dWhere: QueryBuilder<RT>["where"];
  toJSON(numRecords?: number): any[];
}
interface SpreadSheetTable<T> {
  query: QueryBuilder<T>
  insert(record: T): boolean;
  update(key: string, field: string, value: any): boolean;
  update(key: string, updateObject: {}): boolean;
  delete(key: string): boolean;
  getLastRow(): T;
  getDataJSON(): T[];
}
export class QueryBuilder<T> {
  select(...fields: string[]): QueryBuilder<T>;
  where(field: string, searchValue: any): QueryBuilder<T>;
  where(field: string, operator: string, searchValue: any): QueryBuilder<T>;
  toJSON(numRecords?: number): T[];
  orWhere: QueryBuilder<T>["where"];
}

export as namespace gsheetdb;
