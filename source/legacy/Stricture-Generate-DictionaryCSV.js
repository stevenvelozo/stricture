/**
* Stricture - Generator - CSV Data Dictionary
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');

/***********
 * CSV Dictionary generation
 *****/
var GenerateCSVDictionary = function(pFable)
{
	var tmpDictionaryFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'-DataDictionary.csv';

	console.log('--> Building the csv data dictionary...');
	console.log('  > Tables of Contents');

	libFS.writeFileSync(tmpDictionaryFile, "Table,Column Name,Size,Data Type,Join\n");
	console.log('  > Raw Tables');
	for(var tmpTable in pFable.Model.Tables)
	{
		console.log('  >>>> '+pFable.Model.Tables[tmpTable].TableName);
		for (var j = 0; j < pFable.Model.Tables[tmpTable].Columns.length; j++)
		{
			// Dump out each column......
			var tmpSize = (pFable.Model.Tables[tmpTable].Columns[j].Size == undefined) ? '' : pFable.Model.Tables[tmpTable].Columns[j].Size;
			var tmpJoin = (pFable.Model.Tables[tmpTable].Columns[j].Join == undefined) ? '' : pFable.ModelIndices[pFable.Model.Tables[tmpTable].Columns[j].Join]+'.'+pFable.Model.Tables[tmpTable].Columns[j].Join;
			libFS.appendFileSync(tmpDictionaryFile, '"'+pFable.Model.Tables[tmpTable].TableName+'","'+pFable.Model.Tables[tmpTable].Columns[j].Column+'","'+tmpSize+'","'+pFable.Model.Tables[tmpTable].Columns[j].DataType+'","'+tmpJoin+'"'+"\n");
		}
	}
};

module.exports = GenerateCSVDictionary;
