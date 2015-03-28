/**
* Stricture MicroDDL JSON Parser
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Processes the JSON Data Description into documentation and SQL statements
*/

var libJsonFile = require('jsonfile');
var libYargs = require('yargs');
var libFS = require('fs');
var libChildProcess = require("child_process");

console.log('Stricture JSON DDL Processing Utility');
console.log('Contact: Steven Velozo <steven@velozo.com>');
console.log('');
console.log('---');
console.log('');

// Process the command-line arguments
// The -c GraphCommand parameter (Relationships, RelationshipsFull, etc.)
var tmpCommand = libYargs.argv.c;
if (tmpCommand === undefined)
	tmpCommand = 'Info';
// The -i InputFileName parameter (required)
var tmpInFile = libYargs.argv.i;
if (tmpInFile == null)
{
	console.log('ERROR: You must provide at least an input filename for the DDL JSON file.');
	console.log('       For Example: node Stricture.js -i "BestDDLEvar.mddl"');
	process.exit(1);
}
// The -o OutputFileName parameter (defaults to "ModelGraph")
var tmpFile = libYargs.argv.o;
if (tmpFile == null)
	tmpFile = 'ModelGraph-'+tmpCommand;
// The -g parameter (meaning "Automatically Generate Graph Image")
var tmpDot = libYargs.argv.g;
// The -l parameter (meaning "Automatically Load Graph Image After Generation")
var tmpLoadImage = libYargs.argv.l;

// Detect the operating system we're working in
var tmpPlatform = 'nix';
if (/^win/.test(process.platform))
	tmpPlatform = 'windows';
if (/^darwin/.test(process.platform))
	tmpPlatform = 'mac';

// Load the model file
var tmpModelFile = tmpInFile;
libJsonFile.readFile
(
	tmpModelFile,
	function(pError, pObject)
	{
		if (pError)
		{
			console.log('Error loading the input file "'+tmpModelFile+'" -- TERMINATING.');
			console.log('Message: '+pError);
			process.exit(0);
		}
		if (pObject === null)
		{
			console.log('Error loading the input file "'+tmpModelFile+'" -- TERMINATING.');
			process.exit(0);
		}

		console.log('--> '+tmpModelFile+' loaded successfully.');

		switch(tmpCommand)
		{
			// Generate the directed table relationships based on joins
			case 'Relationships':
				// Generate the relationship graph
				GenerateRelationshipGraph(pObject);
				break;

			// Generate the directed table relationships based on joins
			case 'RelationshipsFull':
				// Generate the relationship graph, including change tracking user joins
				GenerateRelationshipGraph(pObject, true);
				break;

			// No command provided, show basic info (a table count and list).
			default:
				console.log('--> There are '+pObject.Tables.length+' tables in the DDL (listed below).');
				for(var i = 0; i < pObject.Tables.length; i++)
					console.log('    '+pObject.Tables[i].TableName);
				break;
		}
	}
);

// Generate a lookup object that contains the identity key pointing to a table name
function GetIndexedTables(pObject)
{
	// First create a "lookup" of primary keys that point back to tables
	console.log('--> ... creating contextual Index ==> Table lookups ...');
	var tmpIdentifiers = {};
	for(var i = 0; i < pObject.Tables.length; i++)
	{
		for (var j = 0; j < pObject.Tables[i].Columns.length; j++)
		{
			if (pObject.Tables[i].Columns[j].DataType == "ID")
			{
				console.log('  > Adding the table '+pObject.Tables[i].TableName+' to the lookup cache with the key '+pObject.Tables[i].Columns[j].Column);
				tmpIdentifiers[pObject.Tables[i].Columns[j].Column] = pObject.Tables[i].TableName;
			}
		}
	}
	return tmpIdentifiers;
}


/***********
 * GraphViz and Dot generation
 *****/
function GenerateRelationshipGraph(pObject, pShowAllConnections)
{
	// If the user passes in true, we will show all connections
	var tmpShowAllConnections = (typeof(pShowAllConnections) === 'undefined') ? false : pShowAllConnections;

	var tmpDotFile = tmpFile+'.dot';

	console.log('--> Building the Relationships graph...');
	var tmpIdentifiers = GetIndexedTables(pObject);
	// Now build the connected graph
	console.log('--> ... building the connected graph DOT file ...');
	// This writes the header text to the file -- overwriting an old file if it's there already...
	console.log('  > Header');
	libFS.writeFileSync(tmpDotFile, '## Table Connection Graph -- Generated '+new Date().toJSON()+"\n");
	libFS.appendFileSync(tmpDotFile, 'digraph DataModel {'+"\n");
	libFS.appendFileSync(tmpDotFile, 'rankdir=LR'+"\n");
	console.log('  > Table Nodes');
	for(var i = 0; i < pObject.Tables.length; i++)
	{
		libFS.appendFileSync(tmpDotFile, pObject.Tables[i].TableName+';'+"\n");
	}
	console.log('  > Connections');
	for(var i = 0; i < pObject.Tables.length; i++)
	{
		for (var j = 0; j < pObject.Tables[i].Columns.length; j++)
		{
			if (pObject.Tables[i].Columns[j].Join != undefined)
			{
				// Only write the connection if:
				if (
						tmpShowAllConnections || // tmpShowAllConnections is true
						(
							(pObject.Tables[i].Columns[j].Column != 'CreatingIDUser') // OR the connection isn't from "CreatingIDUser", "UpdatingIDUser" or "DeletingIDUser"
							&& (pObject.Tables[i].Columns[j].Column != 'UpdatingIDUser')
							&& (pObject.Tables[i].Columns[j].Column != 'DeletingIDUser')
						)
					)
					libFS.appendFileSync(tmpDotFile, pObject.Tables[i].TableName+' -> '+tmpIdentifiers[pObject.Tables[i].Columns[j].Join]+"\n");
			}
		}
	}
	console.log('  > Closing');
	libFS.appendFileSync(tmpDotFile,'}');
	console.log('--> DOT generation complete!');

	BuildDOTImage(tmpDotFile);
}

// Build a DOT image from a DOT file
function BuildDOTImage(pFileDOTSource)
{
	if (tmpDot !== true)
	{
		console.log('--> Not automatically generating image');
		return;
	}

	var tmpImageFile = tmpFile+'.png';

	console.log('--> Beginning image generation to '+tmpImageFile+'...');
	console.log('dot -Tpng '+pFileDOTSource+' > '+tmpImageFile);
	libChildProcess.exec
	(
		'dot -Tpng '+pFileDOTSource+' > '+tmpImageFile,
		function(pError, pStdOut, pStdErr)
		{
			if (pStdErr)
				console.log('ERROR FROM DOT: '+pStdErr);
			console.log('  > Image generation complete');

			// Now try to load the image
			if (tmpLoadImage)
			{
				console.log('--> Loading image '+tmpImageFile+' in your OS.  Hopefully.');
				switch(tmpPlatform)
				{
					case 'windows':
						libChildProcess.exec(tmpImageFile);
						break;
					case 'mac':
						libChildProcess.exec('open '+tmpImageFile);
						break;
				}
			}
		}
	);
}