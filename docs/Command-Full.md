# Command: Full

Run the complete Stricture pipeline: compile MicroDDL and generate all
primary output artifacts in a single pass.

**Source:** `Stricture-Run-ExecuteCommand.js` (waterfall orchestration)

## Usage

```bash
node Stricture.js -i Model.mddl -c Full -f ./model/ -o MeadowModel
```

This is the default command when `-c` is not specified.

## Input

A MicroDDL (`.mddl` or `.ddl`) text file.

## Pipeline Stages

The `Full` command executes these stages in sequence:

1. **Compile** -- Parse MicroDDL into JSON model files
2. **MySQL** -- Generate `CREATE TABLE` statements in `mysql_create/`
3. **Meadow** -- Generate per-table Meadow schema files in `meadow/`
4. **Documentation** -- Generate Markdown data dictionary in `doc/`
5. **Relationships** -- Generate filtered relationship diagram in `doc/diagrams/`
6. **RelationshipsFull** -- Generate full relationship diagram in `doc/diagrams/`

## Output Directory Structure

```
{OutputLocation}/
  MeadowModel.json
  MeadowModel-Extended.json
  MeadowModel-PICT.json
  mysql_create/
    MeadowModel-CreateMySQLDatabase.mysql.sql
  meadow/
    MeadowSchema{TableName}.json   (one per table)
  doc/
    Documentation-Dictionary.md
    Documentation-Model-{TableName}.md   (one per table)
    Documentation-ModelChangeTracking.md
    diagrams/
      Relationships.dot
      Relationships.png
      RelationshipsFull.dot
      RelationshipsFull.png
```

## Notes

- The `-g` flag is automatically enabled for diagram generation during the
  `Full` pipeline, so `.png` files are produced if `graphviz` is installed.
- The `Full` command does not run every available generator. Commands like
  `DataDictionary` (LaTeX), `DictionaryCSV`, `Authorization`,
  `TestObjectContainers`, `Pict` and `MySQL-Migrate` must be run separately.
- After the Compile step, the pipeline switches its input to the Extended
  model JSON for the remaining generator stages.
