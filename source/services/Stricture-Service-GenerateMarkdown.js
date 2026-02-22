/**
 * Stricture - Generator Service - Markdown Documentation
 *
 * Generates Markdown documentation files for the data model, including a
 * Dictionary.md table-of-contents, per-table Model-{Table}.md files, and a
 * ModelChangeTracking.md change-tracking summary.
 *
 * Replaces the legacy Stricture-Generate-Markdown.js functionality.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');

const libFableServiceBase = require('fable').ServiceProviderBase;

/**
 * Format a Date object as a human-readable Markdown timestamp.
 *
 * @param {Date} [pDate] - The date to format (defaults to now)
 * @returns {string} Formatted date string "YYYY-MM-DD at HH:MM"
 */
let formatMarkdownTime = function (pDate)
{
	let fPad = function (pPadding)
	{
		return ('' + pPadding).length < 2 ? '0' + pPadding : '' + pPadding;
	};

	if (typeof pDate === 'undefined')
	{
		pDate = new Date();
	}

	return pDate.getFullYear() + '-' + fPad(pDate.getMonth() + 1) + '-' + fPad(pDate.getDate()) + ' at ' + fPad(pDate.getHours()) + ':' + fPad(pDate.getMinutes());
};

/**
 * Service that generates Markdown documentation from the loaded model.
 */
class StrictureServiceGenerateMarkdown extends libFableServiceBase
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

		this.serviceType = 'StrictureGenerateMarkdown';
	}

	/**
	 * Generate Markdown documentation files from the model.
	 *
	 * Creates three types of Markdown files:
	 * - Dictionary.md: a table-of-contents listing every table and its column count
	 * - Model-{TableName}.md: per-table column definitions with types and joins
	 * - ModelChangeTracking.md: which tables have implicit create/update/delete tracking
	 *
	 * @param {Object} pOptions - Generation options
	 * @param {string} pOptions.OutputLocation - Directory for the output files
	 * @param {string} pOptions.OutputFileName - Base name for the output files (unused for Markdown)
	 * @param {function} fCallback - Callback invoked as fCallback(pError) on completion
	 */
	generate(pOptions, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpModel = this.fable.AppData.Model;
		let tmpModelIndices = this.fable.AppData.ModelIndices;

		if (!tmpModel || !tmpModel.Tables)
		{
			this.log.error('  > No model loaded; cannot generate Markdown documentation.');
			return tmpCallback(new Error('No model loaded'));
		}

		let tmpMarkdownFolder = pOptions.OutputLocation;
		let tmpTableFile = tmpMarkdownFolder + 'Dictionary.md';
		let tmpChangeTrackingFile = tmpMarkdownFolder + 'ModelChangeTracking.md';

		this.log.info('--> Building the markdown data model documentation...');

		// ---- Dictionary table of contents ----
		this.log.info('  > Tables of Contents');
		libFS.writeFileSync(tmpTableFile, '##### {DocumentationIndex|Home} > {Model/DataModel|Data Model} > {Model/Dictionary/Dictionary|Data Dictionary}' + '\n');
		libFS.appendFileSync(tmpTableFile, '\n');
		libFS.appendFileSync(tmpTableFile, 'Data Dictionary\n');
		libFS.appendFileSync(tmpTableFile, '=========================\n');
		libFS.appendFileSync(tmpTableFile, '\n');
		libFS.appendFileSync(tmpTableFile, 'Each entry below describes a single table in the database.\n');
		libFS.appendFileSync(tmpTableFile, '\n');
		libFS.appendFileSync(tmpTableFile, 'Table | Column Count \n');
		libFS.appendFileSync(tmpTableFile, '----- | -----------: \n');
		for (let tmpTable in tmpModel.Tables)
		{
			libFS.appendFileSync(tmpTableFile, '{Model/Dictionary/Model-' + tmpModel.Tables[tmpTable].TableName + '|' + tmpModel.Tables[tmpTable].TableName + '} | ' + tmpModel.Tables[tmpTable].Columns.length + '\n');
		}
		libFS.appendFileSync(tmpTableFile, '\n');
		libFS.appendFileSync(tmpTableFile, '- - -\n');
		libFS.appendFileSync(tmpTableFile, '\n');
		libFS.appendFileSync(tmpTableFile, 'Generated on ' + formatMarkdownTime() + '\n');

		// ---- Per-table model files ----
		this.log.info('  > Raw Tables');
		for (let tmpTable in tmpModel.Tables)
		{
			let tmpTableModelFile = tmpMarkdownFolder + 'Model-' + tmpModel.Tables[tmpTable].TableName + '.md';
			libFS.writeFileSync(tmpTableModelFile, '##### {DocumentationIndex|Home} > {Model/DataModel|Data Model} > {Model/Dictionary/Dictionary|Data Dictionary} > {Model/Dictionary/Model-' + tmpModel.Tables[tmpTable].TableName + '|' + tmpModel.Tables[tmpTable].TableName + ' Table}' + '\n');
			libFS.appendFileSync(tmpTableModelFile, '\n');
			libFS.appendFileSync(tmpTableModelFile, tmpModel.Tables[tmpTable].TableName + '\n');
			libFS.appendFileSync(tmpTableModelFile, '===\n');
			libFS.appendFileSync(tmpTableModelFile, '\n');
			libFS.appendFileSync(tmpTableModelFile, 'Column Name | Size | Data Type | Join \n');
			libFS.appendFileSync(tmpTableModelFile, '----------- | ---: | --------- | ---- \n');
			for (let j = 0; j < tmpModel.Tables[tmpTable].Columns.length; j++)
			{
				let tmpSize = (tmpModel.Tables[tmpTable].Columns[j].Size == undefined) ? '' : tmpModel.Tables[tmpTable].Columns[j].Size;
				let tmpJoin = (tmpModel.Tables[tmpTable].Columns[j].Join == undefined) ? '' : tmpModelIndices[tmpModel.Tables[tmpTable].Columns[j].Join] + '.' + tmpModel.Tables[tmpTable].Columns[j].Join;
				libFS.appendFileSync(tmpTableModelFile, tmpModel.Tables[tmpTable].Columns[j].Column + ' | ' + tmpSize + ' | ' + tmpModel.Tables[tmpTable].Columns[j].DataType + ' | ' + tmpJoin + ' \n');
			}
			libFS.appendFileSync(tmpTableModelFile, '- - -\n');
			libFS.appendFileSync(tmpTableModelFile, '\n');
			libFS.appendFileSync(tmpTableModelFile, 'Generated on ' + formatMarkdownTime() + '\n');
		}

		// ---- Change tracking summary ----
		this.log.info('  > Table Change Tracking');
		libFS.writeFileSync(tmpChangeTrackingFile, '##### {DocumentationIndex|Home} > {Model/DataModel|Data Model} > {Model/Dictionary/ModelChangeTracking|Table Change Tracking}' + '\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '\n');
		libFS.appendFileSync(tmpChangeTrackingFile, 'Table Change Tracking\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '=====================\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '\n');
		libFS.appendFileSync(tmpChangeTrackingFile, 'The following table describes which tables have implicit create, update and delete change tracking (provided by the meadow endpoints API architecture).  This does not include any kind of media archival or record longitudinal backups; just timestamps and user stamps for the last action of each type.\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '\n');
		libFS.appendFileSync(tmpChangeTrackingFile, 'Table | Create | Update | Delete \n');
		libFS.appendFileSync(tmpChangeTrackingFile, '----- | :----: | :----: | :----: \n');
		for (let tmpTable in tmpModel.Tables)
		{
			let tmpDelete = '';
			let tmpUpdate = '';
			let tmpCreate = '';

			for (let j = 0; j < tmpModel.Tables[tmpTable].Columns.length; j++)
			{
				switch (tmpModel.Tables[tmpTable].Columns[j].Column)
				{
					case 'UpdateDate':
						tmpUpdate = 'X';
						break;
					case 'Deleted':
						tmpDelete = 'X';
						break;
					case 'CreateDate':
						tmpCreate = 'X';
						break;
				}
			}
			libFS.appendFileSync(tmpChangeTrackingFile, tmpModel.Tables[tmpTable].TableName + ' | ' + tmpCreate + ' | ' + tmpUpdate + ' | ' + tmpDelete + ' \n');
		}
		libFS.appendFileSync(tmpChangeTrackingFile, '- - -\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '\n');
		libFS.appendFileSync(tmpChangeTrackingFile, 'Generated on ' + formatMarkdownTime() + '\n');

		return tmpCallback(null);
	}
}

module.exports = StrictureServiceGenerateMarkdown;

/** @type {Record<string, any>} */
StrictureServiceGenerateMarkdown.default_configuration = {};
