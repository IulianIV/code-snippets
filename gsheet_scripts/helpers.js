/**
 * Deprecated Functionalities
 * --> Convert to BM, BMM;
 * --> Remove non-KW modifier from BMM;
 * --> Sheets to JSON;
 * --> Generate Manufacturer Center Data from Sheets;
 * --> Conversion to Phrase Match and Broad Match;
 * --> Keyword Insertions.
 * 
 */

/**
 * Add permission to given email address across all protected ranges.
 *
 * @param {"email@gmail.com"} email_address Email address of user to give permissions to.
 * @return Returns a Helper Menu
 * @customfunction
 */

function SetPermission(email_address) {

  // Add user to all protected ranges
  var ss = SpreadsheetApp.getActive();
  var protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  for (var i = 0; i < protections.length; i++) {
    var protection = protections[i];
    if (protection.canEdit()) {
      protection.addEditor(email_address);
    }
  }
}

/**
 * function that generated the Help menu associated with this add-on.
 *
 * @return Returns a Helper Menu
 * @customfunction
 */

function IAmSheetTools() {

  var html = HtmlService.createHtmlOutputFromFile('help_me')
    .setWidth(800)
    .setHeight(800);
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showModalDialog(html, 'About section');

}


/**
 * Returns HTTP Response of URL
 *
 * @param {"https://www.website.com"} uri REQUIRED URL to get HTTP response from
 * @return Returns the HTTP response of given URI
 * @customfunction
 */
function HTTPResponse(uri) {
  var response_code;
  try {
    response_code = UrlFetchApp.fetch(uri).getResponseCode().toString();
  }
  catch (error) {
    response_code = error.toString().match(/ returned code (\d\d\d)\./)[1];
  }
  finally {
    return response_code;
  }
}


/**
* Returns URLs in sitemap.xml file
*
* @param {"https://www.google.com/gmail/sitemap.xml"} sitemapUrl REQUIRED The url of the sitemap
* @param {"http://www.sitemaps.org/schemas/sitemap/0.9"} namespace REQUIRED Look at the source of the xml sitemap, look for the xmlns value 
* @return Returns urls <loc> from an xml sitemap
* @customfunction
*/

function ExtractSitemapURL2(sitemapUrl, namespace) {

  try {
    var xml = UrlFetchApp.fetch(sitemapUrl).getContentText();
    var document = XmlService.parse(xml);
    var root = document.getRootElement()
    var sitemapNameSpace = XmlService.getNamespace(namespace);

    var urls = root.getChildren('url', sitemapNameSpace)
    var locs = []

    for (var i = 0; i < urls.length; i++) {
      locs.push(urls[i].getChild('loc', sitemapNameSpace).getText())
    }

    return locs
  } catch (e) {
    return e
  }
}


/**
 * Grabs URL from provided sitemap
 *
 * @param {"https://www.google.com/gmail/sitemap.xml"} url REQUIRED the url of the sitemap
 * @return Returns the URLs from the sitemap.
 * @customfunction
 */

function ExtractSitemapURL(url) {
  var results = [];
  if (!url) return;
  var sitemap = UrlFetchApp.fetch(url, { muteHttpExceptions: true, method: "GET", followRedirects: true });
  var document = sitemap.getContentText().split("<url>");
  var docHead = document.splice(0, 1);

  for (var i = 0; i < document.length; i++) results.push(document[i].split("</loc>")[0].split("<loc>")[1].replace(/&amp;/g, "&"));

  return results;

}

/**
 * Returns a list of the current SpreadSheet Sheet names
 * 
 * @return Returns sheet names from current Spreadsheet.
 * @customfunction
 */

function sheetNames() {
  var out = new Array()
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();

  for (var i = 0; i < sheets.length; i++) out.push([sheets[i].getName()])
  return out
}

/**
 * Creates Named ranges from a given Maps of key, value pairs.
 *
 * @return Returns named ranges within the spreadsheet
 * @customfunction
 */

function createNamedRangeFromMap() {

  ss = SpreadsheetApp.getActiveSpreadsheet();

  for (var z = 0; z < namedRangeMap.length; z++) {

    var range = ss.getRange(namedRangeMap[z].rangeValue);
    ss.setNamedRange(namedRangeMap[z].rangename, range);
  }

}


/**
 * WARNING - running this will delete all current named ranges.
 *
 * @return Returns removes all named ranges
 * @customfunction
 */

function removeAllNamedRanges() {

  ss = SpreadsheetApp.getActiveSpreadsheet();
  namedRanges = ss.getNamedRanges();

  for (var i = 0; i < namedRanges.length; i++) {

    ss.removeNamedRange(namedRanges[i].getName());

  }

}


/**
 * Adds ValueInRange validation to current cell by grabbing the value of adjacent cell and if it is found as a named range.
 *
 * @return Returns custom Data Validation
 * @customfunction
 */

function addAttributeValidation() {

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var current_cell = ss.getCurrentCell();

  var cell_to_validate = ss.getActiveSheet().getSelection();
  console.log(cell_to_validate);
  var range = ss.getActiveSheet().getRange(cell_to_validate.getCurrentCell().getRow(), cell_to_validate.getCurrentCell().getColumn()+1).getA1Notation() ;
  console.log(range);
  var range_name = ss.getActiveSheet().getRange(range).getValue();
  console.log(range_name);

  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(ss.getRange(ss.getRangeByName(range_name).getA1Notation()))
    .build();
  current_cell.setDataValidation(rule);

}

/**
 * Creates a new sheet in the active spreadsheet with the given name and sets it as the active sheet.
 *
 * @param {"NewSheet1"} new_sheet_name Name of the new sheet to generate
 * @param {"OtherSheet2"} active_other Name of the other sheet to activate
 * @return Returns new sheet.
 * @customfunction
 */

function createSheet(new_sheet_name) {
  // add "active_other" as argument to function and uncomment last statement to activate automatic sheet activation
  var current_ss = SpreadsheetApp.getActiveSpreadsheet();

  var new_sheet = current_ss.getSheetByName(new_sheet_name);

  if (new_sheet != null) {
      current_ss.deleteSheet(new_sheet);
  }

  new_sheet = current_ss.insertSheet();
  new_sheet.setName(new_sheet_name);

  var new_sheet = current_ss.getSheetByName(new_sheet_name);

  return new_sheet

  // current_ss.setActiveSheet(current_ss.getSheetByName(active_other))
}

/**
 * Return the header from a original sheet in a usable list.
 *
 * @param {"Sheet1"} sheet_name Sheet object to grab headers from.
 * @return Returns copied headers to given [secondary_sheet].
 * @customfunction
 */

function getHeaders(sheet_name) {

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName(sheet_name)

  var original_headers = s.getRange("A1:1").getValues();

  var header = [];

  for (let i=0; i < original_headers[0].length; i++) {
    if (original_headers[0][i] != '') {
      header.push(original_headers[0][i]);
    }
  }

  return header;

}

/**
 * Appends the values found in the given column to a list.
 *
 * @param {"Sheet1"} sheet_name Sheet object to grab headers from.
 * @param {"attribute_set_id"} column_name Sheet object to grab headers from.

 * @return Returns list of values found in the given column.
 * @customfunction
 */

function getColumnValues(sheet_name, column_name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = ss.getSheetByName(sheet_name).getDataRange().getValues();
  var col = data[0].indexOf(column_name);

  var col_values = [];

  for (let i=1; i < data.length; i++) {

      if (col != -1) {
        col_values.push(data[i][col]);
    }
  }

  let unique_col_values = [...new Set(col_values)];

  return unique_col_values;

}



/**
 * Copies the header from a original sheet to the second given sheet name.
 *
 * @param {"OriginalSheet"} original_sheet Sheet object to copy headers from.
 * @param {"SecondarySheet"} secondary_sheet Sheet object to copy headers to.
 * @return Returns copied headers to given [secondary_sheet].
 * @customfunction
 */

function copyHeaders(original_sheet, secondary_sheet) {

  var original_headers = original_sheet.getRange("A1:1").getValues();

  var header = [];

  for (let i=0; i < original_headers[0].length; i++) {
    if (original_headers[0][i] != '') {
      header.push(original_headers[0][i]);
    }
  }

  secondary_sheet.getRange(1, 1, 1, header.length).setValues([header])

}

/**
 * Converts a given colum number to letter format.
 *
 * @param {5} column Number of the column to convert
 * @return Returns A1 notation column name
 * @customfunction
 */

function columnToLetter(column) {
  var temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

/**
 * Converts a given colum letter to number format.
 *
 * @param {A} letter Letter of the column to convert
 * @return Returns C1 notation column name
 * @customfunction
 */

function letterToColumn(letter) {
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

/**
 * Grabs the last column that contains data from a given sheet name
 *
 * @param {"Sheet1"} sheet The sheet to run function on
 * @return Returns the number of the last column to contain data
 * @customfunction
 */

function getLastDataColumn(sheet) {
  var lastCol = sheet.getLastColumn();
  var range = sheet.getRange(columnToLetter(lastCol) + 1);
  if (range.getValue() !== "") {
    return lastCol;
  } else {
    return range.getNextDataCell(SpreadsheetApp.Direction.PREVIOUS).getColumn();
  }              
}

/**
 * Grabs the last row that contains data from a given sheet name
 *
 * @param {"Sheet1"} sheet The sheet to run function on
 * @return Returns the number of the last row to contain data
 * @customfunction
 */

function getLastDataRow(sheet) {
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange("A" + lastRow);
  if (range.getValue() !== "") {
    return lastRow;
  } else {
    return range.getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
  }              
}
