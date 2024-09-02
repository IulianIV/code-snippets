// @name         PCE Sheet Tools
// @version      5.0b
// @description  Several functionalities used in Catalog Administration
// @author       Iulian Ichim

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 *
 * Menu customized to accomodate new tools
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 * @return Returns menu for personalized functions
 */

function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('PCE - Sheet Tools')
    .addItem('Values Menu', 'ValuesAggregatorSidebar')
    .addItem('Sheet Splitter', 'ShowSplitSheetSidebar')
    .addSeparator()
    .addSubMenu(ui.createMenu('String Tools')
      .addItem('Remove Diacritics', 'RemoveDiacritics')
      .addItem('Remove String Duplicates', 'RemoveInStringDupplicates')
      .addItem('Catalog URL Converter', 'ConvertURL')
      .addSubMenu(ui.createMenu('Change Case')
        .addItem('Title Case', 'ToTitleCase')
        .addItem('lower case', 'ToLowerCase')
        .addItem('UPPER CASE', 'ToUpperCase')
        .addItem('Sentence case', 'ToSentenceCase')
        .addItem('CamelCase', 'ToCamelCase')
        .addItem('tOOGLE cASE', 'ToToggleCase')))
    .addSeparator()
    .addSubMenu(ui.createMenu('Export')
      .addItem('Export All Sheets to CSV', 'SaveAsCSV'))
    .addSubMenu(ui.createMenu('Other Utilities')
      .addItem('Testing diff finder', 'ShowDiffFinderSidebar')
      .addItem('Get sheet names [formula]', 'SheetNames')
      .addItem('Extract Sitemap URLs [formula]', 'ExtractSitemapURL')
      .addItem('Extract Sitemap URLs v2 [formula]', 'ExtractSitemapURL2')
      .addItem('Get URL HTTP Response [formula]', 'HTTPResponse')
      .addItem('Generate Named Ranges from Map', 'createNamedRangeFromMap')
      .addItem('Remove All Named Ranges', 'removeAllNamedRanges')
      .addItem('Adds Range Validation Based on Adjacent Cells` Value Named Range', 'addAttributeValidation'))
    .addSeparator()
    .addItem('About me', 'IAmPCETools')
    .addToUi();
}


/**
 * CSV saving function to work with convertRangeToCsvFile_()
 *
 * @return Returns folder in Drive containing CSV files of all Sheets within the Spreadsheet.
 * @customfunction
 * 
 */

function SaveAsCSV() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();

  // create a folder from the name of the spreadsheet
  var folder = DriveApp.createFolder(ss.getName().toLowerCase().replace(/ /g, '_') + '_csv_' + today);

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];

    // append ".csv" extension to the sheet name
    fileName = sheet.getName() + ".csv";

    // convert all available sheet data to csv format
    var csvFile = ConvertRangeToCsvFile_(fileName, sheet);

    // create a file in the Docs List with the given name and the csv data
    folder.createFile(fileName, csvFile);
  }
  Browser.msgBox('Files were exported to a drive folder named: ' + folder.getName());
}


/**
 * Converts a sheet to CSV
 *
 * @param {"name_of_csv"} csvFileName REQUIRED name for the CSV
 * @param {"Sheet1"} sheet REQUIRED name for the sheet to export
 * @return Returns CSV file containing selected data
 * @customfunction
 */

function ConvertRangeToCsvFile_(csvFileName, sheet) {

  // get available data range in the spreadsheet
  var activeRange = sheet.getDataRange();

  try {
    var data = activeRange.getValues();
    var csvFile = undefined;

    // loop through the data in the range and build a string with the csv data
    if (data.length > 1) {

      var csv = "";
      for (var row = 0; row < data.length; row++) {
        for (var col = 0; col < data[row].length; col++) {
          if (data[row][col].toString().indexOf(",") != -1) {
            data[row][col] = "\"" + data[row][col] + "\"";
          }
        }

        // join each row's columns
        // add a carriage return to end of each row, except for the last one
        if (row < data.length - 1) {
          csv += data[row].join(",") ; // + "\r\n"
        }
        else {
          csv += data[row];
        }
      }
      csvFile = csv;
    }
    return csvFile;
  }
  catch (err) {
    Logger.log(err);
    Browser.msgBox(err);
  }
}


/**
 * WARNING - using this in large ranges severly slows down proccessing. Returns normalized string from a string that contains diacritics - should be used as function from PCETools.
 * It splits letters by their graphenes then it replaces graphenes with '', leaving only the letter behind. Does not replace non-diacritics.
 *
 * @param {"string with diacritics"} currentValue REQUIRED Must be a string located in a cell/cell range
 * @return Returns normalized string.
 * @customfunction
 */

function RemoveDiacritics(currentValue) {

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log('Current Active Sheet: ' + activeSheet);

  var selection = activeSheet.getActiveRange();
  Logger.log('Current active range: ' + selection);

  var numRows = selection.getNumRows();
  Logger.log('Number of rows: ' + numRows)

  var numCols = selection.getNumColumns();
  Logger.log('Number of columns: ' + numCols);

  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {

      var currentValue = selection.getCell(i, j).getValue();
      Logger.log('Current cell value: ' + currentValue)

      normalizedValue = currentValue.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

      var replacedValue = selection.getCell(i, j).setValue(normalizedValue)
      Logger.log('Normalized Value: ' + replacedValue.getValue());

    }
  }
}


/**
 * WARNING - using this in large ranges severly slows down proccessing. Replaces every mapped character from a cell value with a normalized letter.
 * Basically it can be used to replace any kind of character
 *
 * @param {string} currentValue REQUIRED Must be a string located in a cell/cell range
 * @return Returns replaced string.
 * @customfunction
 */

function RemoveMappedChars(currentValue) {

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log('Current Active Sheet: ' + activeSheet);

  var selection = activeSheet.getActiveRange();
  Logger.log('Current active range: ' + selection);

  var numRows = selection.getNumRows();
  Logger.log('Number of rows: ' + numRows)

  var numCols = selection.getNumColumns();
  Logger.log('Number of columns: ' + numCols);

  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {

      var currentValue = selection.getCell(i, j).getValue();
      Logger.log('Current cell value: ' + currentValue)

      for (var z = 0; z < defaultDiacriticsRemovalMap.length; z++) {
        currentValue = currentValue.replace(defaultDiacriticsRemovalMap[z].letters, defaultDiacriticsRemovalMap[z].base);
      }

      var replacedValue = selection.getCell(i, j).setValue(currentValue)
      Logger.log('Normalized Value: ' + replacedValue.getValue());

    }
  }
}


/**
 * Replaces unicode characters defined in a charMap with their latin equivalent. Useful for replacing diacritics and cyrilic alphabet.
 * Used strictly as a formula. Using cell ranges greatly increases the time of execution.
 *
 * @param {"https://www.pce.ro"} word REQUIRED String to be replaced
 * @return Returns replaced string.
 * @customfunction
 */

function ConvertURL(url_string) {

  new_url = url_string

  for (var z = 0; z < defaultReplaceMap.length; z++) {
    new_url = new_url.replace(defaultReplaceMap[z].letters, defaultReplaceMap[z].base);
  }


  Logger.log('Normalized Value: ' + new_url);

  return new_url;

}


/**
 * WARNING - using this in large ranges severly slows down proccessing. Converts string to Title Case
 *
 * @param {cell range} insert the cell/cell range to replace
 * @return Returns Title Case string.
 * @customfunction
 */

function ToTitleCase() {

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log('Current Active Sheet: ' + activeSheet);

  var selection = activeSheet.getActiveRange();
  Logger.log('Current active range: ' + selection);

  var numRows = selection.getNumRows();
  Logger.log('Number of rows: ' + numRows)

  var numCols = selection.getNumColumns();
  Logger.log('Number of columns: ' + numCols);

  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {

      var currentValue = selection.getCell(i, j).getValue();
      Logger.log('Current cell value: ' + currentValue)

      var titleCase = currentValue.toLowerCase().replace(/\b[a-z]/ig, function (match) { return match.toUpperCase() });

      var replacedValue = selection.getCell(i, j).setValue(titleCase)
      Logger.log('Normalized Value: ' + titleCase);

    }
  }
}


/**
 * WARNING - using this in large ranges severly slows down proccessing. Converts string to lower case
 *
 * @param {cell range} insert the string to replace
 * @return Returns lower case string.
 * @customfunction
 */

function ToLowerCase() {

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log('Current Active Sheet: ' + activeSheet);

  var selection = activeSheet.getActiveRange();
  Logger.log('Current active range: ' + selection);

  var numRows = selection.getNumRows();
  Logger.log('Number of rows: ' + numRows)

  var numCols = selection.getNumColumns();
  Logger.log('Number of columns: ' + numCols);

  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {

      var currentValue = selection.getCell(i, j).getValue();
      Logger.log('Current cell value: ' + currentValue)

      var lowerCase = currentValue.toLowerCase();

      var replacedValue = selection.getCell(i, j).setValue(lowerCase)
      Logger.log('Normalized Value: ' + lowerCase);

    }
  }
}


/**
 * WARNING - using this in large ranges severly slows down proccessing. Converts string to UPPEER CASE
 *
 * @param {cell range} insert the cell/cell range to replace
 * @return Returns UPPER CASE string.
 * @customfunction
 */

function ToUpperCase() {

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log('Current Active Sheet: ' + activeSheet);

  var selection = activeSheet.getActiveRange();
  Logger.log('Current active range: ' + selection);

  var numRows = selection.getNumRows();
  Logger.log('Number of rows: ' + numRows)

  var numCols = selection.getNumColumns();
  Logger.log('Number of columns: ' + numCols);

  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {

      var currentValue = selection.getCell(i, j).getValue();
      Logger.log('Current cell value: ' + currentValue)

      var upperCase = currentValue.toUpperCase();

      var replacedValue = selection.getCell(i, j).setValue(upperCase)
      Logger.log('Normalized Value: ' + upperCase);

    }
  }
}


/**
 * WARNING - using this in large ranges severly slows down proccessing. Converts string to Sentence case
 *
 * @param {cell range} insert the cell/cell range to replace
 * @return Returns Sentence case string.
 * @customfunction
 */

function ToSentenceCase() {

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log('Current Active Sheet: ' + activeSheet);

  var selection = activeSheet.getActiveRange();
  Logger.log('Current active range: ' + selection);

  var numRows = selection.getNumRows();
  Logger.log('Number of rows: ' + numRows)

  var numCols = selection.getNumColumns();
  Logger.log('Number of columns: ' + numCols);

  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {

      var currentValue = selection.getCell(i, j).getValue();
      Logger.log('Current cell value: ' + currentValue)

      var sentenceCase = currentValue.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, function (c) { return c.toUpperCase() });

      var replacedValue = selection.getCell(i, j).setValue(sentenceCase)
      Logger.log('Normalized Value: ' + sentenceCase);

    }
  }
}

/**
 * WARNING - using this in large ranges severly slows down proccessing. Converts string to tOOGLE cASE
 *
 * @param {cell range} insert the cell/cell range to replace
 * @return Returns tOOGLE cASE string.
 * @customfunction
 */

function ToToggleCase() {

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log('Current Active Sheet: ' + activeSheet);

  var selection = activeSheet.getActiveRange();
  Logger.log('Current active range: ' + selection);

  var numRows = selection.getNumRows();
  Logger.log('Number of rows: ' + numRows)

  var numCols = selection.getNumColumns();
  Logger.log('Number of columns: ' + numCols);

  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {

      var currentValue = selection.getCell(i, j).getValue();
      Logger.log('Current cell value: ' + currentValue)

      var toggleCase = currentValue.toUpperCase().split(' ').map(function (word) {
        return (word.charAt(0).toLowerCase() + word.slice(1));
      }).join(' ');

      var replacedValue = selection.getCell(i, j).setValue(toggleCase)
      Logger.log('Normalized Value: ' + toggleCase);

    }
  }
}


/**
 * WARNING - using this in large ranges severly slows down proccessing. removes in string duplicates "string-with-with-duplicates" would be modified into "string-with-duplicates"
 *
 * @param {cell range} insert the cell/cell range to normalize
 * @return Returns non-duped string
 * @customfunction
 */

function RemoveInStringDupplicates() {

  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log('Current Active Sheet: ' + activeSheet);

  var selection = activeSheet.getActiveRange();
  Logger.log('Current active range: ' + selection);

  var numRows = selection.getNumRows();
  Logger.log('Number of rows: ' + numRows)

  var numCols = selection.getNumColumns();
  Logger.log('Number of columns: ' + numCols);

  for (var i = 1; i <= numRows; i++) {
    for (var j = 1; j <= numCols; j++) {

      var currentValue = selection.getCell(i, j).getValue().toLowerCase().split(/\-/);
      Logger.log('Current cell value: ' + currentValue)

      var s = new Set(currentValue);
      var removeDupes = [...s].join('-');

      var replacedValue = selection.getCell(i, j).setValue(removeDupes)
      Logger.log('Normalized Value: ' + removeDupes);

    }
  }
}


/**
 * Create a schema.org VideoObject object used in Video SEO SERP Enchancements.
 *
 * @param {'XXXXXX'} video_id The ID of the Video. Needed in 'thumbnails' and 'embedUrl' generation. If skipped, manual insertion of 'thumbnails' and 'embedUrl' is assumed.
 * @param {'Product Name, 22 g'} name Name of product or video.
 * @param {'Best Product Ever'} description Description of video or product.
 * @param {'2022-06-25'} upload_date Upload date of the video. Must be in 'YYYY-MM-DD' format or ISO 8601.
 * @return Returns JSON Object that can be added at product level to complete de VideoObejct schema.org SEO Object.
 * @customfunction
 */

function CreateYoutubeJSON(video_id, name, description, upload_date) {

  thumbnails = [
    `https://i.ytimg.com/vi/${video_id}/default.jpg`,
    `https://i.ytimg.com/vi/${video_id}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${video_id}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${video_id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${video_id}/maxresdefault.jpg`
    ]

  embed_url = `https://www.youtube.com/embed/${video_id}`

  upload_date = Utilities.formatDate(upload_date, "GMT+3", "yyyy-MM-dd")
  
  video_object = 
  `[\n\
    {\n\
      "@type": "VideoObject",\n\
      "name": "${name}",\n\
      "description": "${description}",\n\
      "thumbnailUrl": [\n\
        "https://i.ytimg.com/vi/${video_id}/default.jpg",
        "https://i.ytimg.com/vi/${video_id}/mqdefault.jpg",
        "https://i.ytimg.com/vi/${video_id}/hqdefault.jpg",
        "https://i.ytimg.com/vi/${video_id}/sddefault.jpg",
        "https://i.ytimg.com/vi/${video_id}/maxresdefault.jpg"
      ],\n\
      "uploadDate": "${upload_date}",\n\
      "embedUrl": "${embed_url}"\n\
    }\n\
  ]`

  return video_object


}


