
function myFunction() {
  var db = new gsheetdb.SpreadSheetDB({
    source_url: "",
    sheetSpecs: {
      author: ['idAuthor', 'name'],
      book: ['idBook', 'name', 'idAuthor']
    }
  });
  var table = db.from('author');
  Logger.log(table.query.toJSON());
  // var results = db.from('author').query.where("idAuthor", 1).toJSON();
  //Logger.log(JSON.stringify(results));
  // var results = db.join("book", "author", "idAuthor").dWhere("idAuthor", 1).toJSON();
  // Logger.log(JSON.stringify(results));
}
