'use strict';
import { createHiddenSheet } from './HiddenSheet';
import ColumnNames from './ColumnNames';
import QueryBuilder from './QueryBuilder';

class SpreadsheetTable {
  constructor(options) {
    this.spreadsheet = options.spreadsheet;
    this.sheet = options.sheet;
    this.options = {};
    this.defaults = {
      header_row: 1,
      column_names: null,
      id_column: 'A'
    }
    this.open(options.opts);
  }

  open(options) {
    Object.assign(this.options, this.defaults, options);

    if (!this.options.column_names) {
      this.options.column_names = this.getHeaderRow();
    }

    this.options.column_names = new ColumnNames(this.options.column_names);

    this.query = new QueryBuilder(this.options, this.spreadsheet, this.sheet);
  }

  getLastColumn() {
    return this.sheet.getLastColumn();
  }

  getLastRow() {
    return this.sheet.getLastRow();
  }
  /* get the First Row with column headings */
  getHeaderRow() {
    return this.getRowValues(this.options.header_row);
  }
  getRowValues(row) {
    try {
      var range = this.sheet.getRange(row, 1, 1, this.getLastColumn());
      var rows = range.getValues();
      return rows[0];
    }
    catch (e) {
      return [];
    }
  }

	/*
	if @range is null, get the whole sheet of data in json format
	Note: this can be heavy if the sheet is large
	 */
  getDataJSON(range = null) {
    let datamx = [];
    if (!range) {
      datamx = this.sheet.getDataRange().getValues();
    }
    else {
      datamx = this.sheet.getRange(range).getValues();
    }

    return (this.options.column_names.makeJson(datamx, 1));
  }

  findRowById(id) {
    let column = this.options.id_column;

    let formula = make_match_formula(id, column, this.sheet.getName());

    let hidden_sheet = createHiddenSheet(this.spreadsheet, this.sheet.getName() + '_search_sheet');
    let row = hidden_sheet.runFormula(formula);
    return row;
  }

  getRowDataById(id) {
    let row = this.findRowById(id);

    let result = this.getDataJSON(row + ':' + row);
    if (result && result.length) {
      if (result.length == 1) {
        return result[0];
      }
    }
    return result;
  }

  update(id, arg1, arg2) {
    const row = this.findRowById(id);
    if (row < 1) return false;
    if (typeof arg1 === 'string') {
      const [colName, colValue] = [arg1, arg2];
      const col = this.options.column_names.getColNumber(colName);
      if (col < 1) return false;
      if (colValue && typeof colValue !== 'string') {
        colValue = JSON.stringify(colValue);
      }
      this.sheet.getRange(row, col, 1).setValue(colValue);
      return true;
    } else {
      const obj = arg1;
      const rowVal = this.findRowById(id);
      for (const key in obj) {
        const col = this.options.column_names.getColNumber(key);
        if (obj[key] && typeof (obj[key]) !== 'string') {
          obj[key] = JSON.stringify(obj[key]);
        }
        rowVal[col] = obj[key];
      }
      this.sheet.getRange(row, 0, 1).setValues(rowVal)
    }
  }
  insert(rec) {
    if (!rec) throw 'Nothing to insert';
    let row = this.options.column_names.jsonToRow(rec);
    this.sheet.appendRow(row);
    return true;
  }

}

export function make_match_formula(needle, col, sheet_name) {
  let colref = "'" + sheet_name + "'!" + col + ':' + col;
  let formula = `MATCH(${JSON.stringify(needle)}, ${colref}, 0)`;

  return formula;
}

export default SpreadsheetTable;
