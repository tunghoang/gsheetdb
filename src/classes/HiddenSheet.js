
class HiddenSheet {
  constructor(spreadsheet, name) {
    this.create(spreadsheet, name);
  }
  create(spreadsheet, name) {
    this.sheet = spreadsheet.getSheetByName(name);
    if (!this.sheet) {
      this.sheet = spreadsheet.insertSheet();
      this.sheet.setName(name);
      this.sheet.hideSheet();
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
  let hsheet = new HiddenSheet(spreadsheet, name);
  return hsheet;
}

export default HiddenSheet;
