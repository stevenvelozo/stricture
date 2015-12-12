/**
* Stricture - Run Command Options
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/

// Load the JSON data into the pFable object before running a command
var executeModelCommand = function(pCommandFile, pFable)
{
	// The pCommandFile parameter contains the filename of the modular command to execute
	try
	{
		console.time("Stricture Command Execution");
		var tmpCommandFunction = require(pCommandFile);
		pFable.StrictureExtensions.LoadJSON(
			function()
			{
				tmpCommandFunction(pFable);
				console.timeEnd("Stricture Command Execution");
			}
		);
	}
	catch(pError)
	{
		console.log('>>> Command ['+pCommandFile+'] execution failed!');
		console.log('  > '+pError);
	}
};

// Execute whatever stricture command was passed in
var runCommand = function(pFable)
{
	var tmpCommand = pFable.settings.Command;
	console.log('');
	console.info('--> Running Command: '+tmpCommand);
	switch(tmpCommand)
	{
		// Convert the MicroDDL to JSON
		case 'Compile':
			require('./Stricture-Compile.js')(pFable);
			break;

		// Generate the LaTeX Data Dictionary
		case 'DataDictionary':
			executeModelCommand('./Stricture-Generate-LaTeX.js', pFable);
			break;

		// Generate the MarkDown Data Dictionary
		case 'Documentation':
			executeModelCommand('./Stricture-Generate-Markdown.js', pFable);
			break;

		// Generate the directed table relationships based on joins
		case 'Relationships':
			// Generate the relationship graph
			pFable.settings.GraphFullJoins = false;
			executeModelCommand('./Stricture-Generate-ModelGraph.js', pFable);
			break;

		// Generate the directed table relationships based on joins
		case 'RelationshipsFull':
			// Generate the relationship graph, including change tracking user joins
			pFable.settings.GraphFullJoins = true;
			executeModelCommand('./Stricture-Generate-ModelGraph.js', pFable);
			break;

		// Generate MySQL Create
		case 'MySQL':
			executeModelCommand('./Stricture-Generate-MySQL.js', pFable);
			break;

		// Generate Meadow Model Descriptions
		case 'Meadow':
			executeModelCommand('./Stricture-Generate-Meadow.js', pFable);
			break;

		// Generate Meadow Model Descriptions
		case 'AuthorizationChart':
			executeModelCommand('./Stricture-Generate-Authorization-Chart.js', pFable);
			break;

		// Generate Meadow Model Descriptions
		case 'TestObjectContainers':
			executeModelCommand('./Stricture-Generate-TestObjectContainers.js', pFable);
			break;

		// No command provided, show basic info (a table count and list).
		default:
			pFable.StrictureExtensions.LoadJSON(
				function()
				{
					if (tmpCommand !== 'Info')
						console.error('==> Command "'+tmpCommand+'" was not recognized.  Defaulting to table list operation!')
					console.log('--> There are '+pFable.Model.Tables.length+' tables in the DDL (listed below).');
					for(var i = 0; i < pFable.Model.Tables.length; i++)
						console.log('    '+pFable.Model.Tables[i].TableName);
				}
			);
			break;
	}
}

module.exports = runCommand;