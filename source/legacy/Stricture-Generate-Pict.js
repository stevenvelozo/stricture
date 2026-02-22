/**
* Stricture - Generator - Test Object Data File
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');

/***********
 * Test Object generation
 *****/
var GenerateTestObjects = function(pFable)
{
	// Use the output file as the prefix
	var tmpModelFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'-Stricture-PICT-Model.js';

	console.log('--> Building the PICT model RequireJS file');


	libFS.writeFileSync(tmpModelFile, "/* AUTO GENERATED STRICTURE PICT MODEL */\nif (typeof define !== 'function') { var define = require('amdefine')(module); }\ndefine(\n  function()\n  {\n    var tmpStricturePictModel = (\n");
	libFS.appendFileSync(tmpModelFile, JSON.stringify(pFable.Model.Pict,null,4));
	libFS.appendFileSync(tmpModelFile, "\n    );\n    return tmpStricturePictModel;\n  }\n);");
}

module.exports = GenerateTestObjects;
