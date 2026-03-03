/**
 * Stricture - CompareDDL Service
 *
 * Runs both the legacy and new MicroDDL compilers against the same input,
 * generates MySQL DDL from each compiled model, and produces a comparison
 * report detailing any differences.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libFS = require('fs');
const libMkdirp = require('mkdirp');

const libFableServiceBase = require('fable').ServiceProviderBase;

// Legacy compiler (monolithic function-based approach)
const legacyCompileMicroDDL = require('../Stricture-Compile.js');
// Legacy MySQL generator
const legacyGenerateMySQL = require('../Stricture-Generate-MySQL.js');

class StrictureServiceCompareDDL extends libFableServiceBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {any} */
		this.log;

		this.serviceType = 'StrictureCompareDDL';
	}

	/**
	 * Deep-compare two values recursively, collecting differences.
	 *
	 * @param {*} pLegacy - Value from the legacy compiler output
	 * @param {*} pNew - Value from the new compiler output
	 * @param {string} pPath - Dot-notation path for reporting
	 * @param {Array} pDifferences - Array to push difference records into
	 * @param {Object} pOptions - Comparison options
	 * @param {Array} [pOptions.SkipKeys] - Keys to skip during comparison
	 */
	deepCompare(pLegacy, pNew, pPath, pDifferences, pOptions)
	{
		let tmpSkipKeys = (pOptions && pOptions.SkipKeys) ? pOptions.SkipKeys : [];

		// Handle null/undefined
		if (pLegacy === pNew)
		{
			return;
		}
		if (pLegacy === null || pLegacy === undefined || pNew === null || pNew === undefined)
		{
			pDifferences.push({ Path: pPath, Legacy: pLegacy, New: pNew });
			return;
		}

		// Different types
		if (typeof pLegacy !== typeof pNew)
		{
			pDifferences.push({ Path: pPath, Legacy: pLegacy, New: pNew });
			return;
		}

		// Arrays
		if (Array.isArray(pLegacy) && Array.isArray(pNew))
		{
			let tmpMaxLen = Math.max(pLegacy.length, pNew.length);
			if (pLegacy.length !== pNew.length)
			{
				pDifferences.push({ Path: pPath + '.length', Legacy: pLegacy.length, New: pNew.length });
			}
			for (let i = 0; i < tmpMaxLen; i++)
			{
				this.deepCompare(
					i < pLegacy.length ? pLegacy[i] : undefined,
					i < pNew.length ? pNew[i] : undefined,
					pPath + '[' + i + ']',
					pDifferences,
					pOptions
				);
			}
			return;
		}

		// Objects
		if (typeof pLegacy === 'object' && typeof pNew === 'object')
		{
			let tmpAllKeys = new Set([...Object.keys(pLegacy), ...Object.keys(pNew)]);
			for (let tmpKey of tmpAllKeys)
			{
				if (tmpSkipKeys.indexOf(tmpKey) >= 0)
				{
					continue;
				}
				this.deepCompare(
					pLegacy[tmpKey],
					pNew[tmpKey],
					pPath + '.' + tmpKey,
					pDifferences,
					pOptions
				);
			}
			return;
		}

		// Primitives
		if (pLegacy !== pNew)
		{
			pDifferences.push({ Path: pPath, Legacy: pLegacy, New: pNew });
		}
	}

	/**
	 * Compare two MySQL DDL files line by line, skipping the timestamp header.
	 *
	 * @param {string} pLegacyDDL - Contents of the legacy DDL file
	 * @param {string} pNewDDL - Contents of the new DDL file
	 * @return {Array} Array of { Line, Legacy, New } difference records
	 */
	compareDDLText(pLegacyDDL, pNewDDL)
	{
		let tmpLegacyLines = pLegacyDDL.split('\n');
		let tmpNewLines = pNewDDL.split('\n');
		let tmpDifferences = [];

		// Skip line 0 (timestamp header) — it will always differ
		let tmpMaxLen = Math.max(tmpLegacyLines.length, tmpNewLines.length);
		for (let i = 1; i < tmpMaxLen; i++)
		{
			let tmpLegacyLine = (i < tmpLegacyLines.length) ? tmpLegacyLines[i] : '<missing>';
			let tmpNewLine = (i < tmpNewLines.length) ? tmpNewLines[i] : '<missing>';
			if (tmpLegacyLine !== tmpNewLine)
			{
				tmpDifferences.push({ Line: i + 1, Legacy: tmpLegacyLine, New: tmpNewLine });
			}
		}
		return tmpDifferences;
	}

	/**
	 * Build the text comparison report.
	 *
	 * @param {Object} pResults - The collected comparison results
	 * @param {string} pResults.InputFile - Path to the input .mddl file
	 * @param {Object} pResults.LegacyModel - The legacy compiled base model
	 * @param {Object} pResults.NewModel - The new compiled base model
	 * @param {Array} pResults.ModelDifferences - Deep comparison differences for the base model
	 * @param {Array} pResults.ExtendedDifferences - Deep comparison differences for the extended model
	 * @param {Array} pResults.DDLDifferences - Line-by-line DDL differences
	 * @return {string} The formatted report text
	 */
	buildReport(pResults)
	{
		let tmpReport = [];

		tmpReport.push('=== Stricture DDL Comparison Report ===');
		tmpReport.push('Generated: ' + new Date().toJSON());
		tmpReport.push('Input: ' + pResults.InputFile);
		tmpReport.push('');

		// --- Compiled Model Comparison ---
		tmpReport.push('--- Compiled Model Comparison (Base) ---');

		let tmpLegacyTableNames = pResults.LegacyModel ? Object.keys(pResults.LegacyModel.Tables || {}) : [];
		let tmpNewTableNames = pResults.NewModel ? Object.keys(pResults.NewModel.Tables || {}) : [];
		tmpReport.push('Tables in Legacy: ' + tmpLegacyTableNames.length);
		tmpReport.push('Tables in New:    ' + tmpNewTableNames.length);
		tmpReport.push('');

		// Per-table summary
		let tmpAllTableNames = new Set([...tmpLegacyTableNames, ...tmpNewTableNames]);
		for (let tmpTableName of tmpAllTableNames)
		{
			let tmpLegacyTable = (pResults.LegacyModel && pResults.LegacyModel.Tables) ? pResults.LegacyModel.Tables[tmpTableName] : null;
			let tmpNewTable = (pResults.NewModel && pResults.NewModel.Tables) ? pResults.NewModel.Tables[tmpTableName] : null;

			if (!tmpLegacyTable)
			{
				tmpReport.push('Table: ' + tmpTableName);
				tmpReport.push('  [NEW ONLY] Table exists only in new compiler output.');
				tmpReport.push('');
				continue;
			}
			if (!tmpNewTable)
			{
				tmpReport.push('Table: ' + tmpTableName);
				tmpReport.push('  [LEGACY ONLY] Table exists only in legacy compiler output.');
				tmpReport.push('');
				continue;
			}

			let tmpLegacyCols = tmpLegacyTable.Columns ? tmpLegacyTable.Columns.length : 0;
			let tmpNewCols = tmpNewTable.Columns ? tmpNewTable.Columns.length : 0;
			tmpReport.push('Table: ' + tmpTableName);
			tmpReport.push('  Columns (Legacy: ' + tmpLegacyCols + ', New: ' + tmpNewCols + ')');

			// Find differences specific to this table
			let tmpTableDiffs = pResults.ModelDifferences.filter(
				(pDiff) => { return pDiff.Path.indexOf('Tables.' + tmpTableName + '.') === 0; });
			if (tmpTableDiffs.length === 0)
			{
				tmpReport.push('  [MATCH]');
			}
			else
			{
				for (let k = 0; k < tmpTableDiffs.length; k++)
				{
					let tmpDiff = tmpTableDiffs[k];
					// Shorten the path for readability
					let tmpShortPath = tmpDiff.Path.replace('Tables.' + tmpTableName + '.', '');
					tmpReport.push('  [DIFF] ' + tmpShortPath + '  Legacy: ' + JSON.stringify(tmpDiff.Legacy) + '  New: ' + JSON.stringify(tmpDiff.New));
				}
			}
			tmpReport.push('');
		}

		// --- Extended Model Comparison ---
		tmpReport.push('--- Extended Model Comparison ---');
		let tmpExtNonTableDiffs = pResults.ExtendedDifferences.filter(
			(pDiff) => { return pDiff.Path.indexOf('Tables.') !== 0; });
		if (tmpExtNonTableDiffs.length === 0)
		{
			tmpReport.push('[MATCH] Authorization, Endpoints, and Pict sections are identical.');
		}
		else
		{
			tmpReport.push(tmpExtNonTableDiffs.length + ' difference(s) found outside Tables:');
			for (let k = 0; k < tmpExtNonTableDiffs.length; k++)
			{
				let tmpDiff = tmpExtNonTableDiffs[k];
				tmpReport.push('  [DIFF] ' + tmpDiff.Path + '  Legacy: ' + JSON.stringify(tmpDiff.Legacy) + '  New: ' + JSON.stringify(tmpDiff.New));
			}
		}
		tmpReport.push('');

		// --- MySQL DDL Comparison ---
		tmpReport.push('--- MySQL DDL Comparison ---');
		if (pResults.DDLDifferences.length === 0)
		{
			tmpReport.push('[MATCH] DDL output is identical (excluding timestamps).');
		}
		else
		{
			tmpReport.push(pResults.DDLDifferences.length + ' line(s) differ:');
			for (let k = 0; k < pResults.DDLDifferences.length; k++)
			{
				let tmpDiff = pResults.DDLDifferences[k];
				tmpReport.push('  Line ' + tmpDiff.Line + ':');
				tmpReport.push('    Legacy: ' + tmpDiff.Legacy);
				tmpReport.push('    New:    ' + tmpDiff.New);
			}
		}
		tmpReport.push('');

		// --- Summary ---
		tmpReport.push('--- Summary ---');
		tmpReport.push('Base Model Differences:     ' + pResults.ModelDifferences.length);
		tmpReport.push('Extended Model Differences:  ' + pResults.ExtendedDifferences.length);
		tmpReport.push('DDL Line Differences:        ' + pResults.DDLDifferences.length);

		let tmpTotalDiffs = pResults.ModelDifferences.length + pResults.ExtendedDifferences.length + pResults.DDLDifferences.length;
		if (tmpTotalDiffs === 0)
		{
			tmpReport.push('');
			tmpReport.push('RESULT: Legacy and new compilers produce identical output.');
		}
		else
		{
			tmpReport.push('');
			tmpReport.push('RESULT: ' + tmpTotalDiffs + ' total difference(s) found between legacy and new compiler output.');
		}

		return tmpReport.join('\n');
	}

	/**
	 * Run the full comparison pipeline.
	 *
	 * @param {string} pInputFile - Path to the input .mddl file
	 * @param {string} pOutputLocation - Base output directory
	 * @param {string} pOutputFileName - Output file prefix (e.g. 'MeadowModel')
	 * @param {function} fCallback - Callback invoked as fCallback(pError)
	 */
	compare(pInputFile, pOutputLocation, pOutputFileName, fCallback)
	{
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => {};
		let tmpSelf = this;

		let tmpNewOutputLocation = pOutputLocation + 'new/';
		let tmpLegacyOutputLocation = pOutputLocation + 'legacy/';

		libMkdirp.sync(tmpNewOutputLocation);
		libMkdirp.sync(tmpLegacyOutputLocation);

		let tmpResults =
		{
			InputFile: pInputFile,
			LegacyModel: null,
			NewModel: null,
			ModelDifferences: [],
			ExtendedDifferences: [],
			DDLDifferences: []
		};

		let tmpAnticipate = tmpSelf.fable.instantiateServiceProviderWithoutRegistration('Anticipate');

		// Stage 1: Compile with the new compiler
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				tmpSelf.log.info('--> [CompareDDL] Compiling with NEW compiler...');
				let tmpCompiler = tmpSelf.fable.instantiateServiceProvider('StrictureCompiler');
				tmpCompiler.compileFile(pInputFile, tmpNewOutputLocation, pOutputFileName, fStageComplete);
			});

		// Stage 2: Compile with the legacy compiler
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				tmpSelf.log.info('--> [CompareDDL] Compiling with LEGACY compiler...');
				// Build an adapter object matching the legacy compiler's expected interface
				let tmpLegacyFable =
				{
					settings:
					{
						InputFileName: pInputFile,
						OutputLocation: tmpLegacyOutputLocation,
						OutputFileName: pOutputFileName
					},
					Stricture: null,
					log: tmpSelf.log
				};
				legacyCompileMicroDDL(tmpLegacyFable, fStageComplete);
			});

		// Stage 3: Generate MySQL DDL from the new model
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				tmpSelf.log.info('--> [CompareDDL] Generating MySQL DDL from NEW model...');
				let tmpLoader = tmpSelf.fable.instantiateServiceProviderWithoutRegistration('StrictureModelLoader');
				let tmpExtendedFile = tmpNewOutputLocation + pOutputFileName + '-Extended.json';
				tmpLoader.loadFromFile(tmpExtendedFile,
					(pError) =>
					{
						if (pError)
						{
							return fStageComplete(pError);
						}
						let tmpGenerator = tmpSelf.fable.instantiateServiceProviderWithoutRegistration('StrictureGenerateMySQL');
						tmpGenerator.generate(
						{
							OutputLocation: tmpNewOutputLocation,
							OutputFileName: pOutputFileName
						}, fStageComplete);
					});
			});

		// Stage 4: Generate MySQL DDL from the legacy model
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				tmpSelf.log.info('--> [CompareDDL] Generating MySQL DDL from LEGACY model...');
				// The legacy MySQL generator reads from pFable.Model.Tables
				// Load the legacy-compiled extended model and set it on a fable-like adapter
				let tmpLegacyExtendedFile = tmpLegacyOutputLocation + pOutputFileName + '-Extended.json';
				try
				{
					let tmpLegacyExtended = JSON.parse(libFS.readFileSync(tmpLegacyExtendedFile, 'utf8'));
					let tmpLegacyAdapter =
					{
						settings:
						{
							OutputLocation: tmpLegacyOutputLocation,
							OutputFileName: pOutputFileName
						},
						Model: tmpLegacyExtended
					};
					legacyGenerateMySQL(tmpLegacyAdapter);
					return fStageComplete();
				}
				catch (pError)
				{
					tmpSelf.log.error('  > Error generating legacy MySQL DDL: ' + pError);
					return fStageComplete(pError);
				}
			});

		// Stage 5: Compare outputs and generate report
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				tmpSelf.log.info('--> [CompareDDL] Comparing outputs...');

				// Load base models
				try
				{
					let tmpLegacyBaseFile = tmpLegacyOutputLocation + pOutputFileName + '.json';
					let tmpNewBaseFile = tmpNewOutputLocation + pOutputFileName + '.json';
					tmpResults.LegacyModel = JSON.parse(libFS.readFileSync(tmpLegacyBaseFile, 'utf8'));
					tmpResults.NewModel = JSON.parse(libFS.readFileSync(tmpNewBaseFile, 'utf8'));
				}
				catch (pError)
				{
					tmpSelf.log.error('  > Error reading base model files: ' + pError);
					return fStageComplete(pError);
				}

				// Deep compare base models (skip MeadowSchema — it's derived data)
				tmpSelf.deepCompare(
					tmpResults.LegacyModel, tmpResults.NewModel,
					'', tmpResults.ModelDifferences,
					{ SkipKeys: ['MeadowSchema', 'TablesSequence'] }
				);

				// Load and compare extended models
				try
				{
					let tmpLegacyExtFile = tmpLegacyOutputLocation + pOutputFileName + '-Extended.json';
					let tmpNewExtFile = tmpNewOutputLocation + pOutputFileName + '-Extended.json';
					let tmpLegacyExt = JSON.parse(libFS.readFileSync(tmpLegacyExtFile, 'utf8'));
					let tmpNewExt = JSON.parse(libFS.readFileSync(tmpNewExtFile, 'utf8'));

					tmpSelf.deepCompare(
						tmpLegacyExt, tmpNewExt,
						'', tmpResults.ExtendedDifferences,
						{ SkipKeys: ['MeadowSchema', 'TablesSequence'] }
					);
				}
				catch (pError)
				{
					tmpSelf.log.error('  > Error reading extended model files: ' + pError);
					return fStageComplete(pError);
				}

				// Compare MySQL DDL files
				try
				{
					let tmpLegacyDDLFile = tmpLegacyOutputLocation + pOutputFileName + '.mysql.sql';
					let tmpNewDDLFile = tmpNewOutputLocation + pOutputFileName + '.mysql.sql';
					let tmpLegacyDDL = libFS.readFileSync(tmpLegacyDDLFile, 'utf8');
					let tmpNewDDL = libFS.readFileSync(tmpNewDDLFile, 'utf8');

					tmpResults.DDLDifferences = tmpSelf.compareDDLText(tmpLegacyDDL, tmpNewDDL);
				}
				catch (pError)
				{
					tmpSelf.log.error('  > Error reading DDL files: ' + pError);
					return fStageComplete(pError);
				}

				// Build and write the report
				let tmpReport = tmpSelf.buildReport(tmpResults);
				let tmpReportFile = pOutputLocation + pOutputFileName + '-ComparisonReport.txt';
				try
				{
					libFS.writeFileSync(tmpReportFile, tmpReport);
					tmpSelf.log.info('  > Comparison report written to: ' + tmpReportFile);
				}
				catch (pError)
				{
					tmpSelf.log.error('  > Error writing report: ' + pError);
					return fStageComplete(pError);
				}

				// Log summary to console
				tmpSelf.log.info('');
				tmpSelf.log.info('=== Comparison Summary ===');
				tmpSelf.log.info('  Base Model Differences:     ' + tmpResults.ModelDifferences.length);
				tmpSelf.log.info('  Extended Model Differences:  ' + tmpResults.ExtendedDifferences.length);
				tmpSelf.log.info('  DDL Line Differences:        ' + tmpResults.DDLDifferences.length);

				let tmpTotalDiffs = tmpResults.ModelDifferences.length + tmpResults.ExtendedDifferences.length + tmpResults.DDLDifferences.length;
				if (tmpTotalDiffs === 0)
				{
					tmpSelf.log.info('  RESULT: Legacy and new compilers produce identical output.');
				}
				else
				{
					tmpSelf.log.info('  RESULT: ' + tmpTotalDiffs + ' total difference(s) found.');
				}

				return fStageComplete();
			});

		// Wait for all stages
		tmpAnticipate.wait(
			(pError) =>
			{
				if (pError)
				{
					tmpSelf.log.error('Error in CompareDDL pipeline: ' + pError);
				}
				return tmpCallback(pError);
			});
	}
}

module.exports = StrictureServiceCompareDDL;

/** @type {Record<string, any>} */
StrictureServiceCompareDDL.default_configuration = {};
