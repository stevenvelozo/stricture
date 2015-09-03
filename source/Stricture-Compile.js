/**
* Stricture - Compiler from MicroDDL to JSON
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');
var libLineReader = require('line-by-line');

/***********
 * MicroDDL Compiler
 *
 *****/
 var CompileMicroDDL = function(pFable)
 {
	var tmpJSONFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'.json';

	var tmpTableCount = 0;
	var tmpPropertyCount = 0;

	console.info('--> Compiling MicroDDL to JSON');
	console.log('  > Input file:  '+pFable.settings.InputFileName)
	console.log('  > Output file: '+tmpJSONFile)

	libFS.appendFileSync(tmpJSONFile, "{\n\t[\n");

	// Parse the file line-by-line
	var tmpLineReader = new libLineReader(pFable.settings.InputFileName);

	tmpLineReader.on('error',
		function (pError)
		{
			console.error('>>> Error reading MicroDDL file.');
			console.log('  > '+pError);
		}
	);

	tmpLineReader.on('line',
		function (pLine)
		{
			tmpLineReader.pause();
			console.log('  > Line read: '+pLine);
			if (tmpPropertyCount > 0)
			{
				libFS.appendFileSync(tmpJSONFile, ',');
			}

			libFS.appendFileSync(tmpJSONFile, '\n\t\t"HullaBullshit": "'+pLine+'"');

			tmpPropertyCount++;

			tmpLineReader.resume();
		}
	);

	tmpLineReader.on('end',
		function ()
		{
			// All lines are read, file is closed now.
			libFS.appendFileSync(tmpJSONFile, "\n\t]\n}\n");
		}
	);
};

module.exports = CompileMicroDDL;
