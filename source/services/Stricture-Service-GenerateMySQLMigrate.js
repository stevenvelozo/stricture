/**
 * Stricture - Generator Service - MySQL Migration Stubs
 *
 * Generates INSERT INTO ... SELECT migration stubs for transferring records
 * between databases. Useful as a starting point for data migration scripts.
 *
 * Replaces the legacy Stricture-Generate-MySQL-Migrate.js functionality.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');

const libFableServiceBase = require('fable').ServiceProviderBase;

/**
 * Service that generates MySQL migration stubs from the loaded model.
 */
class StrictureServiceGenerateMySQLMigrate extends libFableServiceBase
{
	/**
	 * @param {Object} pFable - The Fable Framework instance
	 * @param {Object} pOptions - The options for the service
	 * @param {String} pServiceHash - The hash of the service
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {any} */
		this.log;

		this.serviceType = 'StrictureGenerateMySQLMigrate';
	}

	/**
	 * Generate MySQL migration INSERT INTO ... SELECT stubs.
	 *
	 * @param {Object} pOptions - Generation options
	 * @param {string} pOptions.OutputLocation - Directory for the output file
	 * @param {string} pOptions.OutputFileName - Base name for the output file
	 * @param {function} fCallback - Callback invoked as fCallback(pError) on completion
	 */
	generate(pOptions, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpModel = this.fable.AppData.Model;

		if (!tmpModel || !tmpModel.Tables)
		{
			this.log.error('  > No model loaded; cannot generate MySQL Migration.');
			return tmpCallback(new Error('No model loaded'));
		}

		let tmpMySQLFile = pOptions.OutputLocation + pOptions.OutputFileName + '-Migration.mysql.sql';

		this.log.info('--> Building the table migration file...');

		libFS.writeFileSync(tmpMySQLFile, '-- Data Model -- Generated ' + new Date().toJSON() + '\n');
		libFS.appendFileSync(tmpMySQLFile, '\n');
		libFS.appendFileSync(tmpMySQLFile, '-- This script creates migration stubs for the following tables:\n');
		libFS.appendFileSync(tmpMySQLFile, '-- Table ----------------------------------------- Column Count ----------------\n');

		for (let tmpTable in tmpModel.Tables)
		{
			let tmpTableRightPad = '                                                  ';
			let tmpTableName = tmpModel.Tables[tmpTable].TableName + tmpTableRightPad.slice(-(tmpTableRightPad.length - tmpModel.Tables[tmpTable].TableName.length));
			libFS.appendFileSync(tmpMySQLFile, '--   ' + tmpTableName + ' ' + ('      ' + tmpModel.Tables[tmpTable].Columns.length).slice(-6) + '\n');
		}

		for (let tmpTable in tmpModel.Tables)
		{
			this.log.info('  > ' + tmpModel.Tables[tmpTable].TableName);

			libFS.appendFileSync(tmpMySQLFile, '\n\n\n' + '--   [ ' + tmpModel.Tables[tmpTable].TableName + ' ]');
			libFS.appendFileSync(tmpMySQLFile, '\nINSERT INTO\n  DB_TO.' + tmpModel.Tables[tmpTable].TableName + '\n    (');
			let tmpFromQuery = 'SELECT';

			for (let j = 0; j < tmpModel.Tables[tmpTable].Columns.length; j++)
			{
				if (j > 0)
				{
					libFS.appendFileSync(tmpMySQLFile, ',');
					tmpFromQuery += ',';
				}

				libFS.appendFileSync(tmpMySQLFile, '\n');
				tmpFromQuery += '\n';

				let tmpColumn = tmpModel.Tables[tmpTable].Columns[j];

				switch (tmpColumn.DataType)
				{
					case 'ID':
						libFS.appendFileSync(tmpMySQLFile, '        -- INT UNSIGNED NOT NULL AUTO_INCREMENT\n');
						libFS.appendFileSync(tmpMySQLFile, '        ' + tmpColumn.Column);
						tmpFromQuery += '        -- {' + tmpColumn.Column + '} INT UNSIGNED NOT NULL AUTO_INCREMENT\n';
						tmpFromQuery += '        TABLE_FROM.' + tmpColumn.Column;
						break;
					case 'GUID':
						libFS.appendFileSync(tmpMySQLFile, "        -- CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'\n");
						libFS.appendFileSync(tmpMySQLFile, '        ' + tmpColumn.Column);
						tmpFromQuery += "        -- {" + tmpColumn.Column + "} CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'\n";
						tmpFromQuery += '        TABLE_FROM.' + tmpColumn.Column;
						break;
					case 'ForeignKey':
						libFS.appendFileSync(tmpMySQLFile, "        -- INT UNSIGNED NOT NULL DEFAULT '0'\n");
						libFS.appendFileSync(tmpMySQLFile, '        ' + tmpColumn.Column);
						tmpFromQuery += "        -- {" + tmpColumn.Column + "} INT UNSIGNED NOT NULL DEFAULT '0'\n";
						tmpFromQuery += '        TABLE_FROM.' + tmpColumn.Column;
						break;
					case 'Numeric':
						libFS.appendFileSync(tmpMySQLFile, "        -- INT NOT NULL DEFAULT '0'\n");
						libFS.appendFileSync(tmpMySQLFile, '        ' + tmpColumn.Column);
						tmpFromQuery += "        -- {" + tmpColumn.Column + "} INT NOT NULL DEFAULT '0'\n";
						tmpFromQuery += '        TABLE_FROM.' + tmpColumn.Column;
						break;
					case 'Decimal':
						libFS.appendFileSync(tmpMySQLFile, '        -- DECIMAL(' + tmpColumn.Size + ')\n');
						libFS.appendFileSync(tmpMySQLFile, '        ' + tmpColumn.Column);
						tmpFromQuery += '        -- {' + tmpColumn.Column + '} DECIMAL(' + tmpColumn.Size + ')\n';
						tmpFromQuery += '        TABLE_FROM.' + tmpColumn.Column;
						break;
					case 'String':
						libFS.appendFileSync(tmpMySQLFile, "        -- CHAR(" + tmpColumn.Size + ") NOT NULL DEFAULT ''\n");
						libFS.appendFileSync(tmpMySQLFile, '        ' + tmpColumn.Column);
						tmpFromQuery += "        -- {" + tmpColumn.Column + "} CHAR(" + tmpColumn.Size + ") NOT NULL DEFAULT ''\n";
						tmpFromQuery += '        TABLE_FROM.' + tmpColumn.Column;
						break;
					case 'Text':
						libFS.appendFileSync(tmpMySQLFile, '        -- TEXT\n');
						libFS.appendFileSync(tmpMySQLFile, '        ' + tmpColumn.Column);
						tmpFromQuery += '        -- {' + tmpColumn.Column + '} TEXT\n';
						tmpFromQuery += '        TABLE_FROM.' + tmpColumn.Column;
						break;
					case 'DateTime':
						libFS.appendFileSync(tmpMySQLFile, '        -- DATETIME\n');
						libFS.appendFileSync(tmpMySQLFile, '        ' + tmpColumn.Column);
						tmpFromQuery += '        -- {' + tmpColumn.Column + '} DATETIME\n';
						tmpFromQuery += '        TABLE_FROM.' + tmpColumn.Column;
						break;
					case 'Boolean':
						libFS.appendFileSync(tmpMySQLFile, "        -- TINYINT NOT NULL DEFAULT '0'\n");
						libFS.appendFileSync(tmpMySQLFile, '        ' + tmpColumn.Column);
						tmpFromQuery += "        -- {" + tmpColumn.Column + "} TINYINT NOT NULL DEFAULT '0'\n";
						tmpFromQuery += '        TABLE_FROM.' + tmpColumn.Column;
						break;
					default:
						break;
				}
			}

			libFS.appendFileSync(tmpMySQLFile, '\n    )\n');
			tmpFromQuery += '\nFROM\n    DB_FROM.TABLE_FROM;\n';
			libFS.appendFileSync(tmpMySQLFile, tmpFromQuery);
		}

		return tmpCallback(null);
	}
}

module.exports = StrictureServiceGenerateMySQLMigrate;

/** @type {Record<string, any>} */
StrictureServiceGenerateMySQLMigrate.default_configuration = {};
