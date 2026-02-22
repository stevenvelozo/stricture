/**
 * Stricture - Generator Service - CSV Data Dictionary
 *
 * Generates a CSV data dictionary file listing every column in every table,
 * including data types, sizes, and join targets.
 *
 * Replaces the legacy Stricture-Generate-DictionaryCSV.js functionality.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');

const libFableServiceBase = require('fable').ServiceProviderBase;

/**
 * Service that generates a CSV data dictionary from the loaded model.
 */
class StrictureServiceGenerateDictionaryCSV extends libFableServiceBase
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

		this.serviceType = 'StrictureGenerateDictionaryCSV';
	}

	/**
	 * Generate a CSV data dictionary file from the model.
	 *
	 * Writes a single CSV file with columns: Table, Column Name, Size, Data Type, Join.
	 * Every column in every table is represented as one row.
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
		let tmpModelIndices = this.fable.AppData.ModelIndices;

		if (!tmpModel || !tmpModel.Tables)
		{
			this.log.error('  > No model loaded; cannot generate CSV data dictionary.');
			return tmpCallback(new Error('No model loaded'));
		}

		let tmpDictionaryFile = pOptions.OutputLocation + pOptions.OutputFileName + '-DataDictionary.csv';

		this.log.info('--> Building the csv data dictionary...');
		this.log.info('  > Tables of Contents');

		libFS.writeFileSync(tmpDictionaryFile, 'Table,Column Name,Size,Data Type,Join\n');

		this.log.info('  > Raw Tables');
		for (let tmpTable in tmpModel.Tables)
		{
			this.log.info('  >>>> ' + tmpModel.Tables[tmpTable].TableName);
			for (let j = 0; j < tmpModel.Tables[tmpTable].Columns.length; j++)
			{
				let tmpSize = (tmpModel.Tables[tmpTable].Columns[j].Size == undefined) ? '' : tmpModel.Tables[tmpTable].Columns[j].Size;
				let tmpJoin = (tmpModel.Tables[tmpTable].Columns[j].Join == undefined) ? '' : tmpModelIndices[tmpModel.Tables[tmpTable].Columns[j].Join] + '.' + tmpModel.Tables[tmpTable].Columns[j].Join;
				libFS.appendFileSync(tmpDictionaryFile, '"' + tmpModel.Tables[tmpTable].TableName + '","' + tmpModel.Tables[tmpTable].Columns[j].Column + '","' + tmpSize + '","' + tmpModel.Tables[tmpTable].Columns[j].DataType + '","' + tmpJoin + '"' + '\n');
			}
		}

		return tmpCallback(null);
	}
}

module.exports = StrictureServiceGenerateDictionaryCSV;

/** @type {Record<string, any>} */
StrictureServiceGenerateDictionaryCSV.default_configuration = {};
