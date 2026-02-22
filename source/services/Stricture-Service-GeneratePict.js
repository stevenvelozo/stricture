/**
 * Stricture - Generator Service - Pict Model
 *
 * Generates an AMD/RequireJS-compatible JavaScript file containing the Pict
 * model data extracted from the compiled Stricture model.
 *
 * Replaces the legacy Stricture-Generate-Pict.js functionality.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');

const libFableServiceBase = require('fable').ServiceProviderBase;

/**
 * Service that generates the AMD/RequireJS Pict model file from the loaded model.
 */
class StrictureServiceGeneratePict extends libFableServiceBase
{
	/**
	 * @param {Object} pFable - The Fable Framework instance
	 * @param {Object} pOptions - The options for the service
	 * @param {String} pServiceHash - The hash of the service
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {any} */
		this.log;

		this.serviceType = 'StrictureGeneratePict';
	}

	/**
	 * Generate the AMD/RequireJS Pict model JavaScript file.
	 *
	 * Writes a single .js file wrapping the model's Pict data in an AMD
	 * define() call, with an amdefine fallback for Node.js consumption.
	 *
	 * @param {Object} pOptions - Generation options
	 * @param {string} pOptions.OutputLocation - Directory for the output file
	 * @param {string} pOptions.OutputFileName - Base name for the output file
	 * @param {function} fCallback - Callback invoked as fCallback(pError) on completion
	 */
	generate(pOptions, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpModel = this.fable.AppData.Model;

		if (!tmpModel || !tmpModel.Tables)
		{
			this.log.error('  > No model loaded; cannot generate Pict model.');
			return tmpCallback(new Error('No model loaded'));
		}

		if (!tmpModel.Pict)
		{
			this.log.error('  > No Pict data in model; cannot generate Pict model file.');
			return tmpCallback(new Error('No Pict data in model'));
		}

		let tmpModelFile = pOptions.OutputLocation + pOptions.OutputFileName + '-Stricture-PICT-Model.js';

		this.log.info('--> Building the PICT model RequireJS file');

		libFS.writeFileSync(tmpModelFile, "/* AUTO GENERATED STRICTURE PICT MODEL */\nif (typeof define !== 'function') { var define = require('amdefine')(module); }\ndefine(\n  function()\n  {\n    var tmpStricturePictModel = (\n");
		libFS.appendFileSync(tmpModelFile, JSON.stringify(tmpModel.Pict, null, 4));
		libFS.appendFileSync(tmpModelFile, '\n    );\n    return tmpStricturePictModel;\n  }\n);');

		return tmpCallback(null);
	}
}

module.exports = StrictureServiceGeneratePict;

/** @type {Record<string, any>} */
StrictureServiceGeneratePict.default_configuration = {};
