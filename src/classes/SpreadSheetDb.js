'use strict';
import SpreadSheetTable from './SpreadSheetTable';
import SpreadSheetJoint from './SpreadSheetJoint';

class SpreadSheetDB {
  constructor(options) {
    this.spreadsheet = null;
    this.sheetTables = {};
    this.options = {};
    this.defaults = {
      header_row: 1,
      id_column: 'A',
      source_url: null,
    }
    this.open(options);
  }

  open(options) {
    Object.assign(this.options, this.defaults, options);

    if (this.options.source_url) {
      this.spreadsheet = SpreadsheetApp.openByUrl(this.options.source_url);
      let sheets = this.spreadsheet.getSheets();
      for (let i = 0; i < sheets.length; i++) {
        let sheetName = sheets[i].getName();
        if (sheetName.includes('_search_sheet')) continue;
        if (sheetName.includes('_query_sheet')) continue;
        let sheetTable = new SpreadSheetTable({
          spreadsheet: this.spreadsheet,
          sheet: sheets[i],
          opts: {
            column_names: this.options.sheetSpecs[sheetName]
          }
        });
        this.sheetTables[sheetName] = sheetTable;
      }
    }
  }

  from(sheetName) {
    return this.sheetTables[sheetName];
  }

  join(sheetName1, sheetName2, keyName) {
    return new SpreadSheetJoint(this.sheetTables[sheetName1], this.sheetTables[sheetName2], keyName);
  }
}
export default SpreadSheetDB;
