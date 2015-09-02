/**
* Stricture - Generator - Relationship Graph generation
*
* NOTE: This package requires the graphviz dot compiler to be useful.
*       It is in brew on OS/x, apt-get on ubuntu or chocolatey on windows.
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');
var libChildProcess = require("child_process");

/***********
 * Graphviz Dot compilation to image
 *****/
var BuildDOTImage = function(pFable)
{
	if (pFable.settings.AutomaticallyCompile !== true)
	{
		console.log('--> Not automatically generating image');
		return;
	}

	pFable.ImageFileName = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'.png';

	console.info('--> Beginning image generation to '+pFable.ImageFileName+'...');
	console.log('  > command: dot -Tpng '+pFable.DotFileName+' > '+pFable.ImageFileName);
	libChildProcess.exec
	(
		'dot -Tpng '+pFable.DotFileName+' > '+pFable.ImageFileName,
		function(pError, pStdOut, pStdErr)
		{
			console.time('>>> Image Generation');
			if (pStdErr)
				console.log('ERROR FROM DOT: '+pStdErr);
			console.log('  > Image generation complete');

			// Now try to load the image
			if (pFable.settings.AutomaticallyLoad)
			{
				console.log('--> Loading image '+pFable.ImageFileName+' in your OS.  Hopefully.');
				switch(pFable.settings.Platform)
				{
					case 'windows':
						libChildProcess.exec(pFable.ImageFileName);
						break;
					case 'mac':
						libChildProcess.exec('open '+pFable.ImageFileName);
						break;
				}
			}
			console.timeEnd('>>> Image Generation');
		}
	);
};

/***********
 * GraphViz Relationship Graph generation
 *****/
var GenerateRelationshipGraph = function(pFable)
{
	// If the user passes in true, we will show all connections
	pFable.DotFileName = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'.dot';

	console.info('--> Building the Relationships graph...');
	// Now build the connected graph
	console.log('--> ... building the connected graph DOT file ...');
	// This writes the header text to the file -- overwriting an old file if it's there already...
	console.log('  > Header');
	libFS.writeFileSync(pFable.DotFileName, '## Table Connection Graph -- Generated '+new Date().toJSON()+"\n");
	libFS.appendFileSync(pFable.DotFileName, 'digraph DataModel {'+"\n");
	libFS.appendFileSync(pFable.DotFileName, 'rankdir=LR'+"\n");
	console.log('  > Table Nodes');
	for(var i = 0; i < pFable.Model.Tables.length; i++)
	{
		libFS.appendFileSync(pFable.DotFileName, pFable.Model.Tables[i].TableName+';'+"\n");
	}
	console.log('  > Connections');
	for(var i = 0; i < pFable.Model.Tables.length; i++)
	{
		for (var j = 0; j < pFable.Model.Tables[i].Columns.length; j++)
		{
			if (pFable.Model.Tables[i].Columns[j].Join != undefined)
			{
				// Only write the connection if:
				if (
						pFable.settings.GraphFullJoins || // The user wants to show all joins
						(
							(pFable.Model.Tables[i].Columns[j].Column != 'CreatingIDUser') // OR the connection isn't from "CreatingIDUser", "UpdatingIDUser" or "DeletingIDUser"
							&& (pFable.Model.Tables[i].Columns[j].Column != 'UpdatingIDUser')
							&& (pFable.Model.Tables[i].Columns[j].Column != 'DeletingIDUser')
						)
					)
					libFS.appendFileSync(pFable.DotFileName, pFable.Model.Tables[i].TableName+' -> '+pFable.ModelIndices[pFable.Model.Tables[i].Columns[j].Join]+"\n");
			}
		}
	}
	console.log('  > Closing');
	libFS.appendFileSync(pFable.DotFileName,'}');
	console.log('--> DOT generation complete!');

	BuildDOTImage(pFable);
};

console.log('Loaded graph generation file')

module.exports = GenerateRelationshipGraph;