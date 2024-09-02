# code-snippets
Code snippets showcase used on several occasions

## Circles reader

Small script that uses the OpenCV library to read tabular data from product pictures.

## GTM Booknetic Trick Script

A Javascript snippet that when used with Google Tag Manager and the Booknetic WP plug-in can record the data selected by an user.

## WP Reader

Python script that uses OpenCV and tesseract to read whatsapp screenshots to extract relevant data.



# Sheet Tools

Several AppsScript Tools I created to reduce necessary time to fulfill certain tasks.

Along full functionalities, the scripts also contain helper functions and general functions.

Functionality can be exemplified here [Examples Spreadsheet](https://docs.google.com/spreadsheets/d/1AhkYjUfFs0sKpST8k_E9-_FYdU0AqIcDwF7Iv0T7U_8/edit#gid=190411378)


## Main functionalities

#### 1. Values Menu

Given several ranges of header, column values - as exemplified in the __values__ sheet in the above spreadsheet -
a sidemenu will be generated that has containers with all the values from given ranges.
A container is named after the column header and it contains a list of all the values of said column.
Clicking on the container opens a multiselection of values.
After a button press all values are added in the active cell, joined by a "," or "|". The join
operator can be changed in the script.

All values can be regenerated if new ones are added.

#### 2. Sheet Splitter

Given a sheet with multiple rows of items with attributes and values, spread across columns it can split the sheet 
based on several given conditions.

It generates a sidemenu. Given options (just some examples):
    1. Split the sheet by a fixed number of lines;
    2. Filter the sheet based of a value from a column;
    3. Split option 2 on a fixed number of rows.

#### 3. General functions

* Generate a product URL from multiple given attribute values;
* String case conversion;
* Get column number/letter from given range;
* Automatically create NamedRanges from given range;
* Parse a sitemap;
* Return HTTP Status of requested URL;
* Remove all Named Ranges;
* Give user permissions across all sheets;
* Replace all diacritis of a string with normalized characters;
* Replace a string with a given mapping of other characters.


