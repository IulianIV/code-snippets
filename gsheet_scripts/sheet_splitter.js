/**
 *  The variables decalred below should have been used as folder paths in Drive but for unkown reasons (even with Cloud Enabled Projects) it gives permission errors
 * at the second usage.
 */

// var ROOT_FOLDER = DriveApp.getFolderById("1b6gA8NiVDuBU6LPsziAviR_dBGJz-NMl");
// var VALUE_EXTRACTION_FOLDER = DriveApp.getFolderById("1L0RtqcGzjbXZasmNv7j6cpILYQjJEVNZ");
// var COLUMN_SPLIT_FOLDER = DriveApp.getFolderById("1Jg7HzbXJKwF6vP-4C_n5A1Duy3THUgpk");
// var VALUE_EXTRACTION_SPLIT_FOLDER = DriveApp.getFolderById('1hctmRHjzW2Tkk4LQfX6FLf1T15164zX-');
// var MISC_SPLIT_FOLDER = DriveApp.getFolderById('1LM4Dl7QuTFFBpSPxFeKLP-S51LpHsVM6');


/**
 * Opens a sidebar in the document containing the UI for the Sheet Splitter functionality
 */
function ShowSplitSheetSidebar() {
  SpreadsheetApp.getUi()
    .showSidebar(HtmlService.createTemplateFromFile('sheet_splitter_menu')
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Sheet Splitter Settings'));
}

/** 
 * Saves a sheet from a given spreadsheet to a given folder in drive.
 * 
 * @param {spreadsheet object} current_spreadsheet Spreadsheet object - has to be object, not name.
 * @param {sheet object} sheet_to_save Sheet object - has to be object, not name.
 * @param {drive folder object} drive_folder Drive App instantiation  - has to be object, not name.
 * @return Returns several saved in Drive CSV files
 * @customfunction
 */

function SplitSheetSaveAsCSV(current_spreadsheet, sheet_to_save, drive_folder) {
  var ss = current_spreadsheet;
  var sheet = sheet_to_save;
  // create a folder from the name of the spreadsheet
  var folder = drive_folder;
  // append ".csv" extension to the sheet name
  file_name = sheet.getName() + ".csv";
  // convert all available sheet data to csv format
  var csv_file = ConvertRangeToCsvFile_(file_name, sheet);
  // create a file in the Docs List with the given name and the csv data
  var file = folder.createFile(file_name, csv_file);

}

/** 
 * Function used in the Sheet Splitter functionality. Handles the filtering of arrays needed in column filtering selection
 * 
 * @param {Array} range two-dimensional array to apply filter on. Has to be first indexed by row then by columns to work as expcted.
 * @return Returns array containing only values filtered by the selected options.
 * @customfunction
 */

function SplitterFilter(array, filter_config) {

  var filtered = [];

  for (let i = 1; i < array.length; i++) {

    if (array[i][filter_config[0]] == filter_config[1]) {
      filtered.push(array[i]);
      continue
    }

  }

  return filtered;

}

/** 
 * Sheet splitter. Splits a sheet by a given number of rows, keeping the headers of the original sheet. The results are saved as CSV files in Drive.
 * 
 * @param {"Sheet1"} sheet_name Name of the origin sheet
 * @param {3} split_by The number of rows to split the sheet by
 * @param {true [default]} delete_sheets Delete or not the generated sheets used for CSV export.
 * @return Returns a number of files coresponding to the division of given input by number of sheet rows.
 * @customfunction
 */

function SplitSheet(sheet_name, split_by, delete_sheets) {

  var current_ss = SpreadsheetApp.getActiveSpreadsheet();
  current_s = current_ss.setActiveSheet(current_ss.getSheetByName(sheet_name));

  var split_by = parseInt(split_by, 10);

  var delete_sheets = delete_sheets;

  var drive_folder = DriveApp.createFolder(current_ss.getName().toLowerCase().replace(/ /g, '_') + '_update_attributes_csv_' + new Date().getDay());

  var lastDataColumn = getLastDataColumn(current_s);
  var lastDataRow = getLastDataRow(current_s) - 1;

  var reference_column = 1;
  var next_row = 2;
  var sample_size = 0;
  const base_name = "update_attribute_";

  if (lastDataRow % split_by <= 5) {

    sample_size = Math.floor(lastDataRow / split_by);

  } else sample_size = Math.ceil(lastDataRow / split_by);

  for (let i = 1; i <= sample_size; i++) {

    var copy_from_rows = current_s.getRange(next_row, reference_column, split_by, lastDataColumn);
    // copy_from_rows este o lista de tipul [[coloana 1, coloana 2], [coloana 1, coloana2]] fiecare lista din lista reprezentand un rand.

    var new_sheet = createSheet(base_name + i);

    copyHeaders(current_s, new_sheet);

    copy_from_rows.copyTo(new_sheet.getRange("A2"), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);

    SplitSheetSaveAsCSV(current_ss, new_sheet, drive_folder);

    if (delete_sheets) {
      current_ss.deleteSheet(current_ss.getSheetByName(base_name + i));
    }

    next_row += split_by;

  }

  // SpreadsheetApp.getUi().alert(drive_folder.getUrl());

}

/** 
 * Sheet splitter with extraction. Extracts values from a sheet by certain, given values, grabs range of data containing those values, extracts those values then exports them to CSV files in Drive
 * 
 * @param {"Sheet1"} sheet_name Name of the origin sheet
 * @param {true [default]} delete_sheets Delete or not the generated sheets used for CSV export.
 * @param {"attribute_set_id"} filter_by_column The column header whose selected value to filter by. 
 * @param {5} filter_by_value The values to filter the range by.
 * @return Returns a file containing only filtered data.
 * @customfunction
 */

function ExtractFromSheet(sheet_name, delete_sheets, filter_by_column, filter_by_value) {

  var current_ss = SpreadsheetApp.getActiveSpreadsheet();
  current_s = current_ss.setActiveSheet(current_ss.getSheetByName(sheet_name));

  var data_range = current_s.getDataRange().getValues();

  var split_by = parseInt(split_by, 10);

  var delete_sheets = delete_sheets;

  var lastDataColumn = getLastDataColumn(current_s);

  var column_number = data_range[0].indexOf(filter_by_column);
  var column_value = filter_by_value;
  var column_name = data_range[0][column_number]

  var new_name = 'extracted_' + column_name + '_by_' + column_value;

  var drive_folder = DriveApp.createFolder(current_ss.getName().toLowerCase().replace(/ /g, '_') + '_' + new_name);

  var filter_config = [column_number, column_value];
  var filtered_data = SplitterFilter(data_range, filter_config);

  var range_to_copy = filtered_data;

  var new_sheet = createSheet(new_name);

  copyHeaders(current_s, new_sheet);
  new_sheet.getRange(2, 1, range_to_copy.length, lastDataColumn).setValues(range_to_copy);

  SplitSheetSaveAsCSV(current_ss, new_sheet, drive_folder);

  if (delete_sheets) {
    current_ss.deleteSheet(current_ss.getSheetByName(new_name));
  }

  // drive_folder.moveTo("1L0RtqcGzjbXZasmNv7j6cpILYQjJEVNZ");

}

/** 
 * Sheet splitter with extraction and splitting. Extracts values from a sheet by certain, given values, grabs range of data containing those values, extracts those values then exports them to CSV files in Drive
 * 
 * @param {"Sheet1"} sheet_name Name of the origin sheet
 * @param {3} split_by The number of rows to split the sheet by
 * @param {true [default]} delete_sheets Delete or not the generated sheets used for CSV export.
 * @param {"attribute_set_id"} filter_by_column The column header whose selected value to filter by. 
 * @param {5} filter_by_value The values to filter the range by.
 * @return Returns a file containing only filtered data.
 * @customfunction
 */

function SplitExtractFromSheet(sheet_name, split_by, delete_sheets, filter_by_column, filter_by_value) {

  var current_ss = SpreadsheetApp.getActiveSpreadsheet();
  current_s = current_ss.setActiveSheet(current_ss.getSheetByName(sheet_name));

  var data_range = current_s.getDataRange().getValues();

  var split_by = parseInt(split_by, 10);
  var sample_size = 0;
  var end_value = split_by;
  var start_value = 0;

  var delete_sheets = delete_sheets;

  var lastDataColumn = getLastDataColumn(current_s);

  var column_number = data_range[0].indexOf(filter_by_column);
  var column_value = filter_by_value;
  var column_name = data_range[0][column_number]

  var new_name = 'extracted_' + column_name + '_by_' + column_value;

  var drive_folder = DriveApp.createFolder(current_ss.getName().toLowerCase().replace(/ /g, '_') + '_' + new_name);

  var filter_config = [column_number, column_value];
  var filtered_data = SplitterFilter(data_range, filter_config);

  var data_length = filtered_data.length;

  sample_size = Math.ceil(data_length / split_by)

  for (let i = 0; i < sample_size; i++) {

    var data_to_copy = filtered_data.slice(start_value, end_value);

    start_value = end_value;

    end_value = end_value + split_by

    new_sheet = createSheet(new_name + '_' + i);

    copyHeaders(current_s, new_sheet);
    new_sheet.getRange(2, 1, data_to_copy.length, lastDataColumn).setValues(data_to_copy);

    SplitSheetSaveAsCSV(current_ss, new_sheet, drive_folder);

    if (delete_sheets) {
      current_ss.deleteSheet(current_ss.getSheetByName(new_name + '_' + i));
    }

  }

  // drive_folder.moveTo('1hctmRHjzW2Tkk4LQfX6FLf1T15164zX-');

}

/** 
 * Extracts the data found in a given Sheet by a certain selected column
 * 
 * @param {"Sheet1"} sheet_name Name of the origin sheet
 * @param {true [default]} delete_sheets Delete or not the generated sheets used for CSV export.
 * @param {"attribute_set_id"} filter_by_column The column header whose selected value to filter by. 
 * @return Returns a file containing only extracted data.
 * @customfunction
 */

function ExtractByColumn(sheet_name, delete_sheets, extract_by_column) {
  var current_ss = SpreadsheetApp.getActiveSpreadsheet();
  current_s = current_ss.setActiveSheet(current_ss.getSheetByName(sheet_name));

  var data_range = current_s.getDataRange().getValues();

  var split_by = parseInt(split_by, 10);

  var delete_sheets = delete_sheets;

  var lastDataColumn = getLastDataColumn(current_s);

  var column_number = data_range[0].indexOf(extract_by_column);
  var column_name = data_range[0][column_number]

  var new_name = 'column_extraction_' + column_name + '_by_';

  var drive_folder = DriveApp.createFolder(current_ss.getName().toLowerCase().replace(/ /g, '_') + '_' + new_name);

  var column_values = getColumnValues(sheet_name, extract_by_column);

  for (let i=0; i<column_values.length; i++) {

    var filter_config = [column_number, column_values[i]];
    var filtered_data = SplitterFilter(data_range, filter_config);

    var new_sheet = createSheet(new_name + column_values[i]);
    copyHeaders(current_s, new_sheet);
    new_sheet.getRange(2, 1, filtered_data.length, lastDataColumn).setValues(filtered_data);

    SplitSheetSaveAsCSV(current_ss, new_sheet, drive_folder);

    if (delete_sheets) {
      current_ss.deleteSheet(current_ss.getSheetByName(new_name + column_values[i]));
    }

  }

  // drive_folder.moveTo("1L0RtqcGzjbXZasmNv7j6cpILYQjJEVNZ");
}