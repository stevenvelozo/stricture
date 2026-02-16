# Command: MySQL-Migrate

Generate MySQL `INSERT INTO ... SELECT` migration stub scripts.

**Source:** `Stricture-Generate-MySQL-Migrate.js`

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c MySQL-Migrate -f ./output/ -o MySchema
```

## Input

A JSON model file (the output of a prior `Compile`).

## Output

A single file: `{OutputFileName}-Migration.mysql.sql`

## Purpose

This command generates boilerplate for data migration between databases.
Each table produces an `INSERT INTO ... SELECT` template with placeholder
database and table names that require manual editing before use.

## Generated SQL

For each table, the generator produces:

1. A comment header with table name and column count
2. An `INSERT INTO DB_TO.{TableName}` block listing all columns with type
   comments
3. A `SELECT TABLE_FROM.{ColumnName}` block mirroring each column
4. A `FROM DB_FROM.TABLE_FROM` clause

## Example Output

```sql
--   [ User ]
INSERT INTO
  DB_TO.User
    (
        -- INT UNSIGNED NOT NULL AUTO_INCREMENT
        IDUser,
        -- CHAR(64) NOT NULL DEFAULT ''
        UserName,
        -- DATETIME
        CreateDate
    )
SELECT
        -- {IDUser} INT UNSIGNED NOT NULL AUTO_INCREMENT
        TABLE_FROM.IDUser,
        -- {UserName} CHAR(64) NOT NULL DEFAULT ''
        TABLE_FROM.UserName,
        -- {CreateDate} DATETIME
        TABLE_FROM.CreateDate
FROM
    DB_FROM.TABLE_FROM;
```

## Notes

- Replace `DB_TO` with the target database name.
- Replace `DB_FROM` and `TABLE_FROM` with the source database and table names.
- The column comments include the original column name in braces and the
  MySQL type, making it easy to map columns when source and target schemas
  differ.
- This generator produces scaffolding only. Manual tuning is expected for
  column mapping, type conversion and data transformation.
