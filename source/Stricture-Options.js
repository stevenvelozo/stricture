/**
* Stricture - Options and Command Line Parsing
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libYargs = require('yargs');

/**
* The Default Execution Options
*/
var _Options =
{
	Command: 'Full',

	InputFileName: './Model.ddl',
	OutputLocation: './model/',
	OutputFileName: 'MeadowModel',

	// Automatically compile the image/pdf/whatever if it can
	AutomaticallyCompile: false,
	// Automatically load the binary that was generated
	AutomaticallyLoad: false,

	// State for if CLI options are parsed.
	Parsed: false,

	// The current platform
	Platform: 'nix'
};

/**
* Parse the command line options if they haven't been parsed before.
*/
var parseCommandLineOptions = function()
{
	if (_Options.Parsed)
	{
		return;
	}

	// The "Command to Execute" -c parameter (Relationships, RelationshipsFull, etc.)
	if (libYargs.argv.c !== undefined)
		_Options.Command = libYargs.argv.c;

	// The -i InputFileName parameter (required)
	if (libYargs.argv.i !== undefined)
	{
		_Options.InputFileName = libYargs.argv.i;
	}

	// The -f OutputLocation parameter (defaults to "./build/")
	if (libYargs.argv.f !== undefined)
		_Options.OutputLocation = libYargs.argv.f;

	// The -o OutputFileName parameter (defaults to "Stricture_Output")
	if (libYargs.argv.o !== undefined)
		_Options.OutputFileName = libYargs.argv.o;

	// The -g parameter (meaning "Automatically Generate Binary File")
	_Options.AutomaticallyCompile = libYargs.argv.g;

	// The -l parameter (meaning "Automatically Load Binary File After Generation")
	_Options.AutomaticallyLoad = libYargs.argv.l;

	// Detect the operating system we're working in
	if (/^win/.test(process.platform))
		_Options.Platform = 'windows';
	if (/^darwin/.test(process.platform))
		_Options.Platform = 'mac';
};
parseCommandLineOptions();

module.exports = _Options;