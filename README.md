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

You can generate diagrams from this model.  Stricture uses the [graphviz tool chain](http://www.graphviz.org/) to generate graphs.  You must have graphviz installed and in your path to generate diagram images.

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

Which creates:

![Simple Table Entity Connections](https://github.com/stevenvelozo/stricture/raw/master/Examples/SimpleAddress.png)


More Complex Examples
---------------------

The infamous Northwind database has been converted to MicroDDL as an example.  It isn't 100% generating the Northwind SQL because the DDL spec doesn't cover all features used yet.

You can find it in `Examples/Northwind.mddl` ... the graph for this model is:

![Complex Table Entity Connections](https://github.com/stevenvelozo/stricture/raw/master/Examples/Northwind.png)


### MySQL

Generating MySQL Create statements is easy peasy, just run this:

    steven at Stevens-MacBook-Air in /OSS/stricture on master
    $ node Stricture.js -i ./Examples/Northwind.mddl.json -c MySQL
    Stricture JSON DDL Processing Utility
    Contact: Steven Velozo <steven@velozo.com>

    ---

    --> Loading ./Examples/Northwind.mddl.json
      > file loaded successfully.
    --> ... creating contextual Index ==> Table lookups ...
      > Adding the table Categories to the lookup cache with the key CategoryID
      > Adding the table CustomerDemographics to the lookup cache with the key CustomerTypeID
      > Adding the table Customers to the lookup cache with the key CustomerID
      > Adding the table Employees to the lookup cache with the key EmployeeID
      > Adding the table Orders to the lookup cache with the key OrderID
      > Adding the table Products to the lookup cache with the key ProductID
      > Adding the table Region to the lookup cache with the key RegionID
      > Adding the table Shippers to the lookup cache with the key ShipperID
      > Adding the table Suppliers to the lookup cache with the key SupplierID
      > Adding the table Territories to the lookup cache with the key TerritoryID

    --> Running Command: MySQL
    --> Building the table create file...
      > Categories
      > CustomerCustomerDemo
      > CustomerDemographics
      > Customers
      > Employees
      > EmployeeTerritories
      > OrderDetails
      > Orders
      > Products
      > Region
      > Shippers
      > Suppliers
      > Territories

Which generates some MySQL create statements in the file 'build/Stricture_Output.mysql.sql' that look like the following:

    --   [ Categories ]
    CREATE TABLE IF NOT EXISTS
        Categories
        (
            CategoryID INT UNSIGNED NOT NULL AUTO_INCREMENT,
            CategoryName CHAR(15) NOT NULL DEFAULT '',
            Description TEXT,

            PRIMARY KEY (CategoryID)
        );



    --   [ CustomerCustomerDemo ]
    CREATE TABLE IF NOT EXISTS
        CustomerCustomerDemo
        (
            CustomerID INT NOT NULL DEFAULT '0',
            CustomerTypeID INT NOT NULL DEFAULT '0'
        );

### Meadow Schema Files

    You can also generate meadow schema files!  Just run stricture with the 'Meadow' command. 
