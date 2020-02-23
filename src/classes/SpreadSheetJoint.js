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
    this.type = 'left'
  }
  sWhere(col_name, cmp, value) {
    this.sourceTable.query.where(col_name, cmp, value);
    return this;
  }
  dWhere(col_name, cmp, value) {
    this.destTable.query.where(col_name, cmp, value);
    return this;
  }
  setType(type) {
    this.type = type;
    return this;
  }
  toJSON(numRecords) {
    let sResults = this.sourceTable.query.toJSON(numRecords);
    let dResults = this.destTable.query.toJSON();
    if (!dResults || !dResults.length) {
      if (this.type === 'left') return sResults;
      else return [];
    }
    for (let sRecord of sResults) {
      let foreignKeyValue = sRecord[this.keyName];

      let dRecord = dResults.find((obj) => obj[this.destIdProp] === foreignKeyValue);
      if (this.type === 'inner' && !dRecord) continue;
      Object.assign(sRecord, { [this.joinProp || this.destTableName]: dRecord });
    }
    return sResults;
  }
}
export default SpreadSheetJoint;
