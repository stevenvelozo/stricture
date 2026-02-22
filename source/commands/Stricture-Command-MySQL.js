/**
 * Stricture CLI Command - MySQL
 *
 * Generates MySQL CREATE TABLE statements from a compiled JSON model.
 *
 * Usage: stricture mysql [input_file] [-o folder] [-p prefix]
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libMkdirp = require('mkdirp');

class StrictureCommandMySQL extends libCommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'mysql';
		this.options.Description = 'Generate MySQL CREATE TABLE statements.';

		this.options.CommandArguments.push(
			{ Name: '[input_file]', Description: 'Compiled JSON model file.', Default: '' });

		this.options.CommandOptions.push(
			{ Name: '-o, --output <folder>', Description: 'Output folder.', Default: '' });
		this.options.CommandOptions.push(
			{ Name: '-p, --prefix <name>', Description: 'Output file prefix.', Default: '' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpConfig = this.fable.ProgramConfiguration || {};

		let tmpInputFile = this.ArgumentString || tmpConfig.InputFileName || './model/MeadowModel-Extended.json';
		let tmpOutputLocation = (this.CommandOptions && this.CommandOptions.output) || tmpConfig.OutputLocation || './model/';
		let tmpOutputFileName = (this.CommandOptions && this.CommandOptions.prefix) || tmpConfig.OutputFileName || 'MeadowModel';

		if (!tmpOutputLocation.endsWith('/'))
		{
			tmpOutputLocation += '/';
		}

		libMkdirp.sync(tmpOutputLocation);

		// Load the model, then generate
		let tmpLoader = this.fable.instantiateServiceProvider('StrictureModelLoader');
		tmpLoader.loadFromFile(tmpInputFile,
			(pError) =>
			{
				if (pError)
				{
					return fCallback(pError);
				}
				let tmpGenerator = this.fable.instantiateServiceProvider('StrictureGenerateMySQL');
				tmpGenerator.generate({ OutputLocation: tmpOutputLocation, OutputFileName: tmpOutputFileName }, fCallback);
			});
	}
}

module.exports = StrictureCommandMySQL;
