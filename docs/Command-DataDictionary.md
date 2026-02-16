# Command: DataDictionary

Generate LaTeX data dictionary documentation.

**Source:** `Stricture-Generate-LaTeX.js`

## Usage

```bash
node Stricture.js -i MeadowModel-Extended.json -c DataDictionary -f ./output/ -o MySchema
```

## Input

A JSON model file (basic or extended). The model index is used to resolve
foreign key join references.

## Output

Two LaTeX files:

### 1. `{OutputFileName}-Tables.tex` -- Table Definitions

Contains a `\part{Table Definitions}` with a `\section` for each table.
Each section includes:

- The table description (if present in the model)
- A `tabularx` table with columns: Column Name, Size, Data Type, Notes

The Notes column contains:

- Foreign key join references (e.g., "Joined to User.IDUser")
- Table-level join references (e.g., "Joins to OtherTable")
- Column descriptions from the MicroDDL

### 2. `{OutputFileName}-ChangeTracking.tex` -- Audit Column Matrix

Contains a `\part{Implicit Table Change Tracking}` with a tabular listing
every table and marking which audit columns are present (CreateDate,
UpdateDate, Deleted).

## Example Output

```latex
%% Data Model -- Generated 2024-01-15T10:30:00.000Z
\part{Table Definitions}

\section{User}
The primary user table for authentication.
\vspace{4mm}

\noindent
\begin{small}
\begin{tabularx}{\textwidth}{ l l l X }
\textbf{Column Name} & \textbf{Size} & \textbf{Data Type} & \textbf{Notes} \\ \hline
IDUser &  & ID &  \\
UserName & 64 & String &  \\
IDCustomer &  & ForeignKey & Joined to Customer.IDCustomer \\
\end{tabularx}
\end{small}
```

## Notes

- These files are intended to be included in a larger LaTeX document.
  They do not contain `\documentclass` or `\begin{document}` preamble.
- Table and column descriptions from the MicroDDL are passed through
  directly, so LaTeX special characters in descriptions may need escaping.
