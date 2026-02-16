# Command: Meadow

Generate per-table Meadow schema JSON files.

**Source:** `Stricture-Generate-Meadow.js`

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c Meadow -f ./output/ -o MeadowSchema
```

## Input

A JSON model file (basic or extended). When the extended model is used,
authorization rules are included in the output.

## Output

One JSON file per table: `{OutputFileName}{TableName}.json`

## Schema Structure

Each generated file contains:

```json
{
    "Scope": "User",
    "DefaultIdentifier": "IDUser",
    "Domain": "Default",
    "Schema": [
        { "Column": "IDUser", "Type": "AutoIdentity", "Size": "Default" },
        { "Column": "UserName", "Type": "String", "Size": "64" },
        { "Column": "CreateDate", "Type": "CreateDate", "Size": "Default" }
    ],
    "DefaultObject": {
        "IDUser": 0,
        "UserName": "",
        "CreateDate": null
    },
    "JsonSchema": {
        "title": "User",
        "type": "object",
        "properties": { ... },
        "required": ["IDUser"],
        "MeadowSchema": { ... }
    },
    "Authorization": { ... }
}
```

## Meadow Type Mappings

| MicroDDL Type | Meadow Schema Type | Default Value |
|---------------|--------------------|---------------|
| ID            | AutoIdentity       | `0`           |
| GUID          | AutoGUID           | `"0x0000000000000000"` |
| ForeignKey    | Integer            | `0`           |
| Numeric       | Integer            | `0`           |
| Decimal       | Decimal            | `0.0`         |
| String        | String             | `""`          |
| Text          | String             | `""`          |
| DateTime      | DateTime           | `null`        |
| Boolean       | Boolean            | `false`       |

## Magic Column Overrides

Column names are checked after the data type mapping. Magic column names
override the schema type regardless of the declared data type:

| Column Name      | Overridden Type |
|------------------|-----------------|
| `CreateDate`     | `CreateDate`    |
| `CreatingIDUser` | `CreateIDUser`  |
| `UpdateDate`     | `UpdateDate`    |
| `UpdatingIDUser` | `UpdateIDUser`  |
| `DeleteDate`     | `DeleteDate`    |
| `DeletingIDUser` | `DeleteIDUser`  |
| `Deleted`        | `Deleted`       |

## JSON Schema

Each file includes a JSON Schema (Draft 4 style) with:

- `properties` for each column with `type` and `size`
- `required` array containing ID and ForeignKey columns
- A nested `MeadowSchema` property containing a copy of the full Meadow
  schema (minus the JsonSchema itself, to avoid circular nesting)

## Authorization

When the input is an extended model file, the Authorization section for
each table is copied into the output schema, providing the full role/permission
matrix for Meadow's authorization layer.
