# Command: DictionaryCSV

Generate a CSV data dictionary of all tables and columns.

**Source:** `Stricture-Generate-DictionaryCSV.js`

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c DictionaryCSV -f ./output/ -o MySchema
```

## Input

A JSON model file (basic or extended). The model index is used to resolve
foreign key join references.

## Output

A single file: `{OutputFileName}-DataDictionary.csv`

## CSV Format

The file has a header row followed by one row per column across all tables:

```csv
Table,Column Name,Size,Data Type,Join
"User","IDUser","","ID",""
"User","UserName","64","String",""
"User","IDCustomer","","ForeignKey","Customer.IDCustomer"
"Contact","IDContact","","ID",""
"Contact","IDUser","","ForeignKey","User.IDUser"
```

### Columns

| CSV Column  | Description                                       |
|-------------|---------------------------------------------------|
| Table       | The table this column belongs to                  |
| Column Name | The column name                                   |
| Size        | Column size (blank for types without explicit size)|
| Data Type   | MicroDDL data type (ID, String, ForeignKey, etc.) |
| Join        | Resolved join reference as `TableName.ColumnName`  |

## Notes

- All values are double-quoted in the output.
- This format is useful for importing into spreadsheets for review or
  documentation purposes.
