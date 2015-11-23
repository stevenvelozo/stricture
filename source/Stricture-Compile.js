// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/
var libFS = require('fs');
var libLineReader = require('line-by-line');
var libJSONFile = require('jsonfile');
var libUnderscore = require('underscore');

/**
* Stricture MicroDDL Compiler
*/

// ## Load the default state for meadow and pict configuration settings
var _DefaultAPIDefinitions = require(__dirname+'/Meadow-Endpoints-Definition-Defaults.js')
var _DefaultAPISecurity = require(__dirname+'/Meadow-Endpoints-Security-Defaults.js');

var _DefaultPict = require(__dirname+'/Pict-Configuration-Defaults.js');

var ReadMicroDDLFile = function(pFable, pFileName, fComplete)
{
	pFable.DDLParserState = (
	{
		LineCount: 0,
		TableCount: 0,
		ColumnCount: 0,
		InStanza: false,
		CurrentScope: 'None',
		StanzaType: 'None'
	});

	// Add a scope if it doesn't exist
	var InitializeScope = function(pScopeHash, pFable)
	{
		if (!pFable.Stricture.Tables.hasOwnProperty(pScopeHash))
		{
			pFable.Stricture.Tables[pScopeHash] = { TableName:pScopeHash, Columns:[] };
			pFable.Stricture.TablesSequence.push(pScopeHash);

			pFable.Stricture.Endpoints = libUnderscore.extend({}, _DefaultAPIDefinitions);
			pFable.Stricture.Authentication[pScopeHash] = libUnderscore.extend({}, _DefaultAPISecurity);

			pFable.Stricture.Pict[pScopeHash] = libUnderscore.extend({}, _DefaultPict);
		}
	};

	// Parse the file line-by-line
	var tmpLineReader = new libLineReader(pFileName);

	tmpLineReader.on('error',
		function (pError)
		{
			console.error('>>> Error reading MicroDDL file.');
			console.log('  > '+pError);
		}
	);

	tmpLineReader.on('line',
		function (pLine)
		{
			tmpLineReader.pause();

			pFable.DDLParserState.LineCount++;
			var tmpLine = pLine.trim();
			var tmpLineSplit = tmpLine.split(' ');

			if (tmpLine === '')
			{
				// Reset the stanza and scope data
				pFable.DDLParserState.StanzaType = 'None';
				pFable.DDLParserState.CurrentScope = 'None';
			}
			// If we aren't in a table currently, the only thing we look for is a table start
			else if (pFable.DDLParserState.CurrentScope === 'None')
			{
				// Check for a table create stanza
				if (tmpLine.charAt(0) === '!')
				{
					pFable.DDLParserState.StanzaType = 'TableSchema';
					pFable.DDLParserState.CurrentScope = tmpLineSplit[0].substring(1);
					// Add the table to the model if it doesn't exist.
					InitializeScope(pFable.DDLParserState.CurrentScope, pFable);

					console.log('  > Line #'+pFable.DDLParserState.LineCount+' begins table stanza: '+pFable.DDLParserState.CurrentScope);

					pFable.DDLParserState.TableCount++;
				}
				// Check for an extended stanza
				else if ((tmpLine.charAt(0) === '[') && (tmpLine.charAt(tmpLine.length-1) === ']'))
				{
				}
				else
				{
					// We are ignoring all lines that aren't in table stanzas
					if (tmpLine !== '')
					{
						// Tell the user that they typed something that was ignored.
						console.error('  > Compiler ignoring line #'+pFable.DDLParserState.LineCount+' because it is not within a table stanza.');
						console.error('    Content: '+tmpLine);
					}
				}
			}
			else if (pFable.DDLParserState.StanzaType == 'TableSchema')
			{
				// The character at index 0 defines the line type
				var tmpLineTypeCharacter = tmpLine.charAt(0);
				//console.log('   > Line type character: '+tmpLineTypeCharacter);
				var tmpLineType = 'Comment';
				var tmpColumn = {};

				/* ```
				 * Symbols:
				 *
					!TABLE
					@Primary Numeric Identity
					%GUID
					#Number
					.Decimal
					$String [SIZE]
					*Text
					&Date
					^Boolean
				*/

				// TODO: Push each of these off into their own functions.
				if (tmpLineSplit[0].length > 1)
				{
					tmpColumn.Column = tmpLineSplit[0].substring(1);
				}
				else
				{
					tmpColumn.Column = pFable.DDLParserState.CurrentScope+'_UnknownColumn_'+tmpColumnCount;
				}

				// This parses each line looking for column definitions
				switch(tmpLineTypeCharacter)
				{
					case '@':
						// ### Identity column
						tmpLineType = 'Column';
						tmpColumn.DataType = 'ID';
						break;

					case '%':
						// ### GUID
						tmpLineType = 'Column';
						tmpColumn.DataType = 'GUID';
						break;

					case '$':
						// ### String
						tmpLineType = 'Column';
						tmpColumn.DataType = 'String';
						tmpColumn.Size = '64';
						// Test if there are more than 1 parameters and the second is numeric
						if ((tmpLineSplit.length > 1) && (tmpLineSplit[1].match(/^[0-9]+$/) !== null))
						{
							// Override the default size if so
							tmpColumn.Size = tmpLineSplit[1];
						}
						break;

					case '#':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpColumn.DataType = 'Numeric';
						// Test if there are more than 1 parameters and the second is numeric
						if ((tmpLineSplit.length > 1) && (tmpLineSplit[1].match(/^[0-9]+$/) !== null))
						{
							// Override the default size if so
							tmpColumn.Size = tmpLineSplit[1];
						}
						break;

					case '.':
						// ### Decimal Number
						tmpLineType = 'Column';
						tmpColumn.DataType = 'Decimal';
						tmpColumn.Size = '10,3';
						// Test if there are more than 1 parameters and the second is numeric with a comma
						if ((tmpLineSplit.length > 1) && (tmpLineSplit[1].match(/^[0-9,]+$/) !== null))
						{
							// Override the default size if so
							tmpColumn.Size = tmpLineSplit[1];
						}
						break;

					case '*':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpColumn.DataType = 'Text';
						break;

					case '&':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpColumn.DataType = 'DateTime';
						break;

					case '^':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpColumn.DataType = 'Boolean';
						break;

					case '^':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpColumn.DataType = 'Boolean';
						break;
				}
				// Detect a join definition
				if (tmpLineSplit.length > 2)
				{
					if (tmpLineSplit[tmpLineSplit.length - 2] == '->')
					{
						tmpColumn.Join = tmpLineSplit[tmpLineSplit.length - 1];
					}
				}

				// Now deal with the collected state about the line
				if (tmpLineType === 'Column')
				{
					pFable.Stricture.Tables[pFable.DDLParserState.CurrentScope].Columns.push(tmpColumn);
				}
				if (tmpLineType === 'Comment')
				{
					// This line is not recognized and not empty, so we are going to treat it like a comment.
					if (tmpLine !== '')
					{
						console.log('  > Comment on line #'+pFable.DDLParserState.LineCount+': '+tmpLine);
					}
				}
			}

			tmpLineReader.resume();
		}
	);

	tmpLineReader.on('end',
		function ()
		{
			console.log('  > Compilation complete for '+pFileName);
			fComplete();
		}
	);
};

/***********
 * MicroDDL Compiler
 *
 *****/
 var CompileMicroDDL = function(pFable)
 {
	var tmpStrictureModelFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'.json';
	var tmpStrictureModelExtendedFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'-Extended.json';

	pFable.Stricture = (
		{
			// This hash table will hold the model
			Tables: {},

			// This array will hold the order for the tables in the model, so they match the order they are first introduced to Stricture
			TablesSequence: [],

			// This hash table will hold the authenticator configuration for the entire model
			Authentication: {},

			// This hash table will hold the meadow endpoint configuration for the entire model
			Endpoints: {},

			Pict: {}
		}
	);

	console.info('--> Compiling MicroDDL to JSON');
	console.log('  > Input file:  '+pFable.settings.InputFileName);
	console.log('  > Output file: '+tmpStrictureModelFile);
	console.log('  > Extended Output file: '+tmpStrictureModelExtendedFile);

	// Read in the file
	console.info('  > Reading DDL File(s)');				
	ReadMicroDDLFile(pFable, pFable.settings.InputFileName, 
		function()
		{
			// Generate the output
			console.info('  > Metacompiling the Model');	
			libJSONFile.writeFile(tmpStrictureModelFile,
				{Tables: pFable.Stricture.Tables},
				{spaces: 4},
				function(pError) 
				{
					if (pError)
					{
						console.error('  > Error writing out model JSON: '+pError);
					}
					else
					{
						console.info('  > Model JSON Successfully Written');				
					}
				}
			);

			// Generate the output
			console.info('  > Compiling the Extended Model');
			libJSONFile.writeFile(tmpStrictureModelExtendedFile,
				pFable.Stricture,
				{spaces: 4},
				function(pError) 
				{
					if (pError)
					{
						console.error('  > Error writing out model JSON: '+pError);
					}
					else
					{
						console.info('  > Extended Model JSON Successfully Written');				
					}
				}
			);
		}
	);
};

module.exports = CompileMicroDDL;
