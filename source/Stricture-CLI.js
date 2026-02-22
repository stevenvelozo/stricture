/**
 * Stricture - CLI Program Entry Point
 *
 * Sets up the Commander.js-based CLI using pict-service-commandlineutility.
 * Registers all available subcommands (compile, mysql, meadow, full, tui, etc.)
 * and handles cascading configuration from config files.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libCLIProgram = require('pict-service-commandlineutility');

/**
 * Create the CLI program instance with all commands registered.
 *
 * This extends Pict (via CLIProgram), so all Fable services are available.
 * The program supports cascading configuration from:
 *   1. Default settings (below)
 *   2. Home folder .stricture-config.json
 *   3. CWD .stricture-config.json
 */
const _StrictureCLI = new libCLIProgram(
	{
		Product: 'stricture',
		Version: require('../package.json').version,
		Command: 'stricture',
		Description: 'MicroDDL compiler and multi-target schema code generator.',

		// Default configuration merged into ProgramConfiguration
		DefaultProgramConfiguration:
		{
			InputFileName: './Model.ddl',
			OutputLocation: './model/',
			OutputFileName: 'MeadowModel',

			// Automatically compile binary output (e.g. DOT to PNG)
			AutomaticallyCompile: false,
			// Automatically load the generated binary after compilation
			AutomaticallyLoad: false
		},

		// Configuration file name for cascading config lookup
		ProgramConfigurationFileName: '.stricture-config.json',

		// Automatically gather configuration from default + home + cwd
		AutoGatherProgramConfiguration: true,

		// Add a built-in 'explain-config' command showing the config cascade
		AutoAddConfigurationExplanationCommand: true
	},
	[
		// Each command is a self-contained service that registers itself
		require('./commands/Stricture-Command-Full.js'),
		require('./commands/Stricture-Command-Compile.js'),
		require('./commands/Stricture-Command-MySQL.js'),
		require('./commands/Stricture-Command-MySQLMigrate.js'),
		require('./commands/Stricture-Command-Meadow.js'),
		require('./commands/Stricture-Command-Documentation.js'),
		require('./commands/Stricture-Command-DataDictionary.js'),
		require('./commands/Stricture-Command-DictionaryCSV.js'),
		require('./commands/Stricture-Command-Relationships.js'),
		require('./commands/Stricture-Command-RelationshipsFull.js'),
		require('./commands/Stricture-Command-Authorization.js'),
		require('./commands/Stricture-Command-Pict.js'),
		require('./commands/Stricture-Command-TestFixtures.js'),
		require('./commands/Stricture-Command-Info.js'),
		require('./commands/Stricture-Command-TUI.js')
	]);

// Register all Stricture service types on the CLI program's pict instance
_StrictureCLI.addServiceType('StrictureModelLoader', require('./services/Stricture-Service-ModelLoader.js'));
_StrictureCLI.addServiceType('StrictureCompiler', require('./services/Stricture-Service-Compiler.js'));
_StrictureCLI.addServiceType('StrictureGenerateMySQL', require('./services/Stricture-Service-GenerateMySQL.js'));
_StrictureCLI.addServiceType('StrictureGenerateMySQLMigrate', require('./services/Stricture-Service-GenerateMySQLMigrate.js'));
_StrictureCLI.addServiceType('StrictureGenerateMeadow', require('./services/Stricture-Service-GenerateMeadow.js'));
_StrictureCLI.addServiceType('StrictureGenerateMarkdown', require('./services/Stricture-Service-GenerateMarkdown.js'));
_StrictureCLI.addServiceType('StrictureGenerateLaTeX', require('./services/Stricture-Service-GenerateLaTeX.js'));
_StrictureCLI.addServiceType('StrictureGenerateDictionaryCSV', require('./services/Stricture-Service-GenerateDictionaryCSV.js'));
_StrictureCLI.addServiceType('StrictureGenerateModelGraph', require('./services/Stricture-Service-GenerateModelGraph.js'));
_StrictureCLI.addServiceType('StrictureGenerateAuthChart', require('./services/Stricture-Service-GenerateAuthChart.js'));
_StrictureCLI.addServiceType('StrictureGeneratePict', require('./services/Stricture-Service-GeneratePict.js'));
_StrictureCLI.addServiceType('StrictureGenerateTestFixtures', require('./services/Stricture-Service-GenerateTestFixtures.js'));

module.exports = _StrictureCLI;
