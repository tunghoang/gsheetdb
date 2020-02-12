declare namespace gsheetdb {
  interface SpreadSheetDBOptions {
    source_url: string,
    sheetSpecs: object,
    header_row?: number
    id_column?: string,
    column_names?: string[],
  }
  class SpreadSheetDB {
    constructor(options: SpreadSheetDBOptions);
    from<T = any>(tableName: string): Table<T>;
  }
  interface Table<T> {
    query: QueryBuilder<T>
    insert(record: T): boolean;
    update(key: string, field: string, value: string): boolean;
  }
  class QueryBuilder<T> {
    select(...fields: string[]): QueryBuilder<T>;
    where(field: string, searchValue: any): QueryBuilder<T>;
    where(field: string, operator: string, searchValue: any): QueryBuilder<T>;
    getResultsJson(): T[];
    orWhere: QueryBuilder<T>["where"];
  }
}

export default gsheetdb;
