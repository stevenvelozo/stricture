/**
* Stricture - Run Command Options
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/

// Execute whatever stricture command was passed in
var runCommand = function(pFable)
{
	var tmpCommand = pFable.settings.Command;
	console.log('');
	console.log('--> Running Command: '+tmpCommand);
	switch(tmpCommand)
	{
		// Generate the LaTeX Data Dictionary in ../../Documentation/Headlight/DataModel/
		case 'DataDictionary':
			require('./Stricture-Generate-LaTeX.js')(pFable);
			break;

		// Generate the LaTeX Data Dictionary in ../../Documentation/Headlight/DataModel/
		case 'Documentation':
			require('./Stricture-Generate-Markdown.js')(pFable);
			break;

		// Generate the directed table relationships based on joins
		case 'Relationships':
			// Generate the relationship graph
			pFable.settings.GraphFullJoins = false;
			require('./Stricture-Generate-ModelGraph.js')(pFable);
			break;

		// Generate the directed table relationships based on joins
		case 'RelationshipsFull':
			// Generate the relationship graph, including change tracking user joins
			pFable.settings.GraphFullJoins = true;
			require('./Stricture-Generate-ModelGraph.js')(pFable);
			break;

		// Generate MySQL Create
		case 'MySQL':
			require('./Stricture-Generate-MySQL.js')(pFable);
			break;

		// Generate Meadow Model Descriptions
		case 'Meadow':
			require('./Stricture-Generate-Meadow.js')(pFable);
			break;

		// No command provided, show basic info (a table count and list).
		default:
			console.log('--> There are '+pFable.Model.Tables.length+' tables in the DDL (listed below).');
			for(var i = 0; i < pFable.Model.Tables.length; i++)
				console.log('    '+pFable.Model.Tables[i].TableName);
			break;
	}
}

module.exports = runCommand;