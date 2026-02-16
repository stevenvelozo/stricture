# Command: Documentation

Generate Markdown data dictionary files.

**Source:** `Stricture-Generate-Markdown.js`

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c Documentation -f ./output/ -o Documentation
```

## Input

A JSON model file (basic or extended). The model index (primary key to
table name lookup) is used to resolve foreign key join references.

## Output

Three types of Markdown files:

### 1. `Dictionary.md` -- Table of Contents

A summary page listing every table and its column count in a Markdown table.
Each table name links to its individual model page using OratOR wiki-style
link syntax (`{path|label}`).

### 2. `Model-{TableName}.md` -- Per-Table Detail

One file per table containing:

- Breadcrumb navigation
- Table name heading
- Column listing in a Markdown table with: Column Name, Size, Data Type, Join

Joins are resolved to `TableName.PrimaryKey` format using the model index.

### 3. `ModelChangeTracking.md` -- Audit Column Matrix

A matrix showing which tables have implicit create, update and delete
change tracking columns:

```
Table   | Create | Update | Delete
------- | :----: | :----: | :----:
User    |   X    |   X    |   X
Session |   X    |        |
```

Tracking is detected by the presence of `CreateDate`, `UpdateDate` and
`Deleted` columns.

## Link Format

The generated Markdown uses OratOR wiki-style links:

```
{Model/Dictionary/Model-User|User}
```

This renders as a link labeled "User" pointing to
`Model/Dictionary/Model-User` in an OratOR wiki environment.

## Notes

- Each file includes a generation timestamp at the bottom.
- The breadcrumb navigation links back to the documentation index and data
  dictionary root.
