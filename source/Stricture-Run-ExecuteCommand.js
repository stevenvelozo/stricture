/**
* Stricture - Run Command Options
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/

const libAsync = require('async');
var libMkdirp = require('mkdirp');
const { first } = require('underscore');

var createDirectories = function(pFable, fCallback)
{
	libMkdirp(pFable.settings.OutputLocation,
		(pError)=>
		{
			return fCallback();
		});
};

// Load the JSON data into the pFable object before running a command
var executeModelCommand = function(pCommandFile, pFable, fCallback)
{
	let tmpCallback = (typeof(fCallback) == 'function') ? fCallback : ()=>{};
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
				return tmpCallback();
			}
		);
	}
	catch(pError)
	{
		console.log('>>> Command ['+pCommandFile+'] execution failed!');
		console.log('  > '+pError);
		return tmpCallback(pError);
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
		case 'Full':
			libAsync.waterfall(
				[
					(fStageComplete)=>
					{
						// Start by compiling
						require('./Stricture-Compile.js')(pFable, fStageComplete);
					},
					(fStageComplete)=>
					{
						// Now twiddle settings to use the proper input file (the Meadow extended)
						pFable.settings.InputFileName = './model/MeadowModel-Extended.json';
						pFable.settings.OutputLocationPrefix = pFable.settings.OutputLocation;

						return fStageComplete();
					},
					(fStageComplete)=>
					{
						// Setup the directories for the new model command
						pFable.settings.OutputLocation = `${pFable.settings.OutputLocationPrefix}mysql_create/`;
						pFable.settings.OutputFileName = `MeadowModel-CreateMySQLDatabase`;
						createDirectories(pFable, fStageComplete);
					},
					(fStageComplete)=>
					{
						// Now build MySQL create Statements
						executeModelCommand('./Stricture-Generate-MySQL.js', pFable, fStageComplete);
					},
					(fStageComplete)=>
					{
						console.log('aaaaaa')
						// Setup the directories for the meadow schemas
						pFable.settings.OutputLocation = `${pFable.settings.OutputLocationPrefix}meadow/`;
						pFable.settings.OutputFileName = `MeadowSchema`;
						createDirectories(pFable, fStageComplete);
					},
					(fStageComplete)=>
					{
						// Now build individual Meadow schemas
						executeModelCommand('./Stricture-Generate-Meadow.js', pFable, fStageComplete);
					},
					(fStageComplete)=>
					{
						// Setup the directories for the Documentation commands
						pFable.settings.OutputLocation = `${pFable.settings.OutputLocationPrefix}doc/`;
						pFable.settings.OutputFileName = `Documentation`;
						createDirectories(pFable, fStageComplete);
					},
					(fStageComplete)=>
					{
						// Now build Markdown documentation
						executeModelCommand('./Stricture-Generate-Markdown.js', pFable, fStageComplete);
					},
					(fStageComplete)=>
					{
						// Setup the directories for the diagram command
						pFable.settings.OutputLocation = `${pFable.settings.OutputLocationPrefix}doc/diagrams/`;
						pFable.settings.OutputFileName = `Relationships`;
						createDirectories(pFable, fStageComplete);
					},
					(fStageComplete)=>
					{
						// Now build diagrams
						pFable.settings.AutomaticallyCompile = true;
						executeModelCommand('./Stricture-Generate-ModelGraph.js', pFable, fStageComplete);
					},
					(fStageComplete)=>
					{
						// Now build the second (full) relationship diagram
						pFable.settings.OutputFileName = `RelationshipsFull`;
						pFable.settings.GraphFullJoins = true;
						executeModelCommand('./Stricture-Generate-ModelGraph.js', pFable, fStageComplete);
					}
				],
				(pError)=>
				{
					console.log('Error running full compilation... '+pError);
				}
			);
			break;
		// Convert the MicroDDL to JSON
		case 'Compile':
			require('./Stricture-Compile.js')(pFable);
			break;

		// Generate the LaTeX Data Dictionary
		case 'DataDictionary':
			executeModelCommand('./Stricture-Generate-LaTeX.js', pFable);
			break;

		// Generate the LaTeX Data Dictionary
		case 'DictionaryCSV':
			executeModelCommand('./Stricture-Generate-DictionaryCSV.js', pFable);
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

		// Generate MySQL Migrate
		case 'MySQL-Migrate':
			executeModelCommand('./Stricture-Generate-MySQL-Migrate.js', pFable);
			break;

		// Generate Meadow Model Descriptions
		case 'Meadow':
			executeModelCommand('./Stricture-Generate-Meadow.js', pFable);
			break;

		// Generate Meadow Auth Charts
		case 'Pict':
			executeModelCommand('./Stricture-Generate-Pict.js', pFable);
			break;

		// Generate Unit Test Objects
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
