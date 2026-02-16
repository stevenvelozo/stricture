# Command: Info

List all tables in the model. This is the default fallback command.

**Source:** `Stricture-Run-ExecuteCommand.js` (inline, no separate generator)

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c Info
```

Or with any unrecognized command name (falls through to default):

```bash
node Stricture.js -i MeadowModel-Extended.json -c SomeUnknownCommand
```

## Input

A JSON model file (basic or extended).

## Output

Console output only. No files are generated.

Prints the total number of tables and lists each table name:

```
--> There are 5 tables in the DDL (listed below).
    User
    Contact
    UserSession
    Customer
    AuditLog
```

## Notes

- If an unrecognized command name is provided, Stricture prints a warning
  and falls through to the Info behavior.
- This command is useful for verifying that a model file loaded correctly
  before running generators.
