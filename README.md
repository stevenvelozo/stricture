Stricture
===

A basic data description language, inspired by Markdown.  Database engine, programming language and philosophically agnostic.

Why, you ask?  Because it felt wrong allowing some application framework to define the database structure for data models.  This simple spec can quickly spool up a data store in multiple engines, documentation and starting source code for your framework du jour.

MicroDDL Key
---

The Stricture MicroDDL is a simple line-based database description language.  The parser (well, not really a parser, but..) will generate the model .json file that the node.js transformation and translation scripts use to generate code and documentation.

### Symbols

    !TABLE
    @Primary Numeric Identity
    %GUID
    #Number
    .Decimal
    $String [SIZE]
    *Text
    &Date
    ^Boolean

### Example:

This is a Users table, Contact table and Address table.  This file is located in the repository at "Examples/SimpleAddress.mddl"

    !User
    @IDUser
    $UserName
    $PasswordHash 42
    $FirstName 38
    $LastName 38
    $Email 60

    !Contact
    @IDContact
    #CreatingIDUser -> IDUser
    $Name 90
    $Email 60

    !Address
    @IDAddress
    #CreatingIDUser -> IDUser
    #IDContact -> IDContact
    $Address 130
    $City 48
    $State 24
    $Zip 10
    $Phone 12


### Conversion to JSON

You can translate the MicroDDL to json by running the `MicroDDL-To-JSON.sh` command:

    $ ./MicroDDL-To-JSON.sh "Examples/SimpleAddress.mddl"
    MicroDDL to JSON Conversion

    License: MIT
    Contact: Steven Velozo <steven@velozo.com>

    ---

    Usage: ./MicroDDL-To-JSON.sh [MicroDDLFile.mddl]

    --> Removing vestiges of last run...
    --> Creating json data description...
    --> Fixing up json...
    --> Cleaning up...
    --> Generation complete!  Examples/SimpleAddress.mddl.json is ready to work with.

The generated JSON in `Examples/SimpleAddress.mddl.json` looks like:

    {
      "Tables":
      [
      {
        "TableName": "User",
        "Columns":
          [
              { "Column": "IDUser", "DataType": "ID" },
              { "Column": "UserName", "Size": "64", "DataType": "String" },
              { "Column": "PasswordHash", "Size": "42", "DataType": "String" },
              { "Column": "FirstName", "Size": "38", "DataType": "String" },
              { "Column": "LastName", "Size": "38", "DataType": "String" },
              { "Column": "Email", "Size": "60", "DataType": "String" }
          ]
      },
      {
        "TableName": "Contact",
        "Columns":
          [
              { "Column": "IDContact", "DataType": "ID" },
              { "Column": "CreatingIDUser", "DataType": "Numeric", "Join": "IDUser"},
              { "Column": "Name", "Size": "90", "DataType": "String" },
              { "Column": "Email", "Size": "60", "DataType": "String" }
          ]
      },
      {
        "TableName": "Address",
        "Columns":
          [
              { "Column": "IDAddress", "DataType": "ID" },
              { "Column": "CreatingIDUser", "DataType": "Numeric", "Join": "IDUser"},
              { "Column": "IDContact", "DataType": "Numeric", "Join": "IDContact"},
              { "Column": "Address", "Size": "130", "DataType": "String" },
              { "Column": "City", "Size": "48", "DataType": "String" },
              { "Column": "State", "Size": "24", "DataType": "String" },
              { "Column": "Zip", "Size": "10", "DataType": "String" },
              { "Column": "Phone", "Size": "12", "DataType": "String" }
      ]
    }

### Diagrams

You can generate diagrams from this model:

    $ node Stricture -i "./Examples/SimpleAddress.mddl.json" -c RelationshipsFull -g -l
    Stricture JSON DDL Processing Utility
    Contact: Steven Velozo <steven@velozo.com>

    ---

    --> ./Examples/SimpleAddress.mddl.json loaded successfully.
    --> Building the Relationships graph...
    --> ... creating contextual Index ==> Table lookups ...
      > Adding the table User to the lookup cache with the key IDUser
      > Adding the table Contact to the lookup cache with the key IDContact
      > Adding the table Address to the lookup cache with the key IDAddress
    --> ... building the connected graph DOT file ...
      > Header
      > Table Nodes
      > Connections
      > Closing
    --> DOT generation complete!
    --> Beginning image generation to ModelGraph-RelationshipsFull.png...
    dot -Tpng ModelGraph-RelationshipsFull.dot > ModelGraph-RelationshipsFull.png
      > Image generation complete
    --> Loading image ModelGraph-RelationshipsFull.png in your OS.  Hopefully.
    steven at MathBookPro in /Mutination/stricture on master*

Which creates:

![Simple Table Entity Connections](https://github.com/stevenvelozo/stricture/raw/master/Examples/SimpleAddress.png)


More Complex Examples
---------------------

The infamous Northwind database has been converted to MicroDDL as an example.  It isn't 100% generating the Northwind SQL because the DDL spec doesn't cover all features used yet.

You can find it in `Examples/Northwind.mddl` ... the graph for this model is:

![Complex Table Entity Connections](https://github.com/stevenvelozo/stricture/raw/master/Examples/Northwind.png)
