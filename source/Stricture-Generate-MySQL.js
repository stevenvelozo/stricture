/**
* Stricture - Generator - MySQL Create Statement
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');

/***********
 * MySQL generation
 CREATE TABLE IF NOT EXISTS
	Terms
	(
		IDTerms INT UNSIGNED NOT NULL AUTO_INCREMENT,
		GUIDTerms CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
		Created DATETIME ,
		CreatingUserID INT NOT NULL DEFAULT '0',
		Modified DATETIME ,
		ModifyingUserID INT NOT NULL DEFAULT '0',
		Term CHAR(128) NOT NULL DEFAULT '',
		TermURI CHAR(128) NOT NULL DEFAULT '',
		IDTermsCannonical INT NOT NULL DEFAULT '0',
		Definition TEXT,
		DefinitionHTML TEXT,
		Links TEXT,
		KEY URI (TermURI),
		PRIMARY KEY (IDTerms)
	);
 *****/
 var GenerateMySQLCreation = function(pFable)
 {
	var tmpMySQLFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'.mysql.sql';

	console.log('--> Building the table create file...');
	libFS.writeFileSync(tmpMySQLFile, '-- Data Model -- Generated '+new Date().toJSON()+"\n");
	libFS.appendFileSync(tmpMySQLFile, "\n");
	libFS.appendFileSync(tmpMySQLFile, "-- This script creates the following tables:\n");
	libFS.appendFileSync(tmpMySQLFile, "-- Table ----------------------------------------- Column Count ----------------\n");
	for(var tmpTable in pFable.Model.Tables)
	{
		var tmpTableRightPad = "                                                  ";
		var tmpTableName = pFable.Model.Tables[tmpTable].TableName+tmpTableRightPad.slice(-(tmpTableRightPad.length - pFable.Model.Tables[tmpTable].TableName.length));
		libFS.appendFileSync(tmpMySQLFile, '--   '+tmpTableName+' '+("      "+pFable.Model.Tables[tmpTable].Columns.length).slice(-6)+"\n");
	}
	for(var tmpTable in pFable.Model.Tables)
	{
		console.log('  > '+pFable.Model.Tables[tmpTable].TableName);

		var tmpPrimaryKey = false;

		libFS.appendFileSync(tmpMySQLFile, "\n\n\n"+'--   [ '+pFable.Model.Tables[tmpTable].TableName+' ]');
		libFS.appendFileSync(tmpMySQLFile, "\nCREATE TABLE IF NOT EXISTS\n    "+pFable.Model.Tables[tmpTable].TableName+"\n    (");
		for (var j = 0; j < pFable.Model.Tables[tmpTable].Columns.length; j++)
		{
			// If we aren't the first element, append a comma.
			if (j > 0)
				libFS.appendFileSync(tmpMySQLFile, ",");

			libFS.appendFileSync(tmpMySQLFile, "\n");
			// Dump out each column......
			switch (pFable.Model.Tables[tmpTable].Columns[j].DataType)
			{
				case 'ID':
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column+" INT UNSIGNED NOT NULL AUTO_INCREMENT");
					tmpPrimaryKey = pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				case 'GUID':
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column+" CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'");
					break;
				case 'Numeric':
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column+" INT NOT NULL DEFAULT '0'");
					break;
				case 'Decimal':
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column+" DECIMAL("+pFable.Model.Tables[tmpTable].Columns[j].Size+")");
					break;
				case 'String':
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column+" CHAR("+pFable.Model.Tables[tmpTable].Columns[j].Size+") NOT NULL DEFAULT ''");
					break;
				case 'Text':
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column+" TEXT");
					break;
				case 'DateTime':
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column+" DATETIME");
					break;
				case 'Boolean':
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column+" TINYINT NOT NULL DEFAULT '0'");
					break;
				default:
					break;
			}
		}
		if (tmpPrimaryKey)
			libFS.appendFileSync(tmpMySQLFile, ",\n\n        PRIMARY KEY ("+tmpPrimaryKey+")");
		libFS.appendFileSync(tmpMySQLFile, "\n    );\n");
	}
};

module.exports = GenerateMySQLCreation;
