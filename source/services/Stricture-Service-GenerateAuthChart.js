/**
 * Stricture - Generator Service - CSV Authorization Chart
 *
 * Generates a CSV authorization chart that maps roles and permissions to
 * every table in the model. Each role/permission combination produces a
 * column in the output, and each table produces a row with the authorizer
 * value (if defined) in each cell.
 *
 * Replaces the legacy Stricture-Generate-Authorization-Chart.js functionality.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');

const libFableServiceBase = require('fable').ServiceProviderBase;

/**
 * Service that generates a CSV authorization chart from the loaded model.
 */
class StrictureServiceGenerateAuthChart extends libFableServiceBase
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

		this.serviceType = 'StrictureGenerateAuthChart';
	}

	/**
	 * Generate a CSV authorization chart from the model.
	 *
	 * Scans every table's Authorization block to discover all roles and
	 * permissions, then produces a CSV with one row per table and one
	 * column per role+permission combination.
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
			this.log.error('  > No model loaded; cannot generate authorization chart.');
			return tmpCallback(new Error('No model loaded'));
		}

		if (!tmpModel.Authorization)
		{
			this.log.error('  > No authorization data in model; cannot generate authorization chart.');
			return tmpCallback(new Error('No authorization data in model'));
		}

		let tmpAuthorizorChartFile = pOptions.OutputLocation + pOptions.OutputFileName + '-Authorizors.csv';

		this.log.info('--> Building a cache of all Authorizors');

		// First pass: discover every role and its permissions across all tables
		let tmpAuthorizorCache = {};
		for (let tmpTable in tmpModel.Authorization)
		{
			for (let tmpRole in tmpModel.Authorization[tmpTable])
			{
				if (!tmpAuthorizorCache.hasOwnProperty(tmpRole))
				{
					tmpAuthorizorCache[tmpRole] = {};
				}

				for (let tmpPermission in tmpModel.Authorization[tmpTable][tmpRole])
				{
					if (!tmpAuthorizorCache[tmpRole].hasOwnProperty(tmpPermission))
					{
						tmpAuthorizorCache[tmpRole][tmpPermission] = true;
					}
				}
			}
		}

		// Build the CSV header
		let tmpCSVHead = 'Authorization for ' + pOptions.OutputFileName;
		libFS.writeFileSync(tmpAuthorizorChartFile, tmpCSVHead + '\n');

		let tmpCSVRoles = '';
		let tmpCurrentRole = '';
		let tmpCSVPermissions = '';
		for (let tmpRole in tmpAuthorizorCache)
		{
			tmpCSVRoles += ',' + tmpRole;
			for (let tmpPermission in tmpAuthorizorCache[tmpRole])
			{
				if (tmpCurrentRole !== tmpRole)
				{
					tmpCurrentRole = tmpRole;
				}
				else
				{
					tmpCSVRoles += ',';
				}
				tmpCSVPermissions += ',' + tmpPermission;
			}
		}
		libFS.appendFileSync(tmpAuthorizorChartFile, tmpCSVRoles + '\n');
		libFS.appendFileSync(tmpAuthorizorChartFile, tmpCSVPermissions + '\n');

		// Enumerate every table and fill in its authorization values
		let tmpCSVLine = false;
		for (let tmpTable in tmpModel.Authorization)
		{
			if (tmpCSVLine)
			{
				libFS.appendFileSync(tmpAuthorizorChartFile, tmpCSVLine + '\n');
			}
			tmpCSVLine = tmpTable;
			for (let tmpRole in tmpAuthorizorCache)
			{
				for (let tmpPermission in tmpAuthorizorCache[tmpRole])
				{
					tmpCSVLine += ',';
					if (tmpModel.Authorization[tmpTable][tmpRole].hasOwnProperty(tmpPermission))
					{
						tmpCSVLine += '"' + tmpModel.Authorization[tmpTable][tmpRole][tmpPermission] + '"';
					}
				}
			}
		}
		if (tmpCSVLine)
		{
			libFS.appendFileSync(tmpAuthorizorChartFile, tmpCSVLine + '\n');
		}

		return tmpCallback(null);
	}
}

module.exports = StrictureServiceGenerateAuthChart;

/** @type {Record<string, any>} */
StrictureServiceGenerateAuthChart.default_configuration = {};
