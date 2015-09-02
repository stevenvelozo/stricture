/**
* Stricture - Prepare the environment for running
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libJsonFile = require('jsonfile');
var _Fable = false;

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
	console.log('  > indices built successfully.');
	return tmpIndices;
}

var loadJSON = function(fComplete)
{
	tmpComplete = (typeof(fComplete) === 'function') ? fComplete : function() {};
	// Load the model file
	libJsonFile.readFile
	(
		_Fable.settings.InputFileName,
		function(pError, pModel)
		{
			console.log('--> Loading '+_Fable.settings.InputFileName);
			if (pError)
			{
				console.log('  > Error loading the input file "'+_Fable.settings.InputFileName+'" -- TERMINATING.');
				console.log('  > Message: '+pError);
				process.exit(0);
			}
			if (pModel === null)
			{
				console.log('  > Error loading the input file "'+_Fable.settings.InputFileName+'" -- TERMINATING.');
				process.exit(0);
			}

			console.log('  > file loaded successfully.');

			// Set the model property and continue on the chain
			_Fable.Model = pModel;
			// Now create the indices
			_Fable.ModelIndices = generateIndexedTables(pModel);

			console.log('  > executing script: '+typeof(tmpComplete));

			tmpComplete(_Fable);
		}
	);
};

prepareEnvironment = function(pFable, fComplete)
{
	tmpComplete = (typeof(fComplete) === 'function') ? fComplete : function() {};
	// Add the load and generation behaviors to the fable object
	pFable.StrictureExtensions = {LoadJSON:loadJSON, GenerateIndexedTables:generateIndexedTables};

	// Keep the reference to fable around
	_Fable = pFable;

	tmpComplete(pFable);
}

module.exports = prepareEnvironment;