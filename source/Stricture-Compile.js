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

	console.info('--> Compiling MicroDDL to JSON');
	console.log('  > Input file:  '+pFable.settings.InputFileName)
	console.log('  > Output file: '+tmpJSONFile)
	var tmpLineReader = new libLineReader(pFable.settings.InputFileName);
	//libFS.appendFileSync(tmpJSONFile, "\n    );\n");
};

module.exports = CompileMicroDDL;
