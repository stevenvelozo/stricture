# Command: RelationshipsFull

Generate a Graphviz DOT relationship diagram of the data model, including
all joins (including audit user references).

**Source:** `Stricture-Generate-ModelGraph.js`

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c RelationshipsFull -f ./output/ -o MyDiagram -g
```

## Input

A JSON model file (basic or extended).

## Output

- `{OutputFileName}.dot` -- Graphviz DOT source file
- `{OutputFileName}.png` -- PNG image (only when `-g` is specified)

## Difference from Relationships

This command is identical to `Relationships` except it sets `GraphFullJoins`
to `true`, which includes edges for:

- `CreatingIDUser`
- `UpdatingIDUser`
- `DeletingIDUser`

In models where many tables have audit columns, this produces a denser
diagram with many edges pointing to the User table. The `Relationships`
command filters these out for clarity.

## Notes

- See [Command-Relationships.md](Command-Relationships.md) for full details
  on DOT generation, graphviz prerequisites and output format.
- The `Full` command generates both `Relationships` and `RelationshipsFull`
  diagrams side by side in the `doc/diagrams/` directory.
