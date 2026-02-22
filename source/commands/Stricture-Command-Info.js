/**
 * Stricture CLI Command - Info
 *
 * Loads a compiled model and displays basic table list and counts.
 *
 * Usage: stricture info [input_file]
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

class StrictureCommandInfo extends libCommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'info';
		this.options.Description = 'Display model info (table list and counts).';
		this.options.Aliases.push('i');

		this.options.CommandArguments.push(
			{ Name: '[input_file]', Description: 'Compiled JSON model file.', Default: '' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpConfig = this.fable.ProgramConfiguration || {};
		let tmpInputFile = this.ArgumentString || tmpConfig.InputFileName || './model/MeadowModel-Extended.json';

		let tmpLoader = this.fable.instantiateServiceProvider('StrictureModelLoader');
		tmpLoader.loadFromFile(tmpInputFile,
			(pError) =>
			{
				if (pError) { return fCallback(pError); }

				let tmpModel = this.fable.AppData.Model;

				if (!tmpModel || !tmpModel.Tables)
				{
					this.log.warn('  > No tables found in the model.');
					return fCallback(null);
				}

				let tmpTableKeys = Object.keys(tmpModel.Tables);
				console.log(`--> There are ${tmpTableKeys.length} tables in the model (listed below).`);

				for (let i = 0; i < tmpTableKeys.length; i++)
				{
					let tmpTable = tmpModel.Tables[tmpTableKeys[i]];
					let tmpColumnCount = tmpTable.Columns ? tmpTable.Columns.length : 0;
					console.log(`    ${tmpTable.TableName} (${tmpColumnCount} columns)`);
				}

				return fCallback(null);
			});
	}
}

module.exports = StrictureCommandInfo;
