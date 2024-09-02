/**
 * Opens a sidebar in the document containing the UI and the Attribute Values user interface.
 */
function ValuesAggregatorSidebar() {
  SpreadsheetApp.getUi()
    .showSidebar(HtmlService.createTemplateFromFile('values_aggregator_menu')
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Values Menu'));
}

/**
 * Gets all the values found in the cells of a given range.
 */
function GetOptions(range, container) {
  return [SpreadsheetApp.getActive()
    .getSheetByName(validation.sheet)
    .getRange(range)
    .getValues()
    .filter(String)
    .reduce(function (a, b) {
      return a.concat(b)
    }), container]
}
/**
 * Joins the selected values by the given parameter
 * 
 * @param {Array} arr The given array to join by the given parameter
 * @return Returns a string that contains comma joined values.
 * @customfunction
 */
function process(arr) {
  arr.length > 0 ? SpreadsheetApp.getActiveRange()
    .clearContent()
    .setValue(arr.join(",")) :                /////the arr '' part is on the process part of the SIDEBAR and you may need to add another function here and another process there.
    SpreadsheetApp.getUi()
      .alert('No options selected')
}
