/**
* Stricture - Menu Options
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libJsonFile = require('jsonfile');

// Generate a lookup object that contains the identity key pointing to a table name
var generateIndexedTables = function(pModel)
{
	// First create a "lookup" of primary keys that point back to tables
	console.log('--> ... creating contextual Index ==> Table lookups ...');
	var tmpIndices = {};
	for(var i = 0; i < pModel.Tables.length; i++)
	{
		for (var j = 0; j < pModel.Tables[i].Columns.length; j++)
		{
			if (pModel.Tables[i].Columns[j].DataType == "ID")
			{
				console.log('  > Adding the table '+pModel.Tables[i].TableName+' to the lookup cache with the key '+pModel.Tables[i].Columns[j].Column);
				tmpIndices[pModel.Tables[i].Columns[j].Column] = pModel.Tables[i].TableName;
			}
		}
	}
	return tmpIndices;
}

var loadJSON = function(pFable, fComplete)
{
	tmpComplete = (typeof(fComplete) === 'function') ? fComplete : function() {};
	// Load the model file
	libJsonFile.readFile
	(
		pFable.settings.InputFileName,
		function(pError, pModel)
		{
			console.log('--> Loading '+pFable.settings.InputFileName);
			if (pError)
			{
				console.log('  > Error loading the input file "'+pFable.settings.InputFileName+'" -- TERMINATING.');
				console.log('  > Message: '+pError);
				process.exit(0);
			}
			if (pModel === null)
			{
				console.log('  > Error loading the input file "'+pFable.settings.InputFileName+'" -- TERMINATING.');
				process.exit(0);
			}

			console.log('  > file loaded successfully.');

			// Set the model property and continue on the chain
			pFable.Model = pModel;
			// Now create the indices
			pFable.ModelIndices = generateIndexedTables(pModel);

			tmpComplete(pFable);
		}
	);
};

module.exports = loadJSON;