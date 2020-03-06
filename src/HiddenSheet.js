/*
class HiddenSheet {
  constructor(spreadsheet, name) {
    this.create(spreadsheet, name);
  }
  create(spreadsheet, name) {
    this.spreadsheet = spreadsheet;
    this.sheet = spreadsheet.getSheetByName(name);
    if (!this.sheet) {
      this.sheet = spreadsheet.insertSheet(name, { hidden: true });
    }
    return this;
  }
  runFormula(formula) {
    this.sheet.getRange('A1').setFormula('=' + formula);

    return this.sheet.getRange('A1').getValue();
  }
  runQuery(formula, numRows) {
    this.sheet.getRange('A1').setFormula('=' + formula);
    return this.sheet.getRange(2, 1, Math.max(1, numRows || (this.sheet.getLastRow() - 1)), this.sheet.getLastColumn()).getValues();
  }
}
 */
class HiddenSheets {
  constructor(spreadsheet, name) {
    this.numSheets = 8;
    this.create(spreadsheet, name);
  }
  create(spreadsheet, name) {
    this.spreadsheet = spreadsheet;
    this.sheets = spreadsheet.getSheetsByName(name);
    if (this.sheets.length < this.numSheets) {
      this.sheet = spreadsheet.insertSheet(name + new Date().getMilliseconds(), { hidden: true });
      CacheService.getScriptCache().remove('cached' + spreadsheet.id);
    } else {
      this.sheet = this.sheets[Math.floor(Math.random() * this.numSheets)];
    }
    return this;
  }
  runFormula(formula) {
    this.sheet.getRange('A1').setFormula('=' + formula);

    return this.sheet.getRange('A1').getValue();
  }
  runQuery(formula, numRows) {
    this.sheet.getRange('A1').setFormula('=' + formula);
    return this.sheet.getRange(2, 1, Math.max(1, numRows || (this.sheet.getLastRow() - 1)), this.sheet.getLastColumn()).getValues();
  }
}

export function createHiddenSheet(spreadsheet, name) {
  let hsheet = new HiddenSheets(spreadsheet, name);
  return hsheet;
}

export default HiddenSheets;
