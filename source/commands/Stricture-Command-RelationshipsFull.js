/**
 * Stricture CLI Command - Relationships Full
 *
 * Generates GraphViz DOT relationship diagrams (including change tracking joins).
 *
 * Usage: stricture relationships-full [input_file] [-o folder] [-p prefix] [-g]
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libMkdirp = require('mkdirp');

class StrictureCommandRelationshipsFull extends libCommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'relationships-full';
		this.options.Description = 'Generate full relationship graph (including change tracking joins).';
		this.options.Aliases.push('relf');

		this.options.CommandArguments.push(
			{ Name: '[input_file]', Description: 'Compiled JSON model file.', Default: '' });
		this.options.CommandOptions.push(
			{ Name: '-o, --output <folder>', Description: 'Output folder.', Default: '' });
		this.options.CommandOptions.push(
			{ Name: '-p, --prefix <name>', Description: 'Output file prefix.', Default: '' });
		this.options.CommandOptions.push(
			{ Name: '-g, --generate-image', Description: 'Automatically compile DOT to PNG.' });

		this.addCommand();
	}

	onRunAsync(fCallback)
	{
		let tmpConfig = this.fable.ProgramConfiguration || {};
		let tmpInputFile = this.ArgumentString || tmpConfig.InputFileName || './model/MeadowModel-Extended.json';
		let tmpOutputLocation = (this.CommandOptions && this.CommandOptions.output) || tmpConfig.OutputLocation || './model/';
		let tmpOutputFileName = (this.CommandOptions && this.CommandOptions.prefix) || tmpConfig.OutputFileName || 'RelationshipsFull';

		if (!tmpOutputLocation.endsWith('/')) { tmpOutputLocation += '/'; }
		libMkdirp.sync(tmpOutputLocation);

		let tmpAutoCompile = (this.CommandOptions && this.CommandOptions.generateImage) || tmpConfig.AutomaticallyCompile || false;

		let tmpLoader = this.fable.instantiateServiceProvider('StrictureModelLoader');
		tmpLoader.loadFromFile(tmpInputFile,
			(pError) =>
			{
				if (pError) { return fCallback(pError); }
				let tmpGenerator = this.fable.instantiateServiceProvider('StrictureGenerateModelGraph');
				tmpGenerator.generate(
					{
						OutputLocation: tmpOutputLocation,
						OutputFileName: tmpOutputFileName,
						GraphFullJoins: true,
						AutomaticallyCompile: tmpAutoCompile
					}, fCallback);
			});
	}
}

module.exports = StrictureCommandRelationshipsFull;
