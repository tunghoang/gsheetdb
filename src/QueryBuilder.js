'use strict';
import { createHiddenSheet } from './HiddenSheet';

class QueryBuilder {
  constructor(options, spreadsheet, sheet) {
    this.spreadsheet = spreadsheet;
    this.sheet = sheet;
    this.options = options;
    this.select_clause = '';
    this.where_clause = '';
    this.rawQuery = '';
  }
  select() {
    for (let i = 0; i < arguments.length; i++) {
      this.select_clause += this.getColId(arguments[i]) + ',';
    }
    return this;
  }
  where(col_name, cmp, value, raw) {
    if (typeof value === 'undefined') {
      value = cmp;
      cmp = '=';
    }
    if (value instanceof Date) {
      value = value.toISOString();
    }
    this._append_where(col_name, cmp, value, 'AND', raw);

    return this;
  }
  orWhere(col_name, cmp, value, raw) {
    if (typeof value === 'undefined') {
      value = cmp;
      cmp = '=';
    }
    this._append_where(col_name, cmp, value, 'OR', raw);
    return this;
  }
  _append_where(col_name, cmp, value, combine, raw) {
    if (this.where_clause.length > 0) {
      this.where_clause += ' ' + combine + ' ';
    }
    this.where_clause += this.getColId(col_name) + ' ' + (raw ? raw : cmp + make_value(value));
  }
  getColId(colName) {
    return this.options.column_names.getColLabel(colName);
  }
  getSelectClause() {
    if (!this.select_clause || this.select_clause.length <= 0) {
      return ('SELECT *');
    }

    this.select_clause = this.select_clause.replace(/[\,\s]+$/, '');//trim extra , or spaces

    return 'SELECT ' + this.select_clause;
  }
  getWhereClause() {
    if (!this.where_clause) return '';
    return 'WHERE ' + this.where_clause;
  }
  getQuery() {
    return this.getSelectClause() + ' ' + this.getWhereClause();
  }
  runQuery(numRows) {
    let qry = this.rawQuery ? `"${this.rawQuery}"` : JSON.stringify(this.getQuery());
    let hidden_sheet = createHiddenSheet(this.spreadsheet, this.sheet.getName() + '_query');
    let last_col_label = this.options.column_names.getLastColLabel();
    let colref = "'" + this.sheet.getName() + "'!" + 'A' + ':' + last_col_label;
    let formula = `QUERY(${colref},${qry}, 1)`;
    let rows = hidden_sheet.runQuery(formula, numRows || (this.sheet.getLastRow() - 1));
    return rows;
  }
  toJSON(numRecords) {
    return this.options.column_names.makeJson(this.runQuery(numRecords));
  }
  raw(query) {
    this.rawQuery = query;
    return this;
  }
};

function make_value(val) {
  if (typeof val === 'string' || val instanceof String) {
    return ("'" + val + "'");
  }
  return val;
}

function getLastRow(range) {
  let rowNum = 0;
  let blank = false;
  for (let row = 0; row < range.length; row++) {
    if (range[row][0] === "" && !blank) {
      rowNum = row;
      blank = true;
    } else if (range[row][0] !== "") {
      blank = false;
    };
  };
  return rowNum;
};

export default QueryBuilder;
