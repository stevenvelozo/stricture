# Command: Pict

Generate a RequireJS/AMD module containing PICT UI view definitions.

**Source:** `Stricture-Generate-Pict.js`

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c Pict -f ./output/ -o MySchema
```

## Input

An extended JSON model file (must contain the `Pict` section populated
by PICT stanzas in the MicroDDL).

## Output

A single file: `{OutputFileName}-Stricture-PICT-Model.js`

## Output Format

The generated file is a RequireJS/AMD module that exports the PICT
configuration object:

```javascript
/* AUTO GENERATED STRICTURE PICT MODEL */
if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(
  function()
  {
    var tmpStricturePictModel = (
{
    "User": {
        "Create": {
            "Enabled": true,
            "Columns": [...],
            "Title": "Create a New User"
        },
        "List": { ... },
        "Record": { ... },
        "Update": { ... },
        "Delete": { ... }
    }
}
    );
    return tmpStricturePictModel;
  }
);
```

## PICT View Types

Each table can have five view configurations:

| View     | Default Title Template          | Description              |
|----------|---------------------------------|--------------------------|
| Create   | `Create a <%= EntityName %>`    | Record creation form     |
| List     | `<%= EntityName %>s`            | Record listing/grid      |
| Record   | `Read a <%= EntityName %>`      | Read-only record view    |
| Update   | `Update a <%= EntityName %>`    | Record editing form      |
| Delete   | `Delete a <%= EntityName %>`    | Delete confirmation view |

## PICT Stanza Syntax

See [MicroDDL-Syntax.md](MicroDDL-Syntax.md) for full details on PICT
stanzas. Key features:

- **Title templates** use underscore template syntax: `(<%= EntityName %>)`
- **Properties** are set with `:PropertyName = value`
- **Section headings** start with `#`
- **Column entries** are column names with optional key:value properties

## Notes

- The `amdefine` shim allows the module to work in both browser (RequireJS)
  and Node.js (CommonJS) environments.
- Tables without PICT stanzas in the MicroDDL will not appear in the output.
- This is a legacy output format. Newer Pict applications may use the
  PICT JSON file from the Compile command directly.
