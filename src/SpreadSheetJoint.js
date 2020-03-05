'use strict';

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
    const results = [];
    const sResults = this.sourceTable.query.toJSON(numRecords);
    const dResults = this.destTable.query.toJSON();
    if (!dResults || !dResults.length) {
      if (this.type === 'left') return sResults;
      else return results;
    }
    for (let sRecord of sResults) {
      const foreignKeyValue = sRecord[this.keyName];
      const dRecord = dResults.find((obj) => obj[this.destIdProp] === foreignKeyValue);
      if (this.type === 'inner' && !dRecord) continue;
      results.push(Object.assign(sRecord, { [this.joinProp || this.destTableName]: dRecord }));
    }
    return results;
  }
}
export default SpreadSheetJoint;
