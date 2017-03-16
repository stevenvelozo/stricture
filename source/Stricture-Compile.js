// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/
var libFS = require('fs');
var libPath = require('path');
var libLineReader = require('line-by-line');
var libJSONFile = require('jsonfile');
var libUnderscore = require('underscore');
var libAsync = require('async');

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
		StanzaType: 'None',
		CurrentDomain: 'Default'
	});

	var tmpIncludeFiles = [];

	// Add a scope if it doesn't exist
	var InitializeScope = function(pScopeHash, pFable)
	{
		if (!pFable.Stricture.Tables.hasOwnProperty(pScopeHash))
		{
			pFable.Stricture.Tables[pScopeHash] = { TableName:pScopeHash, Domain:pFable.DDLParserState.CurrentDomain, Columns:[] };
			pFable.Stricture.TablesSequence.push(pScopeHash);

			// Because these objects are all just key/value pairs and no functions/circular references, this is a safe and clean way to make unique copies.
			pFable.Stricture.Endpoints = JSON.parse(JSON.stringify(_DefaultAPIDefinitions));
			pFable.Stricture.Authorization[pScopeHash] = JSON.parse(JSON.stringify(_DefaultAPISecurity));
		}
	};

	var InitializePictScope = function(pScopeHash, pFable)
	{
		if (!pFable.Stricture.Pict.hasOwnProperty(pScopeHash))
		{
			pFable.Stricture.Pict[pScopeHash] = JSON.parse(JSON.stringify(_DefaultPict));
		}
	};

	var ParseComplexProperties = function(pLine, pEntries)
	{
		var tmpKey = '';
		var tmpValue = '';

		var tmpToken = 0;
		var tmpPrefix = true;    // Used to determine if we are before or after the :
		var tmpInQuotes = false; // Used to track the state of if we are quoted or not.

		var tmpLineType = 'ValueSet';

		if ((pLine.charAt(0) === '(') && (pLine.charAt(pLine.length-1) === ')'))
		{
			// This is the "Title" stanza, which is an underscore template.
			tmpLineType = 'Title';
			pEntries.TitleTemplate = pLine.substr(1, pLine.length-2);
		}
		else if (pLine.charAt(0) === ':')
		{
			tmpLineType = 'Property';

			var tmpAssignmentLocation = pLine.indexOf('=');
			console.log('LOCATION '+tmpAssignmentLocation)
			pEntries.PropertyName = pLine.substr(1,tmpAssignmentLocation-1).trim();
			pEntries.PropertyValue = pLine.substr(tmpAssignmentLocation+1,pLine.length-tmpAssignmentLocation).trim();
			if (pEntries.PropertyValue === "false")
			{
				pEntries.PropertyValue = false;
			}
			if (pEntries.PropertyValue === "true")
			{
				pEntries.PropertyValue = true;
			}
		}
		else
		{
			// Parse the extra properties for the column
			for (var i = 0; i < pLine.length; i++)
			{
				// Walk each character.  Yes this is a horrible parsing technique.  Yes it works for now.
				var tmpCharacter = pLine.charAt(i);
				//console.log(' > Parsing character '+tmpCharacter)

				if (!tmpInQuotes && (tmpCharacter === ' '))
				{
					//console.log(' > TOKEN ['+tmpToken+']: '+tmpKey+' => '+tmpValue)
					if ((tmpToken > 0) && (tmpKey != ''))
					{
						pEntries[tmpKey] = tmpValue;
					}
					tmpToken++;

					tmpKey = '';
					tmpValue = '';
					tmpPrefix = true;
				}
				else if (tmpCharacter === '"')
				{
					// Ignore quotes.
					tmpInQuotes = !tmpInQuotes;
				}
				else if (tmpPrefix && (tmpCharacter === ':'))
				{
					tmpPrefix = false;
				}
				else if (tmpPrefix)
				{
					tmpKey += tmpCharacter;
				}
				else
				{
					tmpValue += tmpCharacter;
				}
			}
			if ((tmpToken > 0) && (tmpKey != ''))
			{
				pEntries[tmpKey] = tmpValue;
			}
		}
		return tmpLineType;
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
				// Check for a comment
				if (tmpLine.charAt(0) === '/')
				{
					// Skip comments
				}
				// Check for an extended stanza
				else if ((tmpLineSplit[0] === '[Domain') && (tmpLine.charAt(tmpLine.length-1) === ']'))
				{
					// Change of domain, not stanza.
					pFable.DDLParserState.CurrentDomain = tmpLineSplit[1].substring(0, tmpLineSplit[1].length-1);
					// Add the table to the model if it doesn't exist.
					InitializeScope(pFable.DDLParserState.CurrentScope, pFable);
					console.log('  > Line #'+pFable.DDLParserState.LineCount+' changes the domain: '+pFable.DDLParserState.CurrentDomain);
				}
				else if ((tmpLineSplit[0] === '[Authorization') && (tmpLine.charAt(tmpLine.length-1) === ']'))
				{
					pFable.DDLParserState.StanzaType = 'ExtendedStanza-Authorization';
					pFable.DDLParserState.CurrentScope = tmpLineSplit[1].substring(0, tmpLineSplit[1].length-1);
					// Add the table to the model if it doesn't exist.
					InitializeScope(pFable.DDLParserState.CurrentScope, pFable);
					console.log('  > Line #'+pFable.DDLParserState.LineCount+' begins authorizor stanza: '+pFable.DDLParserState.CurrentScope);
				}
				else if ((tmpLineSplit[0] === '[PICT-Create') && (tmpLine.charAt(tmpLine.length-1) === ']'))
				{
					pFable.DDLParserState.StanzaType = 'ExtendedStanza-Pict-Create';
					pFable.DDLParserState.CurrentScope = tmpLineSplit[1].substring(0, tmpLineSplit[1].length-1);
					// Add the table to the model if it doesn't exist.
					InitializePictScope(pFable.DDLParserState.CurrentScope, pFable);
					console.log('  > Line #'+pFable.DDLParserState.LineCount+' begins PICT Create stanza: '+pFable.DDLParserState.CurrentScope);
				}
				else if ((tmpLineSplit[0] === '[PICT-List') && (tmpLine.charAt(tmpLine.length-1) === ']'))
				{
					pFable.DDLParserState.StanzaType = 'ExtendedStanza-Pict-List';
					pFable.DDLParserState.CurrentScope = tmpLineSplit[1].substring(0, tmpLineSplit[1].length-1);
					// Add the table to the model if it doesn't exist.
					InitializePictScope(pFable.DDLParserState.CurrentScope, pFable);
					console.log('  > Line #'+pFable.DDLParserState.LineCount+' begins PICT List stanza: '+pFable.DDLParserState.CurrentScope);
				}
				else if ((tmpLineSplit[0] === '[PICT-Record') && (tmpLine.charAt(tmpLine.length-1) === ']'))
				{
					pFable.DDLParserState.StanzaType = 'ExtendedStanza-Pict-Record';
					pFable.DDLParserState.CurrentScope = tmpLineSplit[1].substring(0, tmpLineSplit[1].length-1);
					// Add the table to the model if it doesn't exist.
					InitializePictScope(pFable.DDLParserState.CurrentScope, pFable);
					console.log('  > Line #'+pFable.DDLParserState.LineCount+' begins PICT Record stanza: '+pFable.DDLParserState.CurrentScope);
				}
				else if ((tmpLineSplit[0] === '[PICT-Update') && (tmpLine.charAt(tmpLine.length-1) === ']'))
				{
					pFable.DDLParserState.StanzaType = 'ExtendedStanza-Pict-Update';
					pFable.DDLParserState.CurrentScope = tmpLineSplit[1].substring(0, tmpLineSplit[1].length-1);
					// Add the table to the model if it doesn't exist.
					InitializePictScope(pFable.DDLParserState.CurrentScope, pFable);
					console.log('  > Line #'+pFable.DDLParserState.LineCount+' begins PICT Update stanza: '+pFable.DDLParserState.CurrentScope);
				}
				else if ((tmpLineSplit[0] === '[PICT-Delete') && (tmpLine.charAt(tmpLine.length-1) === ']'))
				{
					pFable.DDLParserState.StanzaType = 'ExtendedStanza-Pict-Delete';
					pFable.DDLParserState.CurrentScope = tmpLineSplit[1].substring(0, tmpLineSplit[1].length-1);
					// Add the table to the model if it doesn't exist.
					InitializePictScope(pFable.DDLParserState.CurrentScope, pFable);
					console.log('  > Line #'+pFable.DDLParserState.LineCount+' begins PICT Delete stanza: '+pFable.DDLParserState.CurrentScope);
				}
				// Check for an include file
				else if ((tmpLineSplit[0] === '[Include') && (tmpLine.charAt(tmpLine.length-1) === ']'))
				{
					// This is not a stanza, it just forks off another read midflow
					var tmpIncludeFile = tmpLineSplit[1].substring(0, tmpLineSplit[1].length-1);
					console.log('  > Line #'+pFable.DDLParserState.LineCount+' references include stanza: '+tmpIncludeFile);
					var tmpIncludeFilePath = libPath.dirname(pFileName)+'/'+tmpIncludeFile;
					console.log('  > Adding file '+libPath.dirname(pFileName)+'/'+tmpIncludeFile+' to includes.');
					tmpIncludeFiles.push(tmpIncludeFilePath);
				}
				else
				{
					// We are ignoring all lines that aren't in table stanzas
					if ((tmpLine.charAt(0) !== '!'))
					{
						// Tell the user that they typed something that was ignored.
						console.error('  > Compiler ignoring line #'+pFable.DDLParserState.LineCount+' because it is not within a table stanza.');
						console.error('    Content: '+tmpLine);
					}
				}
			}
			else if (pFable.DDLParserState.StanzaType == 'ExtendedStanza-Authorization')
			{
				// We are expecting at least three tokens
				if (tmpLineSplit.length < 3)
				{
					console.error('  > Compiler ignoring extended line #'+pFable.DDLParserState.LineCount+' because it does not have enough tokens.');
				}
				else
				{
					// Now assign the authorizer.
					if (tmpLineSplit[1] === '*')
					{
						console.log('  > Setting custom authorization for entity '+pFable.DDLParserState.CurrentScope+' - wildcard role definition for', tmpLineSplit[0] + ':');

						for(var roleKey in pFable.Stricture.Authorization[pFable.DDLParserState.CurrentScope])
						{
							if (roleKey !== '__DefaultAPISecurity')
							{
								console.log('  > Setting custom authorization for entity '+pFable.DDLParserState.CurrentScope+' - '+roleKey+'.'+tmpLineSplit[0]+' => '+tmpLineSplit[2]+' [FROM '+pFable.Stricture.Authorization[pFable.DDLParserState.CurrentScope][roleKey][tmpLineSplit[0]]+']');
								pFable.Stricture.Authorization[pFable.DDLParserState.CurrentScope][roleKey][tmpLineSplit[0]] = tmpLineSplit[2];
							}
						}
					}
					// TODO: Deal with lists (arrays?  commas?  slashes?  ... pipes?)
					else if (typeof(pFable.Stricture.Authorization[pFable.DDLParserState.CurrentScope][tmpLineSplit[1]]) === 'undefined')
					{
						console.log('  > Custom authorizer line ignored: '+tmpLine);
					}
					else
					{
						console.log('  > Setting custom authorization for entity '+pFable.DDLParserState.CurrentScope+' - '+tmpLineSplit[1]+'.'+tmpLineSplit[0]+' => '+tmpLineSplit[2]+' [FROM '+pFable.Stricture.Authorization[pFable.DDLParserState.CurrentScope][tmpLineSplit[1]][tmpLineSplit[0]]+']');
						pFable.Stricture.Authorization[pFable.DDLParserState.CurrentScope][tmpLineSplit[1]][tmpLineSplit[0]] = tmpLineSplit[2];
					}
					//console.log(JSON.stringify(pFable.Stricture.Authorization, null, 5));
				}
			}
			else if (pFable.DDLParserState.StanzaType.substr(0,20) == 'ExtendedStanza-Pict-')
			{
				// Figure out which Pict operation this is (Update, Create, Delete, List, Record)
				var tmpPictOperation = pFable.DDLParserState.StanzaType.substr(20,10);
				// The character at index 0 defines the line type
				var tmpLineTypeCharacter = tmpLine.charAt(0);
				if (tmpLineTypeCharacter === '#')
				{
					console.log('  > Adding Pict '+tmpPictOperation+' Section Heading Definition: '+tmpLine);
					var tmpEntry = {Column:tmpLine.substring(1), Type:'SectionHeading'};
					pFable.Stricture.Pict[pFable.DDLParserState.CurrentScope][tmpPictOperation].Columns.push(tmpEntry);
				}
				else
				{
					var tmpEntry = {Column: tmpLineSplit[0]};
					var tmpLineType = ParseComplexProperties(tmpLine, tmpEntry);
					if (tmpLineType === 'Title')
					{
						console.log('  > Setting the title for the '+pFable.DDLParserState.CurrentScope+' -> '+tmpPictOperation+' display');
						pFable.Stricture.Pict[pFable.DDLParserState.CurrentScope][tmpPictOperation].Title = tmpEntry.TitleTemplate;
					}
					else if (tmpLineType == 'Property')
					{
						console.log('  > Setting the '+tmpEntry.PropertyName+' property for the '+pFable.DDLParserState.CurrentScope+' -> '+tmpPictOperation+' display');
						pFable.Stricture.Pict[pFable.DDLParserState.CurrentScope][tmpPictOperation][tmpEntry.PropertyName] = tmpEntry.PropertyValue;
					}
					else
					{
						console.log('  > Adding Pict '+tmpPictOperation+' column for entity '+pFable.DDLParserState.CurrentScope+' '+JSON.stringify(tmpEntry));
						pFable.Stricture.Pict[pFable.DDLParserState.CurrentScope][tmpPictOperation].Columns.push(tmpEntry);
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
				// Detect a table-level join definition
				if (tmpLineSplit.length > 2)
				{
					if (tmpLineSplit[tmpLineSplit.length - 2] == '=>')
					{
						tmpColumn.TableJoin = tmpLineSplit[tmpLineSplit.length - 1];
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
			if (tmpIncludeFiles.length > 0)
			{
				console.log('>>> Processing '+tmpIncludeFiles.length+' include files');
				libAsync.eachSeries(tmpIncludeFiles, 
					function(pIncludeFile, fCallback)
					{
						console.log('--> Processing '+pIncludeFile+' include file');
						ReadMicroDDLFile(pFable, pIncludeFile, fCallback);
					},
					fComplete);
			}
			else
			{
				fComplete();
			}
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
	var tmpStrictureModelPICTFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'-PICT.json';

	pFable.Stricture = (
		{
			// This hash table will hold the model
			Tables: {},

			// This array will hold the order for the tables in the model, so they match the order they are first introduced to Stricture
			TablesSequence: [],

			// This hash table will hold the authenticator configuration for the entire model
			Authorization: {},

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
						console.error('  > Error writing out Extended model JSON: '+pError);
					}
					else
					{
						console.info('  > Extended Model JSON Successfully Written');				
					}
				}
			);

			// Generate the output
			console.info('  > Compiling the PICT Definition');
			libJSONFile.writeFile(tmpStrictureModelPICTFile,
				pFable.Stricture.Pict,
				{spaces: 4},
				function(pError) 
				{
					if (pError)
					{
						console.error('  > Error writing out PICT model JSON: '+pError);
					}
					else
					{
						console.info('  > PICT JSON Successfully Written');				
					}
				}
			);
		}
	);
};

module.exports = CompileMicroDDL;
