/**
 * Stricture - Generator Service - Model Relationship Graph
 *
 * Generates a GraphViz DOT file describing the relationships between tables
 * in the model. Optionally compiles the DOT file to a PNG image using the
 * system-installed `dot` command.
 *
 * NOTE: PNG compilation requires the graphviz `dot` compiler to be installed.
 *       It is available via brew on macOS, apt-get on Ubuntu, or chocolatey
 *       on Windows.
 *
 * Replaces the legacy Stricture-Generate-ModelGraph.js functionality.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');
const libChildProcess = require('child_process');

const libFableServiceBase = require('fable').ServiceProviderBase;

/**
 * Service that generates a GraphViz relationship graph from the loaded model.
 */
class StrictureServiceGenerateModelGraph extends libFableServiceBase
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

		this.serviceType = 'StrictureGenerateModelGraph';
	}

	/**
	 * Compile a DOT file into a PNG image using the graphviz `dot` command.
	 *
	 * @param {string} pDotFileName - Path to the .dot source file
	 * @param {string} pImageFileName - Path for the output .png file
	 * @param {function} fCallback - Callback invoked as fCallback(pError) on completion
	 */
	compileDOTImage(pDotFileName, pImageFileName, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};

		this.log.info('--> Beginning image generation to ' + pImageFileName + '...');
		this.log.info('  > command: dot -Tpng ' + pDotFileName + ' > ' + pImageFileName);

		libChildProcess.exec(
			'dot -Tpng ' + pDotFileName + ' > ' + pImageFileName,
			(pError, pStdOut, pStdErr) =>
			{
				if (pStdErr)
				{
					this.log.error('ERROR FROM DOT: ' + pStdErr);
				}
				if (pError)
				{
					this.log.error('  > DOT compilation failed: ' + pError);
					return tmpCallback(pError);
				}
				this.log.info('  > Image generation complete');
				return tmpCallback(null);
			}
		);
	}

	/**
	 * Generate a GraphViz DOT relationship graph from the model.
	 *
	 * Produces a .dot file with directed edges representing foreign key
	 * relationships. When AutomaticallyCompile is set in pOptions, also
	 * invokes the `dot` command to render the graph as a PNG image.
	 *
	 * By default, connections from the standard change-tracking columns
	 * (CreatingIDUser, UpdatingIDUser, DeletingIDUser) are excluded to
	 * reduce clutter. Set GraphFullJoins to true to include them.
	 *
	 * @param {Object} pOptions - Generation options
	 * @param {string} pOptions.OutputLocation - Directory for the output files
	 * @param {string} pOptions.OutputFileName - Base name for the output files
	 * @param {boolean} [pOptions.GraphFullJoins] - Whether to include change-tracking joins
	 * @param {boolean} [pOptions.AutomaticallyCompile] - Whether to compile DOT to PNG
	 * @param {function} fCallback - Callback invoked as fCallback(pError) on completion
	 */
	generate(pOptions, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpModel = this.fable.AppData.Model;
		let tmpModelIndices = this.fable.AppData.ModelIndices;

		if (!tmpModel || !tmpModel.Tables)
		{
			this.log.error('  > No model loaded; cannot generate model graph.');
			return tmpCallback(new Error('No model loaded'));
		}

		let tmpJoinCache = {};
		let tmpGraphFullJoins = (pOptions.GraphFullJoins === true);
		let tmpDotFileName = pOptions.OutputLocation + pOptions.OutputFileName + '.dot';

		this.log.info('--> Building the Relationships graph...');
		this.log.info('--> ... building the connected graph DOT file ...');

		// ---- Header ----
		this.log.info('  > Header');
		libFS.writeFileSync(tmpDotFileName, '## Table Connection Graph -- Generated ' + new Date().toJSON() + '\n');
		libFS.appendFileSync(tmpDotFileName, 'digraph DataModel {\n');
		libFS.appendFileSync(tmpDotFileName, 'rankdir=LR\n');

		// ---- Table nodes ----
		this.log.info('  > Table Nodes');
		for (let tmpTable in tmpModel.Tables)
		{
			libFS.appendFileSync(tmpDotFileName, tmpModel.Tables[tmpTable].TableName + ';\n');
		}

		// ---- Connections ----
		this.log.info('  > Connections');
		for (let tmpTable in tmpModel.Tables)
		{
			for (let j = 0; j < tmpModel.Tables[tmpTable].Columns.length; j++)
			{
				if (tmpModel.Tables[tmpTable].Columns[j].Join != undefined)
				{
					// Only write the connection if:
					// - The user wants all joins (GraphFullJoins), OR
					// - The column is not a standard change-tracking user column
					if (
						tmpGraphFullJoins ||
						(
							(tmpModel.Tables[tmpTable].Columns[j].Column != 'CreatingIDUser')
							&& (tmpModel.Tables[tmpTable].Columns[j].Column != 'UpdatingIDUser')
							&& (tmpModel.Tables[tmpTable].Columns[j].Column != 'DeletingIDUser')
						)
					)
					{
						libFS.appendFileSync(tmpDotFileName, tmpModel.Tables[tmpTable].TableName + ' -> ' + tmpModelIndices[tmpModel.Tables[tmpTable].Columns[j].Join] + '\n');
					}
				}
				if (tmpModel.Tables[tmpTable].Columns[j].TableJoin != undefined)
				{
					let tmpJoin = tmpModel.Tables[tmpTable].TableName + ' -> ' + tmpModel.Tables[tmpTable].Columns[j].TableJoin;
					// Ensure joins only happen once
					if (!tmpJoinCache.hasOwnProperty(tmpJoin))
					{
						tmpJoinCache[tmpJoin] = true;
						libFS.appendFileSync(tmpDotFileName, tmpJoin + '\n');
					}
				}
			}
		}

		// ---- Closing ----
		this.log.info('  > Closing');
		libFS.appendFileSync(tmpDotFileName, '}');
		this.log.info('--> DOT generation complete!');

		// Optionally compile the DOT file into a PNG image
		if (pOptions.AutomaticallyCompile === true)
		{
			let tmpImageFileName = pOptions.OutputLocation + pOptions.OutputFileName + '.png';
			return this.compileDOTImage(tmpDotFileName, tmpImageFileName, tmpCallback);
		}

		return tmpCallback(null);
	}
}

module.exports = StrictureServiceGenerateModelGraph;

/** @type {Record<string, any>} */
StrictureServiceGenerateModelGraph.default_configuration = {};
