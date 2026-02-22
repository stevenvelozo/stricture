/**
 * Stricture CLI Command - Full
 *
 * Runs the complete Stricture pipeline: compile the MicroDDL, then generate
 * MySQL CREATE statements, Meadow schemas, Markdown documentation, and
 * relationship diagrams.
 *
 * This is the default command and replicates the legacy 'Full' behavior.
 *
 * Usage: stricture full [input_file] [-o folder] [-p prefix] [-g]
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libCommandLineCommand = require('pict-service-commandlineutility').ServiceCommandLineCommand;
const libMkdirp = require('mkdirp');

class StrictureCommandFull extends libCommandLineCommand
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.CommandKeyword = 'full';
		this.options.Description = 'Run full pipeline: compile + MySQL + Meadow + docs + diagrams.';

		this.options.CommandArguments.push(
			{ Name: '[input_file]', Description: 'MicroDDL input file.', Default: '' });

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

		let tmpInputFile = this.ArgumentString || tmpConfig.InputFileName || './Model.ddl';
		let tmpOutputLocationBase = (this.CommandOptions && this.CommandOptions.output) || tmpConfig.OutputLocation || './model/';
		let tmpOutputFileName = (this.CommandOptions && this.CommandOptions.prefix) || tmpConfig.OutputFileName || 'MeadowModel';
		let tmpAutoCompile = (this.CommandOptions && this.CommandOptions.generateImage) || tmpConfig.AutomaticallyCompile || false;

		if (!tmpOutputLocationBase.endsWith('/'))
		{
			tmpOutputLocationBase += '/';
		}

		let tmpSelf = this;
		let tmpAnticipate = this.fable.instantiateServiceProviderWithoutRegistration('Anticipate');

		// Stage 1: Compile the MicroDDL file
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				libMkdirp.sync(tmpOutputLocationBase);

				let tmpCompiler = tmpSelf.fable.instantiateServiceProvider('StrictureCompiler');
				tmpCompiler.compileFile(tmpInputFile, tmpOutputLocationBase, tmpOutputFileName, fStageComplete);
			});

		// Stage 2: Load the compiled extended model for generators
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				let tmpExtendedModelFile = tmpOutputLocationBase + tmpOutputFileName + '-Extended.json';
				let tmpLoader = tmpSelf.fable.instantiateServiceProvider('StrictureModelLoader');
				tmpLoader.loadFromFile(tmpExtendedModelFile, fStageComplete);
			});

		// Stage 3: Generate MySQL CREATE statements
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				let tmpMySQLLocation = tmpOutputLocationBase + 'mysql_create/';
				libMkdirp.sync(tmpMySQLLocation);

				let tmpGenerator = tmpSelf.fable.instantiateServiceProvider('StrictureGenerateMySQL');
				tmpGenerator.generate(
					{
						OutputLocation: tmpMySQLLocation,
						OutputFileName: 'MeadowModel-CreateMySQLDatabase'
					}, fStageComplete);
			});

		// Stage 4: Generate Meadow schemas
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				let tmpMeadowLocation = tmpOutputLocationBase + 'meadow/';
				libMkdirp.sync(tmpMeadowLocation);

				let tmpGenerator = tmpSelf.fable.instantiateServiceProvider('StrictureGenerateMeadow');
				tmpGenerator.generate(
					{
						OutputLocation: tmpMeadowLocation,
						OutputFileName: 'MeadowSchema'
					}, fStageComplete);
			});

		// Stage 5: Generate Markdown documentation
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				let tmpDocLocation = tmpOutputLocationBase + 'doc/';
				libMkdirp.sync(tmpDocLocation);

				let tmpGenerator = tmpSelf.fable.instantiateServiceProvider('StrictureGenerateMarkdown');
				tmpGenerator.generate(
					{
						OutputLocation: tmpDocLocation,
						OutputFileName: 'Documentation'
					}, fStageComplete);
			});

		// Stage 6: Generate relationship diagrams (standard)
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				let tmpDiagramLocation = tmpOutputLocationBase + 'doc/diagrams/';
				libMkdirp.sync(tmpDiagramLocation);

				let tmpGenerator = tmpSelf.fable.instantiateServiceProvider('StrictureGenerateModelGraph');
				tmpGenerator.generate(
					{
						OutputLocation: tmpDiagramLocation,
						OutputFileName: 'Relationships',
						GraphFullJoins: false,
						AutomaticallyCompile: tmpAutoCompile
					}, fStageComplete);
			});

		// Stage 7: Generate relationship diagrams (full, including change tracking)
		tmpAnticipate.anticipate(
			(fStageComplete) =>
			{
				let tmpDiagramLocation = tmpOutputLocationBase + 'doc/diagrams/';
				libMkdirp.sync(tmpDiagramLocation);

				let tmpGenerator = tmpSelf.fable.instantiateServiceProvider('StrictureGenerateModelGraph');
				tmpGenerator.generate(
					{
						OutputLocation: tmpDiagramLocation,
						OutputFileName: 'RelationshipsFull',
						GraphFullJoins: true,
						AutomaticallyCompile: tmpAutoCompile
					}, fStageComplete);
			});

		// Wait for all stages to complete
		tmpAnticipate.wait(
			(pError) =>
			{
				if (pError)
				{
					tmpSelf.log.error('Error running full compilation: ' + pError);
				}
				return fCallback(pError);
			});
	}
}

module.exports = StrictureCommandFull;
