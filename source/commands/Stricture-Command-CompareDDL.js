/**
 * Stricture CLI Command - CompareDDL
 *
 * Compiles a MicroDDL file with both the legacy and new compiler, generates
 * MySQL DDL from each, and outputs a comparison report.
 *
 * Usage: stricture compare-ddl [input_file] [-o folder] [-p prefix]
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libMkdirp = require('mkdirp');

class StrictureCommandCompareDDL extends libCommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'compare-ddl';
		this.options.Description = 'Compile with both legacy and new compiler, compare outputs.';

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

		if (!tmpOutputLocation.endsWith('/'))
		{
			tmpOutputLocation += '/';
		}

		libMkdirp.sync(tmpOutputLocation);

		let tmpService = this.fable.instantiateServiceProvider('StrictureCompareDDL');
		tmpService.compare(tmpInputFile, tmpOutputLocation, tmpOutputFileName, fCallback);
	}
}

module.exports = StrictureCommandCompareDDL;
