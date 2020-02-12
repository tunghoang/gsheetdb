function myClass(v) {
  this.value = v;
}

function myFunction() {
  Logger.log('Hello');
  //Logger.log(AppLib.SpreadSheetDB);
  //var db = new myClass(6)
  var db = new AppLib.SpreadSheetDB({
    source_url: "sheet_url",
    sheetSpecs: {}
  });
  //var table = db.from('author');
  //Logger.log(table);
  //var results = db.from('author').query.where("idAuthor", 1).getResultsJson();
  //Logger.log(JSON.stringify(results));
  var results = db.join("author", "book", "idBook").sWhere("idAuthor", 1).getResultsJson();
  Logger.log(JSON.stringify(results));
}
