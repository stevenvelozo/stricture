/**
 * Stricture CLI Command - Legacy
 *
 * Runs the legacy (v2) Stricture pipeline from source/legacy/.
 * This allows users who depend on the old CLI behavior (yargs flags,
 * async.waterfall pipeline, direct Fable usage) to continue using it
 * through the new CLI.
 *
 * Usage: stricture legacy [input_file] [-c command] [-o folder] [-p prefix] [-g] [-l]
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

class StrictureCommandLegacy extends libCommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'legacy';
		this.options.Description = 'Run the legacy (v2) Stricture pipeline.';

		this.options.CommandArguments.push(
			{ Name: '[input_file]', Description: 'MicroDDL or JSON input file.', Default: '' });

		this.options.CommandOptions.push(
			{ Name: '-c, --command <command>', Description: 'Legacy command to execute (Full, Compile, MySQL, MySQL-Migrate, Meadow, Documentation, DataDictionary, DictionaryCSV, Relationships, RelationshipsFull, Pict, TestObjectContainers, Info).', Default: '' });
		this.options.CommandOptions.push(
			{ Name: '-o, --output <folder>', Description: 'Output folder.', Default: '' });
		this.options.CommandOptions.push(
			{ Name: '-p, --prefix <name>', Description: 'Output file prefix.', Default: '' });
		this.options.CommandOptions.push(
			{ Name: '-g, --generate-image', Description: 'Automatically compile binary output (e.g. DOT to PNG).' });
		this.options.CommandOptions.push(
			{ Name: '-l, --load-binary', Description: 'Automatically load the generated binary after compilation.' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpConfig = this.fable.ProgramConfiguration || {};

		let tmpInputFile = this.ArgumentString || tmpConfig.InputFileName || './Model.ddl';
		let tmpCommand = (this.CommandOptions && this.CommandOptions.command) || tmpConfig.Command || 'Full';
		let tmpOutputLocation = (this.CommandOptions && this.CommandOptions.output) || tmpConfig.OutputLocation || './model/';
		let tmpOutputFileName = (this.CommandOptions && this.CommandOptions.prefix) || tmpConfig.OutputFileName || 'MeadowModel';
		let tmpAutoCompile = (this.CommandOptions && this.CommandOptions.generateImage) || tmpConfig.AutomaticallyCompile || false;
		let tmpAutoLoad = (this.CommandOptions && this.CommandOptions.loadBinary) || tmpConfig.AutomaticallyLoad || false;

		// Ensure output location ends with /
		if (!tmpOutputLocation.endsWith('/'))
		{
			tmpOutputLocation += '/';
		}

		this.log.info('Running legacy pipeline with command [' + tmpCommand + '] on input [' + tmpInputFile + ']');

		// Build the settings object for the legacy Stricture entry point.
		// These settings are passed to fable.new(), and since the legacy code
		// uses settingsManager.fill() for its defaults, our values take precedence.
		let tmpLegacySettings =
		{
			Product: 'stricture-legacy',
			Command: tmpCommand,
			InputFileName: tmpInputFile,
			OutputLocation: tmpOutputLocation,
			OutputFileName: tmpOutputFileName,
			AutomaticallyCompile: tmpAutoCompile,
			AutomaticallyLoad: tmpAutoLoad,
			Parsed: true
		};

		try
		{
			let libLegacyStricture = require('../legacy/Stricture.js');
			libLegacyStricture(tmpLegacySettings);
		}
		catch (pError)
		{
			this.log.error('Legacy pipeline error: ' + pError);
			return fCallback(pError);
		}

		return fCallback();
	}
}

module.exports = StrictureCommandLegacy;
