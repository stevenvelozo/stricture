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

This is a Users table, Contact table and Address table.

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

Which translates to the following json by running the `MicroDDL-To-JSON.sh` command:


Which translates to the following SQL:


And generates the following diagrams:

