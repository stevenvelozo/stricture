/**
 * Stricture - TUI Entry Point
 *
 * Bootstraps the interactive terminal user interface for Stricture.
 * Accepts an input MicroDDL file (or pre-compiled JSON) and launches
 * the blessed-based TUI for browsing and editing the model.
 *
 * Usage:
 *   node source/Stricture-TUI.js [input_file]
 *   stricture tui [input_file]
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libPict = require('pict');
const libFS = require('fs');
const libPath = require('path');

const StrictureTUIApplication = require('./tui/Stricture-TUI-App.js');

/**
 * Launch the Stricture TUI.
 *
 * @param {Object} pOptions - Launch options
 * @param {string} [pOptions.InputFile] - Path to a .mddl or .json model file
 * @param {string} [pOptions.OutputLocation] - Output directory for generated files
 * @param {string} [pOptions.OutputFileName] - Base output file name
 */
function launchTUI(pOptions)
{
	let tmpOptions = pOptions || {};
	let tmpInputFile = tmpOptions.InputFile || null;
	let tmpOutputLocation = tmpOptions.OutputLocation || './model/';
	let tmpOutputFileName = tmpOptions.OutputFileName || 'MeadowModel';

	// Create the Pict instance
	let tmpPict = new libPict(
		{
			Product: 'StrictureTUI',
			LogNoisiness: 0
		});

	// Register all Stricture service types
	tmpPict.addServiceType('StrictureModelLoader', require('./services/Stricture-Service-ModelLoader.js'));
	tmpPict.addServiceType('StrictureCompiler', require('./services/Stricture-Service-Compiler.js'));
	tmpPict.addServiceType('StrictureGenerateMySQL', require('./services/Stricture-Service-GenerateMySQL.js'));
	tmpPict.addServiceType('StrictureGenerateMySQLMigrate', require('./services/Stricture-Service-GenerateMySQLMigrate.js'));
	tmpPict.addServiceType('StrictureGenerateMeadow', require('./services/Stricture-Service-GenerateMeadow.js'));
	tmpPict.addServiceType('StrictureGenerateMarkdown', require('./services/Stricture-Service-GenerateMarkdown.js'));
	tmpPict.addServiceType('StrictureGenerateLaTeX', require('./services/Stricture-Service-GenerateLaTeX.js'));
	tmpPict.addServiceType('StrictureGenerateDictionaryCSV', require('./services/Stricture-Service-GenerateDictionaryCSV.js'));
	tmpPict.addServiceType('StrictureGenerateModelGraph', require('./services/Stricture-Service-GenerateModelGraph.js'));
	tmpPict.addServiceType('StrictureGenerateAuthChart', require('./services/Stricture-Service-GenerateAuthChart.js'));
	tmpPict.addServiceType('StrictureGeneratePict', require('./services/Stricture-Service-GeneratePict.js'));
	tmpPict.addServiceType('StrictureGenerateTestFixtures', require('./services/Stricture-Service-GenerateTestFixtures.js'));

	// Initialize TUI application state
	tmpPict.AppData.TUI =
	{
		InputFile: tmpInputFile,
		OutputLocation: tmpOutputLocation,
		OutputFileName: tmpOutputFileName,
		CurrentView: 'Overview',
		StatusMessage: 'Ready',
		Model: null,
		ModelIndices: null,
		TableNames: [],
		TableCount: 0,
		TotalColumns: 0,
		DomainCount: 0,
		SelectedTable: null,
		SelectedTableData: null,
		CompileLog: ''
	};

	// Create the TUI application
	let tmpApp = tmpPict.addApplication('Stricture-TUI',
		{
			Name: 'Stricture-TUI',
			MainViewportViewIdentifier: 'TUI-Layout',
			AutoRenderMainViewportViewAfterInitialize: false,
			AutoSolveAfterInitialize: false
		}, StrictureTUIApplication);

	// Initialize the application
	tmpApp.initializeAsync(
		(pError) =>
		{
			if (pError)
			{
				console.error('TUI initialization failed:', pError);
				process.exit(1);
			}

			// If an input file was provided, try to load or compile it
			if (tmpInputFile)
			{
				let tmpExtension = libPath.extname(tmpInputFile).toLowerCase();

				if (tmpExtension === '.json')
				{
					// Load pre-compiled JSON model
					let tmpLoader = tmpPict.instantiateServiceProvider('StrictureModelLoader');
					tmpLoader.loadFromFile(tmpInputFile,
						(pLoadError) =>
						{
							if (!pLoadError)
							{
								tmpPict.AppData.TUI.Model = tmpPict.AppData.Model;
								tmpPict.AppData.TUI.StatusMessage = 'Model loaded from JSON';
								tmpApp.populateTableList();
								tmpApp.navigateTo('Overview');
							}
							else
							{
								tmpPict.AppData.TUI.StatusMessage = 'Error loading: ' + pLoadError.message;
								tmpApp.navigateTo('Overview');
							}
						});
				}
				else
				{
					// Compile MicroDDL file first
					let tmpCompiler = tmpPict.instantiateServiceProvider('StrictureCompiler');
					tmpCompiler.compileFile(tmpInputFile, tmpOutputLocation, tmpOutputFileName,
						(pCompileError) =>
						{
							if (pCompileError)
							{
								tmpPict.AppData.TUI.StatusMessage = 'Compile error: ' + pCompileError.message;
								tmpApp.navigateTo('Overview');
								return;
							}

							// Load the compiled extended model
							let tmpLoader = tmpPict.instantiateServiceProvider('StrictureModelLoader');
							let tmpExtendedFile = tmpOutputLocation + tmpOutputFileName + '-Extended.json';
							tmpLoader.loadFromFile(tmpExtendedFile,
								(pLoadError) =>
								{
									if (!pLoadError)
									{
										tmpPict.AppData.TUI.Model = tmpPict.AppData.Model;
										tmpPict.AppData.TUI.StatusMessage = 'Compiled and loaded';
										tmpApp.populateTableList();
									}
									else
									{
										tmpPict.AppData.TUI.StatusMessage = 'Load error: ' + pLoadError.message;
									}
									tmpApp.navigateTo('Overview');
								});
						});
				}
			}
		});
}

module.exports = { launchTUI };
