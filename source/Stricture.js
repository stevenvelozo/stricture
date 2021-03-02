/**
* Stricture MicroDDL JSON Parser
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Processes the JSON Data Description into documentation and SQL statements
*/

var libMkdirp = require('mkdirp');

var Stricture = function(pSettings)
{
	var _Fable = require('fable').new(pSettings);

	// Merge in any default settings that haven't been passed in
	_Fable.settingsManager.fill(require('./Stricture-Options.js'));

	// Make sure the settings contain an input file
	if (_Fable.settings.InputFileName === null)
	{
		console.log('ERROR: You must provide at least an input filename for the DDL JSON file.');
		console.log('       For Example: node Stricture.js -i "BestDDLEvar.mddl"');
		process.exit(1);
	}

	// Check if the output folder exists, create it if it doesn't.
	libMkdirp(_Fable.settings.OutputLocation,
		function (pError)
		{
			if (pError)
			{
				console.log('ERROR: You must provide at least an input filename for the DDL JSON file.');
				console.log('       For Example: node Stricture.js -i "BestDDLEvar.mddl"');
				process.exit(1);
			}
			else
			{
				// Load the JSON, then run the command with the model passed in
				require('./Stricture-Run-Prepare.js')(_Fable, require('./Stricture-Run-ExecuteCommand.js'));
			}
		}
	);
};

module.exports = Stricture;
