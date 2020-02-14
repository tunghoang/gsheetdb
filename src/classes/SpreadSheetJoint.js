'use strict';
import { createHiddenSheet } from './HiddenSheet';
import ColumnNames from './ColumnNames';
import QueryBuilder from './QueryBuilder';

class SpreadSheetJoint {
  constructor(sourceTable, destTable, keyName, joinProp) {
    this.sourceTable = sourceTable;
    this.destTable = destTable;
    this.keyName = keyName;
    this.joinProp = joinProp;
    this.destIdProp = this.destTable.getIdProp();
    this.destTableName = this.destTable.sheet.getName();
  }
  sWhere(col_name, cmp, value) {
    this.sourceTable.query.where(col_name, cmp, value);
    return this;
  }
  dWhere(col_name, cmp, value) {
    this.destTable.query.where(col_name, cmp, value);
    return this;
  }
  toJSON() {
    let results = [];
    let sResults = this.sourceTable.query.toJSON();
    let dResults = this.destTable.query.toJSON();
    for (let sRecord of sResults) {
      let foreignKeyValue = sRecord[this.keyName];

      let dRecord = dResults.find((obj) => obj[this.destIdProp] === foreignKeyValue);
      if (dRecord) {
        results.push(Object.assign(sRecord, { [this.joinProp || this.destTableName]: dRecord }));
      }
    }
    return results;
  }
}
export default SpreadSheetJoint;
