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
      sheetSpecs: {},
      init: null,
    }
    this.open(options);
  }

  open(options) {
    Object.assign(this.options, this.defaults, options);
    if (this.options.source_url) {
      this.spreadsheet = SpreadsheetApp.openByUrl(this.options.source_url);
    }
    let init = this.options.init;
    if (typeof init !== 'boolean') {
      const scriptCache = CacheService.getScriptCache();
      init = JSON.parse(scriptCache.get('init' + this.options.source_url));
      if (typeof init !== 'boolean') {
        init = true;
        scriptCache.put('init' + this.options.source_url, 'true');
      }
    }
    if (!init || !this.spreadsheet) return;
    console.log('spreadsheet reinit');
    let sheetNames = this.spreadsheet.getSheets().map(s => s.getName());
    for (const sheetName in this.options.sheetSpecs) {
      if (sheetNames.includes(sheetName)) continue;
      const sheetSpec = this.options.sheetSpecs[sheetName];
      const newSheet = this.spreadsheet.insertSheet(sheetName);
      if (Array.isArray(sheetSpec[0])) {
        for (const row of sheetSpec) {
          newSheet.appendRow(row);
        }
      } else {
        newSheet.appendRow(sheetSpec);
      }
    }
    CacheService.getScriptCache().put('init' + this.options.source_url, 'false', 21600);
  }

  from(sheetName) {
    return new SpreadSheetTable({
      spreadsheet: this.spreadsheet,
      sheet: this.spreadsheet.getSheetByName(sheetName),
      opts: {
        column_names: getColumnNames(this.options.sheetSpecs[sheetName])
      }
    });
  }

  join(sheetName1, sheetName2, joinKey, joinProp) {
    return new SpreadSheetJoint(this.from(sheetName1), this.from(sheetName2), joinKey, joinProp);
  }
}
export default SpreadSheetDB;

function getColumnNames(sheetSpec) {
  if (!Array.isArray(sheetSpec)) return sheetSpec;
  return Array.isArray(sheetSpec[0]) ? sheetSpec[0] : sheetSpec;
}
