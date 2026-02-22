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
            "Columns": [],
            "Title": "Create a <%= EntityName %>"
        },
        "Record": {
            "Enabled": true,
            "Columns": [],
            "Title": "Read a <%= EntityName %>"
        },
        "Update": {
            "Enabled": true,
            "Columns": [],
            "Title": "Update a <%= EntityName %>"
        },
        "List": {
            "Enabled": true,
            "RowMenu": true,
            "AddButton": true,
            "Columns": [
                {
                    "Column": "UserName"
                },
                {
                    "Column": "Email"
                }
            ],
            "Title": "List of Users"
        },
        "Delete": {
            "Enabled": true,
            "Validation": true,
            "DisplayRecord": true,
            "Columns": [],
            "ConfirmationMessage": "Are you sure you want to delete this record with ID XXXXX?",
            "Title": "Delete a <%= EntityName %>"
        }
    },
    "Address": {
        "Create": {
            "Enabled": true,
            "Columns": [],
            "Title": "Create a <%= EntityName %>"
        },
        "Record": {
            "Enabled": true,
            "Columns": [],
            "Title": "Read a <%= EntityName %>"
        },
        "Update": {
            "Enabled": true,
            "Columns": [],
            "Title": "Update a <%= EntityName %>"
        },
        "List": {
            "Enabled": false,
            "RowMenu": true,
            "AddButton": true,
            "Columns": [
                {
                    "Column": "Name"
                },
                {
                    "Column": "Email"
                },
                {
                    "Column": "Address",
                    "HideAt": "md"
                },
                {
                    "Column": "City",
                    "HideAt": "sm"
                },
                {
                    "Column": "State",
                    "HideAt": "xs"
                },
                {
                    "Column": "CreatingIDUser",
                    "Type": "LinkedRecord",
                    "Record": "User",
                    "Field": "FirstName",
                    "FieldExtra": "LastName"
                },
                {
                    "Column": "Created",
                    "Type": "RelativeDateTime"
                }
            ],
            "Title": "<%= EntityName %>s"
        },
        "Delete": {
            "Enabled": true,
            "Validation": true,
            "DisplayRecord": true,
            "Columns": [],
            "ConfirmationMessage": "This is a stress test of <%= Record.City %>",
            "Title": "Delete a <%= EntityName %>"
        }
    },
    "Contact": {
        "Create": {
            "Enabled": true,
            "Columns": [],
            "Title": "Create a <%= EntityName %>"
        },
        "Record": {
            "Enabled": true,
            "Columns": [
                {
                    "Column": "Person",
                    "Type": "SectionHeading"
                },
                {
                    "Column": "Name"
                },
                {
                    "Column": "Address",
                    "Type": "SectionHeading"
                },
                {
                    "Column": "Address"
                },
                {
                    "Column": "City"
                },
                {
                    "Column": "State"
                },
                {
                    "Column": "Zip"
                },
                {
                    "Column": "Contact",
                    "Type": "SectionHeading"
                },
                {
                    "Column": "Email",
                    "Title": "Email Address"
                },
                {
                    "Column": "Phone"
                }
            ],
            "Title": "Contact <%= Name %>"
        },
        "Update": {
            "Enabled": true,
            "Columns": [
                {
                    "Column": "Person",
                    "Type": "SectionHeading"
                },
                {
                    "Column": "Name"
                },
                {
                    "Column": "Address",
                    "Type": "SectionHeading"
                },
                {
                    "Column": "City",
                    "Title": "City of Residence"
                }
            ],
            "Title": "Change this Contact with Name <%= Name %>"
        },
        "List": {
            "Enabled": true,
            "RowMenu": true,
            "AddButton": true,
            "Columns": [],
            "Title": "<%= EntityName %>s"
        },
        "Delete": {
            "Enabled": true,
            "Validation": true,
            "DisplayRecord": true,
            "Columns": [],
            "ConfirmationMessage": "Are you sure you want to delete this record with ID XXXXX?",
            "Title": "Delete a <%= EntityName %>"
        }
    }
}
    );
    return tmpStricturePictModel;
  }
);