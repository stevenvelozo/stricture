#! /bin/bash
#
# This DDL is meant to allow rapid prototyping and documentation of a data model.
#
# If this takes off and needs more features, this will need to be turned into a real parser.
#
echo "MicroDDL to JSON Conversion"
echo ""
echo "License: MIT"
echo "Contact: Steven Velozo <steven@velozo.com>"
echo ""
echo "---"
echo ""
echo "Usage: ./MicroDDL-To-JSON.sh [MicroDDLFile.mddl]"
echo ""

#
# Check if there is a file specified
if [ ! -n "$1" ]
then
  echo "ERROR: You must provide a single argument, which is the filename of the MicroDDL file to process."
  echo ""
  exit
fi


SED="sed"

if [ "$(uname)" == "Darwin" ]; then
    # Use the gsed that comes with HomeBrew, for compatibility
    SED="gsed"
fi

# Remove vestiges of last run
echo "--> Removing vestiges of last run..."
rm -f *.almostjson

#
# Juggle the ddl back and forth until it looks how we want.
# --------------
# Table definitions:
echo "--> Creating json data description..."
cat $1 |$SED 's/\!\(.*\)/  {\n    "TableName": "\1",\n    "Columns":\n      [/g' > ./tmpDDL1.almostjson
# Primary Identities
cat tmpDDL1.almostjson |$SED 's/\@\(.*\)/          { "Column": "\1", "DataType": "ID" },/g' > ./tmpDDL2.almostjson
# Numbers Joined to Other Tables
cat tmpDDL2.almostjson |$SED 's/\#\(.*\) -> \(.*\)/          { "Column": "\1", "DataType": "Numeric", "Join": "\2"},/g' > ./tmpDDL1.almostjson
# Numbers
cat tmpDDL1.almostjson |$SED 's/\#\(.*\)/          { "Column": "\1", "DataType": "Numeric" },/g' > ./tmpDDL2.almostjson
# Decimals with Size
cat tmpDDL2.almostjson |$SED 's/\.\(.*\) \(.*\)/          { "Column": "\1", "Size": "\2", "DataType": "Decimal" },/g' > ./tmpDDL1.almostjson
# Decimals (default to 10 digits, 3 decimal so max 9999999.999)
cat tmpDDL1.almostjson |$SED 's/\.\(.*\)/          { "Column": "\1", "Size": "10,3", "DataType": "Decimal" },/g' > ./tmpDDL2.almostjson
# Strings with Size
cat tmpDDL2.almostjson |$SED 's/\$\(.*\) \(.*\)/          { "Column": "\1", "Size": "\2", "DataType": "String" },/g' > ./tmpDDL1.almostjson
# Strings (default to size 64)
cat tmpDDL1.almostjson |$SED 's/\$\(.*\)/          { "Column": "\1", "Size": "64", "DataType": "String" },/g' > ./tmpDDL2.almostjson
# Text
cat tmpDDL2.almostjson |$SED 's/\*\(.*\)/          { "Column": "\1", "DataType": "Text" },/g' > ./tmpDDL1.almostjson
# Date
cat tmpDDL1.almostjson |$SED 's/\&\(.*\)/          { "Column": "\1", "DataType": "DateTime" },/g' > ./tmpDDL2.almostjson
# Boolean
cat tmpDDL2.almostjson |$SED 's/\^\(.*\)/          { "Column": "\1", "DataType": "Boolean" },/g' > ./tmpDDL1.almostjson
# GUID
cat tmpDDL1.almostjson |$SED 's/\%\(.*\)/          { "Column": "\1", "DataType": "GUID" },/g' > ./tmpDDL2.almostjson
# End Brackets for Table Structures
cat tmpDDL2.almostjson |$SED 's/^$/      ]\n  },/' > ./tmpDDL1.almostjson

# Now cleanup:
# --
# Take out extraneous commas in column arrays (at the end of the list)
echo "--> Fixing up json..."
cat tmpDDL1.almostjson |$SED ':begin;$!N;s/},\n      ]/}\n      ]/;tbegin;P;D' > ./tmpDDL2.almostjson
# Add close of JSON structure at end of file
echo -e '\n  ]\n}\n' >> tmpDDL2.almostjson
cat tmpDDL2.almostjson |$SED '1i {\n  "Tables":\n  [' > tmpDDL1.almostjson
# Remove extraneous lines
cat tmpDDL1.almostjson |$SED '/^$/d' > tmpDDL2.almostjson
# Fix the last entry in the array of tables to not have the extraneous comma
cat tmpDDL2.almostjson |$SED ':begin;$!N;s/},\n  ]/}\n  ]/;tbegin;P;D' > $1.json

echo "--> Cleaning up..."
# Now remove the vestiges of this run
rm *.almostjson

echo "--> Generation complete!  $1.json is ready to work with."