# Command: Authorization

Generate a CSV authorization/permission matrix.

**Source:** `Stricture-Generate-Authorization-Chart.js`

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c Authorization -f ./output/ -o MySchema
```

## Input

An extended JSON model file (must contain the `Authorization` section).

## Output

A single file: `{OutputFileName}-Authorizors.csv`

## CSV Format

The output is a matrix-style CSV with:

1. **Header row:** Title line ("Authorization for {OutputFileName}")
2. **Role row:** Role names as column headers
3. **Permission row:** Permission names under each role
4. **Data rows:** One row per table, with authorizer values at each
   role/permission intersection

### Example

```csv
Authorization for MeadowModel
,Unauthenticated,,,,,,,,,,,,,Readonly,...,Administrator
,Create,Read,Reads,ReadsBy,ReadMax,ReadSelectList,Update,Delete,Count,CountBy,Schema,Validate,New,...
User,"Deny","Deny","Deny","Deny","Deny","Deny","Deny","Deny","Deny","Deny","Deny","Deny","Deny",...
Contact,"Deny","Deny",...
```

## Roles

The default roles (from `Meadow-Endpoints-Security-Defaults.js`):

| Role             | Description                    |
|------------------|--------------------------------|
| Unauthenticated  | No authentication              |
| Readonly         | Read access only               |
| User             | Standard authenticated user    |
| Manager          | Management-level access        |
| Director         | Director-level access          |
| Executive        | Executive-level access         |
| Administrator    | Full access                    |

## Permissions

The default permissions for each role:

| Permission     | Description                           |
|----------------|---------------------------------------|
| Create         | Create new records                    |
| Read           | Read a single record by ID            |
| Reads          | Read multiple records (list)          |
| ReadsBy        | Read records filtered by column       |
| ReadMax        | Read the maximum value of a column    |
| ReadSelectList | Read a select/dropdown list           |
| Update         | Update an existing record             |
| Delete         | Delete a record                       |
| Count          | Count records                         |
| CountBy        | Count records filtered by column      |
| Schema         | Access the schema definition          |
| Validate       | Validate a record against the schema  |
| New            | Get a new default record object       |

## Authorizer Values

| Authorizer   | Behavior                                |
|--------------|-----------------------------------------|
| `Allow`      | Unrestricted access                     |
| `Deny`       | No access                               |
| `Mine`       | Only records owned by the current user  |
| `MyCustomer` | Only records belonging to user's tenant |

Custom authorizers can be defined in MicroDDL authorization stanzas.

## Notes

- This command requires the extended model (with Authorization data).
  Running it against a basic model will produce an empty or incomplete chart.
- The CSV format is designed for import into spreadsheets for review with
  stakeholders.
