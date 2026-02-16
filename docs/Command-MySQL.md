# Command: MySQL

Generate MySQL `CREATE TABLE` statements from a JSON model.

**Source:** `Stricture-Generate-MySQL.js`

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c MySQL -f ./output/ -o MySchema
```

## Input

A JSON model file (the output of a prior `Compile`). Either the basic or
extended model works.

## Output

A single file: `{OutputFileName}.mysql.sql`

## Generated SQL

The output starts with a comment header listing all tables and their column
counts, followed by a `CREATE TABLE IF NOT EXISTS` statement for each table.

### Type Mappings

| MicroDDL Type | MySQL Column Definition                         |
|---------------|--------------------------------------------------|
| ID            | `INT UNSIGNED NOT NULL AUTO_INCREMENT`            |
| GUID          | `CHAR(n) NOT NULL DEFAULT '0xDe'`                |
| ForeignKey    | `INT UNSIGNED NOT NULL DEFAULT '0'`              |
| Numeric       | `INT NOT NULL DEFAULT '0'`                       |
| Decimal       | `DECIMAL(p,s)`                                   |
| String        | `CHAR(n) NOT NULL DEFAULT ''`                    |
| Text          | `TEXT`                                            |
| DateTime      | `DATETIME`                                        |
| Boolean       | `TINYINT NOT NULL DEFAULT '0'`                   |

### Character Set

All tables use `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`.

### Primary Key

The last `ID` or `ForeignKey` column encountered becomes the `PRIMARY KEY`.
Typically this is the first column (the auto-identity).

## Example Output

```sql
-- Data Model -- Generated 2024-01-15T10:30:00.000Z

--   User                                                6
--   Contact                                             4

CREATE TABLE IF NOT EXISTS
    User
    (
        IDUser INT UNSIGNED NOT NULL AUTO_INCREMENT,
        GUIDUser CHAR(36) NOT NULL DEFAULT '0xDe',
        UserName CHAR(64) NOT NULL DEFAULT '',
        Email CHAR(256) NOT NULL DEFAULT '',
        CreateDate DATETIME,
        CreatingIDUser INT UNSIGNED NOT NULL DEFAULT '0',

        PRIMARY KEY (IDUser)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
