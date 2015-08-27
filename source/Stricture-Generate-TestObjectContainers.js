/**
* Stricture - Generator - Test Object Data File
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');
var libAsync = require('async');
var libUnderscore = require('underscore');

/***********
 * Test Object generation
 *****/
var GenerateTestObjects = function(pFable)
{
	// Use the output file as the prefix
	var tmpTestObjectFileLocation = pFable.settings.OutputLocation+pFable.settings.OutputFileName;

	console.log('--> Building the test fixture object container files...');

	libAsync.each
	(
		pFable.Model.Tables,
		function(pRecord, pQueueCallback)
		{
			var tmpTable = pRecord;

			console.log('  > Table: '+tmpTable.TableName);


			var tmpPrimaryKey = 'ID'+tmpTable.TableName;

			// Get the primary key
			for (var j = 0; j < tmpTable.Columns.length; j++)
				if (tmpTable.Columns[j].DataType == 'ID')
					tmpPrimaryKey = tmpTable.Columns[j].Column;

			var tmpDefaultTestObject = {};
			var tmpGUIDList = [];

			for (var j = 0; j < tmpTable.Columns.length; j++)
			{
				var tmpColumnName = tmpTable.Columns[j].Column;
				var tmpColumnType = tmpTable.Columns[j].DataType;
				// Dump out each column......
				switch (tmpColumnType)
				{
					case 'ID':
						tmpDefaultTestObject[tmpColumnName] = 0;
						break;
					case 'GUID':
						tmpGUIDList.push(tmpColumnName);
						tmpDefaultTestObject[tmpColumnName] = '0x000000000000';
						break;
					case 'Numeric':
						tmpDefaultTestObject[tmpColumnName] = 0;
						break;
					case 'Decimal':
						tmpDefaultTestObject[tmpColumnName] = 0.0;
						break;
					case 'String':
					case 'Text':
						tmpDefaultTestObject[tmpColumnName] = '';
						break;
					case 'DateTime':
						tmpDefaultTestObject[tmpColumnName] = null;
						break;
					case 'Boolean':
						tmpDefaultTestObject[tmpColumnName] = false;
						break;
				}
			}

			var tmpTestObjects = [];

			for (var k = 0; k < 25; k++)
			{
				var tmpTestObject = libUnderscore.extend({}, tmpDefaultTestObject);
				tmpTestObject[tmpPrimaryKey] = k;
				for (var l = 0; l < tmpGUIDList.length; l++)
				{
					tmpTestObject[tmpGUIDList[l]] = pFable.getUUID();
				}
				tmpTestObjects.push(tmpTestObject);
			}

			// Now persist our test object array
			libFS.writeFile(tmpTestObjectFileLocation+tmpTable.TableName+".json", JSON.stringify(tmpTestObjects, null, 4), "utf8", pQueueCallback);
 		},
		function(pError)
		{
			if (pError)
				console.log('#### ERROR PERSISTING TEST OBJECTS: '+pError);
		}
	);
}

module.exports = GenerateTestObjects;
