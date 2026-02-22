/**
 * Stricture CLI Command - TUI
 *
 * Launches the interactive terminal user interface for browsing,
 * editing and compiling MicroDDL models.
 *
 * Usage: stricture tui [input_file] [-o folder] [-p prefix]
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;

class StrictureCommandTUI extends libCommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'tui';
		this.options.Description = 'Launch the interactive terminal UI.';

		this.options.CommandArguments.push(
			{ Name: '[input_file]', Description: 'MicroDDL or compiled JSON file.', Default: '' });

		this.options.CommandOptions.push(
			{ Name: '-o, --output <folder>', Description: 'Output folder.', Default: '' });
		this.options.CommandOptions.push(
			{ Name: '-p, --prefix <name>', Description: 'Output file prefix.', Default: '' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpConfig = this.fable.ProgramConfiguration || {};

		let tmpInputFile = this.ArgumentString || tmpConfig.InputFileName || null;
		let tmpOutputLocation = (this.CommandOptions && this.CommandOptions.output) || tmpConfig.OutputLocation || './model/';
		let tmpOutputFileName = (this.CommandOptions && this.CommandOptions.prefix) || tmpConfig.OutputFileName || 'MeadowModel';

		if (tmpOutputLocation && !tmpOutputLocation.endsWith('/'))
		{
			tmpOutputLocation += '/';
		}

		// Launch the TUI (this takes over the terminal — callback is never called
		// because the TUI runs until the user quits with q/Ctrl-C)
		let tmpTUI = require('../Stricture-TUI.js');
		tmpTUI.launchTUI(
			{
				InputFile: tmpInputFile,
				OutputLocation: tmpOutputLocation,
				OutputFileName: tmpOutputFileName
			});

		// Note: fCallback is intentionally not called because the TUI
		// takes over the process. The user exits via q or Ctrl-C.
	}
}

module.exports = StrictureCommandTUI;
