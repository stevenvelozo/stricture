/**
* Stricture - Generator - MySQL Transfer Statement
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');

/***********
 * MySQL generation for migrating records into a new database.
 *
 * This will obviously requires some hand tuning, but saves on a lot of boilerplate.
 *
 INSERT INTO
	DB_TO.User
	(
		IDUser,
		GUIDUser,

		CreateDate,
		CreatingIDUser,
		UpdateDate,
		UpdatingIDUser,

		LoginID,
		LoginPassword,

		NameFirst,
		NameMiddle,
		NameLast,

		Email,

		PasswordResetKey,

		IDCustomer,
		Contractor,
		ExternalIDUser,
		RepresentingOrganizationName,

		StartDate
	)
SELECT
	TABLE_FROM.IDTABLE_FROM,
	TABLE_FROM.GUIDTABLE_FROM,

	TABLE_FROM.Created,
	TABLE_FROM.CreatingUserID,
	TABLE_FROM.Modified,
	TABLE_FROM.ModifyingUserID,

	TABLE_FROM.UserName,
	TABLE_FROM.UserPassword,

	TABLE_FROM.UserFirstName,
	TABLE_FROM.UserMiddleName,
	TABLE_FROM.UserLastName,

	TABLE_FROM.UserEmail,

	TABLE_FROM.PasswordResetKey,

	TABLE_FROM.IDOrganizationsInternalDB,
	TABLE_FROM.Contractor,
	TABLE_FROM.UserIDExternal,
	TABLE_FROM.RepresentingCompany,

	TABLE_FROM.WorkStartDate
FROM
	DB_FROM.TABLE_FROM
 *****/
 var GenerateMySQLMigration = function(pFable)
 {
	var tmpMySQLFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'-Migration.mysql.sql';

	console.log('--> Building the table create file...');
	libFS.writeFileSync(tmpMySQLFile, '-- Data Model -- Generated '+new Date().toJSON()+"\n");
	libFS.appendFileSync(tmpMySQLFile, "\n");
	libFS.appendFileSync(tmpMySQLFile, "-- This script creates migration stubs for the following tables:\n");
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
		libFS.appendFileSync(tmpMySQLFile, "\nINSERT INTO\n  DB_TO."+pFable.Model.Tables[tmpTable].TableName+"\n    (");
		var tmpFromQuery = "SELECT";
		for (var j = 0; j < pFable.Model.Tables[tmpTable].Columns.length; j++)
		{
			// If we aren't the first element, append a comma.
			if (j > 0)
			{
				libFS.appendFileSync(tmpMySQLFile, ",");
				tmpFromQuery += ",";
			}

			libFS.appendFileSync(tmpMySQLFile, "\n");
			tmpFromQuery += "\n"
			// Dump out each column......
			switch (pFable.Model.Tables[tmpTable].Columns[j].DataType)
			{
				case 'ID':
					libFS.appendFileSync(tmpMySQLFile, "        -- INT UNSIGNED NOT NULL AUTO_INCREMENT\n");
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column);
					tmpFromQuery += "        -- {" + pFable.Model.Tables[tmpTable].Columns[j].Column + "} INT UNSIGNED NOT NULL AUTO_INCREMENT\n";
					tmpFromQuery += "        TABLE_FROM."+pFable.Model.Tables[tmpTable].Columns[j].Column;
					tmpPrimaryKey = pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				case 'GUID':
					libFS.appendFileSync(tmpMySQLFile, "        -- CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'\n");
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column);
					tmpFromQuery += "        -- {" + pFable.Model.Tables[tmpTable].Columns[j].Column + "} CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'\n";
					tmpFromQuery += "        TABLE_FROM."+pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				case 'ForeignKey':
					libFS.appendFileSync(tmpMySQLFile, "        -- INT UNSIGNED NOT NULL DEFAULT '0'\n");
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column);
					tmpFromQuery += "        -- {" + pFable.Model.Tables[tmpTable].Columns[j].Column + "} INT UNSIGNED NOT NULL DEFAULT '0'\n";
					tmpFromQuery += "        TABLE_FROM."+pFable.Model.Tables[tmpTable].Columns[j].Column;
					tmpPrimaryKey = pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				case 'Numeric':
					libFS.appendFileSync(tmpMySQLFile, "        -- INT NOT NULL DEFAULT '0'\n");
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column);
					tmpFromQuery += "        -- {" + pFable.Model.Tables[tmpTable].Columns[j].Column + "} INT NOT NULL DEFAULT '0'\n";
					tmpFromQuery += "        TABLE_FROM."+pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				case 'Decimal':
					libFS.appendFileSync(tmpMySQLFile, "        -- DECIMAL("+pFable.Model.Tables[tmpTable].Columns[j].Size+")\n");
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column);
					tmpFromQuery += "        -- {" + pFable.Model.Tables[tmpTable].Columns[j].Column + "} DECIMAL("+pFable.Model.Tables[tmpTable].Columns[j].Size+")\n";
					tmpFromQuery += "        TABLE_FROM."+pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				case 'String':
					libFS.appendFileSync(tmpMySQLFile, "        -- CHAR("+pFable.Model.Tables[tmpTable].Columns[j].Size+") NOT NULL DEFAULT ''\n");
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column);
					tmpFromQuery += "        -- {" + pFable.Model.Tables[tmpTable].Columns[j].Column + "} CHAR("+pFable.Model.Tables[tmpTable].Columns[j].Size+") NOT NULL DEFAULT ''\n";
					tmpFromQuery += "        TABLE_FROM."+pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				case 'Text':
					libFS.appendFileSync(tmpMySQLFile, "        -- TEXT\n");
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column);
					tmpFromQuery += "        -- {" + pFable.Model.Tables[tmpTable].Columns[j].Column + "} TEXT\n";
					tmpFromQuery += "        TABLE_FROM."+pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				case 'DateTime':
					libFS.appendFileSync(tmpMySQLFile, "        -- DATETIME\n");
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column);
					tmpFromQuery += "        -- {" + pFable.Model.Tables[tmpTable].Columns[j].Column + "} DATETIME\n";
					tmpFromQuery += "        TABLE_FROM."+pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				case 'Boolean':
					libFS.appendFileSync(tmpMySQLFile, "        -- TINYINT NOT NULL DEFAULT '0'\n");
					libFS.appendFileSync(tmpMySQLFile, "        "+pFable.Model.Tables[tmpTable].Columns[j].Column);
					tmpFromQuery += "        -- {" + pFable.Model.Tables[tmpTable].Columns[j].Column + "} TINYINT NOT NULL DEFAULT '0'\n";
					tmpFromQuery += "        TABLE_FROM."+pFable.Model.Tables[tmpTable].Columns[j].Column;
					break;
				default:
					break;
			}
		}
		libFS.appendFileSync(tmpMySQLFile, "\n    )\n");
		tmpFromQuery += "\nFROM\n    DB_FROM.TABLE_FROM;\n";
		libFS.appendFileSync(tmpMySQLFile, tmpFromQuery);
	}
};

module.exports = GenerateMySQLMigration;
