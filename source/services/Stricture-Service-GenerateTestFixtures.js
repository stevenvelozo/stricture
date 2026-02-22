/**
 * Stricture - Generator Service - Test Fixture Files
 *
 * Generates per-table JSON fixture files, each containing 25 sample objects
 * with type-appropriate default values. GUID columns are populated with
 * unique identifiers via fable.getUUID().
 *
 * Replaces the legacy Stricture-Generate-TestObjectContainers.js functionality.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');

const libFableServiceBase = require('fable').ServiceProviderBase;

/**
 * Service that generates per-table test fixture JSON files from the loaded model.
 */
class StrictureServiceGenerateTestFixtures extends libFableServiceBase
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

		this.serviceType = 'StrictureGenerateTestFixtures';
	}

	/**
	 * Generate test fixture JSON files for each table in the model.
	 *
	 * For each table, builds a default object based on column data types,
	 * then produces 25 copies with incrementing primary keys and unique
	 * GUIDs, writing them to a JSON file named after the table.
	 *
	 * @param {Object} pOptions - Generation options
	 * @param {string} pOptions.OutputLocation - Directory for the output files
	 * @param {string} pOptions.OutputFileName - Base prefix for the output files
	 * @param {function} fCallback - Callback invoked as fCallback(pError) on completion
	 */
	generate(pOptions, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpModel = this.fable.AppData.Model;

		if (!tmpModel || !tmpModel.Tables)
		{
			this.log.error('  > No model loaded; cannot generate test fixtures.');
			return tmpCallback(new Error('No model loaded'));
		}

		let tmpTestObjectFileLocation = pOptions.OutputLocation + pOptions.OutputFileName;

		this.log.info('--> Building the test fixture object container files...');

		let tmpTableKeys = Object.keys(tmpModel.Tables);
		let tmpIndex = 0;
		let tmpSelf = this;

		// Process tables sequentially to avoid overwhelming file I/O
		let processNextTable = () =>
		{
			if (tmpIndex >= tmpTableKeys.length)
			{
				return tmpCallback(null);
			}

			let tmpTableKey = tmpTableKeys[tmpIndex];
			tmpIndex++;

			let tmpTable = tmpModel.Tables[tmpTableKey];

			tmpSelf.log.info('  > Table: ' + tmpTable.TableName);

			let tmpPrimaryKey = 'ID' + tmpTable.TableName;

			// Find the primary key column
			for (let j = 0; j < tmpTable.Columns.length; j++)
			{
				if (tmpTable.Columns[j].DataType === 'ID')
				{
					tmpPrimaryKey = tmpTable.Columns[j].Column;
				}
			}

			let tmpDefaultTestObject = {};
			let tmpGUIDList = [];

			// Build the default object template based on column data types
			for (let j = 0; j < tmpTable.Columns.length; j++)
			{
				let tmpColumnName = tmpTable.Columns[j].Column;
				let tmpColumnType = tmpTable.Columns[j].DataType;

				switch (tmpColumnType)
				{
					case 'ID':
						tmpDefaultTestObject[tmpColumnName] = 0;
						break;
					case 'GUID':
						tmpGUIDList.push(tmpColumnName);
						tmpDefaultTestObject[tmpColumnName] = '0x000000000000';
						break;
					case 'ForeignKey':
						tmpDefaultTestObject[tmpColumnName] = 0;
						break;
					case 'Numeric':
						tmpDefaultTestObject[tmpColumnName] = 0;
						break;
					case 'Decimal':
						tmpDefaultTestObject[tmpColumnName] = 0.0;
						break;
					case 'String':
					case 'Text':
						tmpDefaultTestObject[tmpColumnName] = '';
						break;
					case 'DateTime':
						tmpDefaultTestObject[tmpColumnName] = null;
						break;
					case 'Boolean':
						tmpDefaultTestObject[tmpColumnName] = false;
						break;
				}
			}

			// Generate 25 test objects per table
			let tmpTestObjects = [];
			for (let k = 0; k < 25; k++)
			{
				let tmpTestObject = Object.assign({}, tmpDefaultTestObject);
				tmpTestObject[tmpPrimaryKey] = k;
				for (let l = 0; l < tmpGUIDList.length; l++)
				{
					tmpTestObject[tmpGUIDList[l]] = tmpSelf.fable.getUUID();
				}
				tmpTestObjects.push(tmpTestObject);
			}

			// Persist the test object array
			libFS.writeFile(tmpTestObjectFileLocation + tmpTable.TableName + '.json', JSON.stringify(tmpTestObjects, null, 4), 'utf8',
				(pError) =>
				{
					if (pError)
					{
						tmpSelf.log.error('#### ERROR PERSISTING TEST OBJECTS: ' + pError);
					}
					processNextTable();
				});
		};

		processNextTable();
	}
}

module.exports = StrictureServiceGenerateTestFixtures;

/** @type {Record<string, any>} */
StrictureServiceGenerateTestFixtures.default_configuration = {};
