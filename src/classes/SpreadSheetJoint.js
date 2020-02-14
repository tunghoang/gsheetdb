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
    let self = this;
    let results = [];
    let sResults = this.sourceTable.query.toJSON();
    let dResults = this.destTable.query.toJSON();
    for (let sRecord of sResults) {
      let foreignKeyValue = sRecord[this.keyName];
      let dRecord = dResults.find(function (obj) {
        return obj[self.keyName] === foreignKeyValue;
      });
      if (dRecord) {
        results.push(Object.assign(sRecord, { [self.joinProp || this.destTable.sheet.getName()]: dRecord }));
      }
    }
    return results;
  }
}
export default SpreadSheetJoint;
