/**
 * Stricture - Model Loader Service
 *
 * Loads a compiled Stricture JSON model file and builds lookup indices.
 * Replaces the legacy Stricture-Run-Prepare.js functionality.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');

const libFableServiceBase = require('fable').ServiceProviderBase;

/**
 * Service for loading compiled Stricture JSON model files.
 *
 * Reads a JSON model from disk, builds ID-column-to-table-name lookup indices,
 * and stores the model on `this.fable.AppData.Model` and `this.fable.AppData.ModelIndices`.
 */
class StrictureServiceModelLoader extends libFableServiceBase
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
		/** @type {string} */
		this.UUID;

		this.serviceType = 'StrictureModelLoader';
	}

	/**
	 * Generate a lookup object mapping identity column names to their table names.
	 *
	 * For each table in the model, finds the ID-type column and creates
	 * a mapping from that column name to the table name. This is used for
	 * resolving foreign key relationships.
	 *
	 * @param {Object} pModel - The Stricture model object containing a Tables hash
	 *
	 * @return {Object} A hash mapping ID column names to table names
	 */
	generateIndexedTables(pModel)
	{
		this.log.info('--> ... creating contextual Index ==> Table lookups ...');
		let tmpIndices = {};

		for (let tmpTable in pModel.Tables)
		{
			for (let j = 0; j < pModel.Tables[tmpTable].Columns.length; j++)
			{
				if (pModel.Tables[tmpTable].Columns[j].DataType === 'ID')
				{
					this.log.info(`  > Adding the table ${pModel.Tables[tmpTable].TableName} to the lookup cache with the key ${pModel.Tables[tmpTable].Columns[j].Column}`);
					tmpIndices[pModel.Tables[tmpTable].Columns[j].Column] = pModel.Tables[tmpTable].TableName;
				}
			}
		}

		this.log.info('  > indices built successfully.');
		return tmpIndices;
	}

	/**
	 * Load a compiled JSON model file from disk.
	 *
	 * Reads the JSON, builds index lookups, detects whether it is an extended model,
	 * and stores everything on `this.fable.AppData`:
	 *   - `this.fable.AppData.Model` - The parsed model object
	 *   - `this.fable.AppData.ModelIndices` - ID column to table name lookup
	 *   - `this.fable.AppData.ExtendedModel` - Boolean indicating if Authorization data is present
	 *
	 * @param {string} pFileName - Path to the JSON model file
	 * @param {function} fCallback - Callback invoked as fCallback(pError) on completion
	 */
	loadFromFile(pFileName, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};

		this.log.info(`--> Loading ${pFileName}`);

		let tmpModelRaw;
		try
		{
			tmpModelRaw = libFS.readFileSync(pFileName, 'utf8');
		}
		catch (pError)
		{
			this.log.error(`  > Error loading the input file "${pFileName}": ${pError.message}`);
			return tmpCallback(pError);
		}

		let tmpModel;
		try
		{
			tmpModel = JSON.parse(tmpModelRaw);
		}
		catch (pError)
		{
			this.log.error(`  > Error parsing JSON from file "${pFileName}": ${pError.message}`);
			return tmpCallback(pError);
		}

		if (tmpModel === null)
		{
			let tmpError = new Error(`Model file "${pFileName}" parsed to null.`);
			this.log.error(`  > ${tmpError.message}`);
			return tmpCallback(tmpError);
		}

		this.log.info('  > file loaded successfully.');

		// Store the model on AppData
		this.fable.AppData.Model = tmpModel;

		// Build the ID-to-table index
		this.fable.AppData.ModelIndices = this.generateIndexedTables(tmpModel);

		// Detect extended model (has Authorization data from the compiler)
		if (tmpModel.hasOwnProperty('Authorization'))
		{
			this.log.info('  > this is an extended model file!');
			this.fable.AppData.ExtendedModel = true;
		}
		else
		{
			this.log.info('  > this is NOT an extended model file!  Some commands will not work.');
			this.fable.AppData.ExtendedModel = false;
		}

		return tmpCallback(null);
	}
}

module.exports = StrictureServiceModelLoader;

/** @type {Record<string, any>} */
StrictureServiceModelLoader.default_configuration = {};
