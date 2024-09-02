/**
 * Opens a sidebar in the document containing the UI and the Attribute Values user interface.
 */
function ShowDiffFinderSidebar() {

  SpreadsheetApp.getUi()
    .showSidebar(HtmlService.createTemplateFromFile('diff_finder_menu')
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Diff Finder'));
}

/**
 * Checks if the current sheet is the one used for Difference Finder.
 * 
 * @return Returns True if the current sheet is the right sheet, otherwise False.
 * @customfunction
 */

function checkRightSheet() {

  let alert_ui = SpreadsheetApp.getUi();
  let current_ss = SpreadsheetApp.getActiveSpreadsheet();

  if (current_ss.getSheetByName("differences")){
    exists = true;
  } else {
    alert_ui.alert('Sheet-ul "differences" nu exista. Se genereaza acum.');
    let new_sheet = current_ss.insertSheet();
    new_sheet.setName("differences");
    exists = true;
  }
  
}

/**
 * Given a specific string that contains error statements, extrats the objects for which there are reported errors
 * 
  *@param {"String with errors"} error_input The Error string.
 * @return Returns a list that contains the items for which errors have been reported.
 * @customfunction
 */
function parseErrorObject(error_input) {

  let regexp = /sku\: ([a-zA-z0-9\.\_\-]+) mesaj/gm;
  let error_list = [];

  let error_iterator = error_input.matchAll(regexp);

  for (const error of error_iterator) {
    error_list.push(error[1]);
  }
  console.log(error_list);

  return error_list;
  
}

/**
 * Grabs data starting at a cell 1 up to where the table ends.
 * 
 * @return Returns a two-dimensional array that contains range data.
 * @customfunction
 */

function getDiffTable() {


  let current_ss = SpreadsheetApp.getActiveSpreadsheet();
  let current_s = current_ss.getSheetByName("differences");

  let last_column = getLastDataColumn(current_s);
  let last_row = getLastDataRow(current_s);
  Logger.log(`Last column: ${last_column}\nLast Row: ${last_row}`)

  let data_range = current_s.getRange(1, 1, last_row, last_column);

}

function generateDiffTable(range, error_sku_list) {

  const sku_location = 1;
  let error_items = [];

  let data_range = range.getValues();

}



// function diffCheckerHelp() {

//   var helper_html = HtmlService.createHtmlOutputFromFile('diff_finder_help').setWidth(650).setHeight(650);

//   SpreadsheetApp.getUi().showModalDialog(helper_html, 'Cum functioneaza');

// }
