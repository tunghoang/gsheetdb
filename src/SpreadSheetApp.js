

let apiService;
export default class SpreadSheetApp {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }
  openById(id, ignoreCache) {
    apiService = new ApiService(this.accessToken, 'https://sheets.googleapis.com/v4/spreadsheets/' + id);
    let metadata;
    if (typeof ignoreCache !== 'boolean' || ignoreCache === false) {
      const scriptCache = CacheService.getScriptCache();
      const cached = JSON.parse(scriptCache.get('cached' + id));
      if (cached) {
        return new SpreadSheet(cached);
      }
    }
    metadata = apiService.get('');
    const scriptCache = CacheService.getScriptCache();
    scriptCache.put('cached' + id, JSON.stringify({ ...metadata, properties: {} }), 21600);
    return new SpreadSheet(metadata);
  }
}

class SpreadSheet {
  constructor(data) {
    // ({
    //   spreadsheetId: '',
    //   properties: {},
    //   sheets: [
    //     {
    //       properties: {}
    //     }
    //   ],
    //   spreadsheetUrl: ''
    // })
    this.data = data;
    this.id = data.spreadsheetId;
  }
  batchUpdate(requests) {
    if (!Array.isArray(requests)) requests = [requests];
    const res = apiService.post(':batchUpdate', { requests });
    return res.replies;
  }
  getSheetByName(sheetName) {
    const sheetData = this.data.sheets.find(s => s.properties.title === sheetName);
    if (!sheetData) return null;
    return new Sheet(sheetData, this);
  }
  getSheets() {
    return this.data.sheets.map(s => new Sheet(s));
  }
  insertSheet(title) {
    const res = this.batchUpdate({ addSheet: { properties: { title } } });
    return new Sheet(res.addSheet, this);
  }
}

class Sheet {
  constructor({ properties }, SpreadSheet) {
    // ({
    //   "properties": {
    //     "sheetId": 1407480363,
    //     "title": "sheetName",
    //     "index": 1,
    //     "sheetType": "GRID",
    //     "gridProperties": {
    //       "rowCount": 999,
    //       "columnCount": 26
    //     },
    //     hidden: false,
    //   }
    // })
    this.properties = properties;
    this.id = properties.sheetId;
    this.SpreadSheet = SpreadSheet;
  }
  updateProperties(updateObj) {
    this.SpreadSheet.batchUpdate({ updateSheetProperties: { fields: '*', properties: { ...this.properties, ...updateObj } } });
  }
  getLastColumn() {
    return this.properties.gridProperties.columnCount;
  }
  getLastRow() {
    return this.properties.gridProperties.rowCount;
  }
  hideSheet() {
    if (this.properties.hidden) return;
    this.updateProperties({ hidden: true });
  }
  getName() {
    return this.properties.title;
  }
  getRange(rowOrA1Notation, col, numRows, numCols) {
    let a1Notation;
    if (!isFinite(+rowOrA1Notation)) {
      a1Notation = rowOrA1Notation;
    } else {
      const row = rowOrA1Notation;
      a1Notation = `${colNumberToLabel(col)}${row}:${colNumberToLabel(numCols ? col + numCols - 1 : this.getLastColumn())}${row + numRows - 1}`;
    }
    return new Range(a1Notation, this);
  }
  getDataRange() {
    return this.getRange(`A1:${colNumberToLabel(this.getLastColumn())}`);
  }
  appendRow(row) {
    apiService.post(`/values/${this.properties.title}:append?valueInputOption=USER_ENTERED`, { values: [row] });
  }
  deleteRow(row) {
    this.SpreadSheet.batchUpdate({
      deleteDimension: {
        range: {
          dimension: "ROWS",
          sheetId: this.id,
          startIndex: row - 1,
          endIndex: row,
        }
      }
    })
  }
}
class Range {
  constructor(a1Notation, Sheet) {
    this.a1Notation = a1Notation;
    this.Sheet = Sheet;
  }
  getValues() {
    const res = apiService.get(`/values/${this.Sheet.properties.title}!${this.a1Notation}?valueRenderOption=UNFORMATTED_VALUE`)
    return res.values || [];
  }
  getValue() {
    return this.getValues()[0][0];
  }
  setValue(value) {
    this.setValues([[value]]);
  }
  setValues(values) {
    apiService.put(`/values/${this.Sheet.properties.title}!${this.a1Notation}?valueInputOption=USER_ENTERED`, { values });
  }
  setFormula(formula) {
    this.setValue(formula);
  }
}

class ApiService {
  constructor(accessToken, baseUrl) {
    this.token = accessToken;
    this.baseUrl = baseUrl || '';
  }
  get(url, options) {
    const res = UrlFetchApp.fetch(this.baseUrl + url, {
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
      ...options,
    });
    const json = JSON.parse(res.getContentText());
    if (json.error) throw json.error;
    return json;
  }
  post(url, payload, options) {
    const res = UrlFetchApp.fetch(this.baseUrl + url, {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
      payload: JSON.stringify(payload || {}),
      contentType: 'application/json',
      ...options,
    });
    const json = JSON.parse(res.getContentText());
    if (json.error) throw json.error;
    return json;
  }
  put(url, payload, options) {
    return this.post(url, payload, { method: 'put', ...options });
  }
}

function colNumberToLabel(num) {
  var str = '';
  //num--; //0 is not A; 1 is A
  while (num > 0) {
    let rem = (num - 1) % 26;
    num = Math.floor((num - 1) / 26);
    str = String.fromCharCode(65 + rem) + str;
  }
  return str;
}
