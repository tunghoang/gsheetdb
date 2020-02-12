'use strict';
'use strict';

import { createHiddenSheet } from './HiddenSheet';
import ColumnNames from './ColumnNames';
import QueryBuilder from './QueryBuilder';

class SpreadSheetJoint {
  constructor(sourceTable, destTable, keyName) {
    this.sourceTable = sourceTable;
    this.destTable = destTable;
    this.keyName = keyName;
  }
  sWhere(col_name, cmp, value) {
    this.sourceTable.query.where(col_name, cmp, value);
    return this;
  }
  dWhere(col_name, cmp, value) {
    this.destTable.query.where(col_name, cmp, value);
    return this;
  }
  getResultsJson() {
    let self = this;
    let results = [];
    let sResults = this.sourceTable.query.getResultsJson();
    let dResults = this.destTable.query.getResultsJson();
    for (let sRecord of sResults) {
      let foreignKeyValue = sRecord[this.keyName];
      let dRecord = dResults.find(function (obj) {
        return obj[self.keyName] === foreignKeyValue;
      });
      if (dRecord) {
        results.push(Object.assign(sRecord, dRecord));
      }
    }
    return results;
  }
}
export default SpreadSheetJoint;

