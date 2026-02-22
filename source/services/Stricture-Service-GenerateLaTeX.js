/**
 * Stricture - Generator Service - LaTeX Documentation
 *
 * Generates LaTeX documentation files from the data model, including a
 * Tables.tex file with tabularx column definitions and a ChangeTracking.tex
 * file summarising implicit create/update/delete tracking per table.
 *
 * Replaces the legacy Stricture-Generate-LaTeX.js functionality.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');

const libFableServiceBase = require('fable').ServiceProviderBase;

/**
 * Service that generates LaTeX documentation from the loaded model.
 */
class StrictureServiceGenerateLaTeX extends libFableServiceBase
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

		this.serviceType = 'StrictureGenerateLaTeX';
	}

	/**
	 * Generate LaTeX documentation files from the model.
	 *
	 * Produces two .tex files:
	 * - {OutputFileName}-Tables.tex: tabularx definitions for every table
	 * - {OutputFileName}-ChangeTracking.tex: a tabular showing which tables
	 *   have implicit create/update/delete tracking columns
	 *
	 * @param {Object} pOptions - Generation options
	 * @param {string} pOptions.OutputLocation - Directory for the output files
	 * @param {string} pOptions.OutputFileName - Base name for the output files
	 * @param {function} fCallback - Callback invoked as fCallback(pError) on completion
	 */
	generate(pOptions, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpModel = this.fable.AppData.Model;
		let tmpModelIndices = this.fable.AppData.ModelIndices;

		if (!tmpModel || !tmpModel.Tables)
		{
			this.log.error('  > No model loaded; cannot generate LaTeX documentation.');
			return tmpCallback(new Error('No model loaded'));
		}

		let tmpLaTeXFolder = pOptions.OutputLocation;
		let tmpTableFile = tmpLaTeXFolder + pOptions.OutputFileName + '-Tables.tex';
		let tmpChangeTrackingFile = tmpLaTeXFolder + pOptions.OutputFileName + '-ChangeTracking.tex';

		this.log.info('--> Building the data model file...');

		// ---- Table definitions ----
		this.log.info('  > Raw Tables');
		libFS.writeFileSync(tmpTableFile, '%% Data Model -- Generated ' + new Date().toJSON() + '\n');
		libFS.appendFileSync(tmpTableFile, '\\part{Table Definitions}\n');
		for (let tmpTable in tmpModel.Tables)
		{
			libFS.appendFileSync(tmpTableFile, '\n\\section{' + tmpModel.Tables[tmpTable].TableName + '}\n');
			if (tmpModel.Tables[tmpTable].hasOwnProperty('Description') && tmpModel.Tables[tmpTable].Description.length > 0)
			{
				libFS.appendFileSync(tmpTableFile, tmpModel.Tables[tmpTable].Description + '\n\\vspace{4mm}\n\n\\noindent\n');
			}
			libFS.appendFileSync(tmpTableFile, '\\begin{small}\n');
			libFS.appendFileSync(tmpTableFile, '\\begin{tabularx}{\\textwidth}{ l l l X }\n');
			libFS.appendFileSync(tmpTableFile, '\\textbf{Column Name} & \\textbf{Size} & \\textbf{Data Type} & \\textbf{Notes} \\\\ \\hline \n');
			for (let j = 0; j < tmpModel.Tables[tmpTable].Columns.length; j++)
			{
				let tmpSize = (tmpModel.Tables[tmpTable].Columns[j].Size == undefined) ? '' : tmpModel.Tables[tmpTable].Columns[j].Size;
				let tmpJoin = (tmpModel.Tables[tmpTable].Columns[j].Join == undefined) ? '' : 'Joined to ' + tmpModelIndices[tmpModel.Tables[tmpTable].Columns[j].Join] + '.' + tmpModel.Tables[tmpTable].Columns[j].Join;
				let tmpTableJoin = (!tmpModel.Tables[tmpTable].Columns[j].hasOwnProperty('TableJoin')) ? '' : 'Joins to ' + tmpModel.Tables[tmpTable].Columns[j].TableJoin;
				let tmpNotes = (!tmpModel.Tables[tmpTable].Columns[j].hasOwnProperty('Description')) ? '' : tmpModel.Tables[tmpTable].Columns[j].Description;

				let tmpDescription = tmpJoin;
				if (tmpJoin.length > 0)
				{
					tmpDescription += '\n';
				}
				tmpDescription += tmpTableJoin;
				if (tmpTableJoin.length > 0)
				{
					tmpDescription += '\n';
				}
				tmpDescription += tmpNotes;
				libFS.appendFileSync(tmpTableFile, tmpModel.Tables[tmpTable].Columns[j].Column + ' & ' + tmpSize + ' & ' + tmpModel.Tables[tmpTable].Columns[j].DataType + ' & ' + tmpDescription + ' \\\\ \n');
			}
			libFS.appendFileSync(tmpTableFile, '\\end{tabularx}\n');
			libFS.appendFileSync(tmpTableFile, '\\end{small}\n');
		}

		// ---- Change tracking ----
		this.log.info('  > Table Change Tracking');
		libFS.writeFileSync(tmpChangeTrackingFile, '%% Data Model -- Generated ' + new Date().toJSON() + '\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '\\part{Implicit Table Change Tracking}\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '\\begin{small}\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '\\begin{tabular}{ p{5cm} c c c }\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '\\textbf{Table} & \\textbf{Create} & \\textbf{Update} & \\textbf{Delete} \\\\ \\hline \n');
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
			libFS.appendFileSync(tmpChangeTrackingFile, tmpModel.Tables[tmpTable].TableName + ' & ' + tmpCreate + ' & ' + tmpUpdate + ' & ' + tmpDelete + ' \\\\ \n');
		}
		libFS.appendFileSync(tmpChangeTrackingFile, '\\end{tabular}\n');
		libFS.appendFileSync(tmpChangeTrackingFile, '\\end{small}\n');

		return tmpCallback(null);
	}
}

module.exports = StrictureServiceGenerateLaTeX;

/** @type {Record<string, any>} */
StrictureServiceGenerateLaTeX.default_configuration = {};
