/**
 * Stricture CLI Command - Compile
 *
 * Compiles a MicroDDL file into JSON model files.
 *
 * Usage: stricture compile [input_file] [-o folder] [-p prefix]
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

class StrictureCommandCompile extends libCommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'compile';
		this.options.Description = 'Compile MicroDDL to JSON model files.';
		this.options.Aliases.push('c');

		this.options.CommandArguments.push(
			{ Name: '[input_file]', Description: 'MicroDDL input file.', Default: '' });

		this.options.CommandOptions.push(
			{ Name: '-o, --output <folder>', Description: 'Output folder.', Default: '' });
		this.options.CommandOptions.push(
			{ Name: '-p, --prefix <name>', Description: 'Output file prefix.', Default: '' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpConfig = this.fable.ProgramConfiguration || {};

		let tmpInputFile = this.ArgumentString || tmpConfig.InputFileName || './Model.ddl';
		let tmpOutputLocation = (this.CommandOptions && this.CommandOptions.output) || tmpConfig.OutputLocation || './model/';
		let tmpOutputFileName = (this.CommandOptions && this.CommandOptions.prefix) || tmpConfig.OutputFileName || 'MeadowModel';

		// Ensure output location ends with /
		if (!tmpOutputLocation.endsWith('/'))
		{
			tmpOutputLocation += '/';
		}

		// Create output directory
		let libMkdirp = require('mkdirp');
		libMkdirp.sync(tmpOutputLocation);

		let tmpCompiler = this.fable.instantiateServiceProvider('StrictureCompiler');
		tmpCompiler.compileFile(tmpInputFile, tmpOutputLocation, tmpOutputFileName, fCallback);
	}
}

module.exports = StrictureCommandCompile;
