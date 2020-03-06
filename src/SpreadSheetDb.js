'use strict';
import SpreadSheetApp, { SpreadSheet } from './SpreadSheetApp';
import SpreadSheetJoint from './SpreadSheetJoint';
import SpreadSheetTable from './SpreadSheetTable';

class SpreadSheetDB {
  constructor(options) {
    this.spreadsheet = null;
    this.sheetTables = {};
    this.options = {};
    this.defaults = {
      header_row: 1,
      id_column: 'A',
      spreadsheetId: null,
      sheetSpecs: {},
      init: null,
    }
    this.open(options);
  }

  open(options) {
    Object.assign(this.options, this.defaults, options);
    if (!this.options.spreadsheetId) return;
    let init = this.options.init;
    if (typeof init !== 'boolean') {
      const scriptCache = CacheService.getScriptCache();
      init = JSON.parse(scriptCache.get('init' + this.options.spreadsheetId));
      if (typeof init !== 'boolean') {
        init = true;
        scriptCache.put('init' + this.options.spreadsheetId, 'true');
      }
    }
    const scriptCache = CacheService.getScriptCache();
    const spreadsheetId = this.options.spreadsheetId;
    if (!init) {
      const cached = JSON.parse(scriptCache.get('cached' + spreadsheetId));
      if (cached) {
        this.spreadsheet = new SpreadSheetApp(this.options.accessToken).openByData(cached);
      }
    }
    if (!this.spreadsheet) {
      this.spreadsheet = new SpreadSheetApp(this.options.accessToken).openById(spreadsheetId);
      if (!init) {
        scriptCache.put('cached' + spreadsheetId, JSON.stringify({ ...this.spreadsheet.data, properties: {} }), 21600);
      }
    }
    if (!init || !this.spreadsheet) return;
    console.log('spreadsheet reinit');
    const sheetNames = this.spreadsheet.getSheets().map(s => s.getName());
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
    this.spreadsheet = new SpreadSheetApp(this.options.accessToken).openById(spreadsheetId);
    scriptCache.put('cached' + spreadsheetId, JSON.stringify({ ...this.spreadsheet.data, properties: {} }), 21600);
    scriptCache.put('init' + this.options.spreadsheetId, 'false', 21600);
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
