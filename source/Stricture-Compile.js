/**
* Stricture - Compiler from MicroDDL to JSON
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');
var libLineReader = require('line-by-line');

/***********
 * MicroDDL Compiler
 *
 *****/
 var CompileMicroDDL = function(pFable)
 {
	var tmpJSONFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'.json';

	var tmpLineCount = 0;
	var tmpTableCount = 0;
	var tmpPropertyCount = 0;
	var tmpColumnCount = 0;
	var tmpCurrentTable = false;

	console.info('--> Compiling MicroDDL to JSON');
	console.log('  > Input file:  '+pFable.settings.InputFileName)
	console.log('  > Output file: '+tmpJSONFile)

	libFS.appendFileSync(tmpJSONFile, "{\n\t[\n");

	// Parse the file line-by-line
	var tmpLineReader = new libLineReader(pFable.settings.InputFileName);

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

			//console.log('  > Line read: '+pLine);

			tmpLineCount++;
			var tmpLine = pLine.trim();
			var tmpLineSplit = tmpLine.split(' ');

			// If we aren't in a table currently, the only thing we look for is a table start
			if (tmpCurrentTable === false)
			{
				if (tmpLine.charAt(0) === '!')
				{
					// This is a table create statement, grab the table name from the first argument
					tmpCurrentTable = tmpLineSplit[0].substring(1);

					// If it is the first table, start off our file.
					// Otherwise, put in a comma between tables.
					if (tmpTableCount == 0)
					{
						// Write out the beginning of the json file
						libFS.writeFileSync(tmpJSONFile, '{\n  "Tables":\n    [');
					}
					else
					{
						libFS.appendFileSync(tmpJSONFile, ',');
					}

					console.log('  > Line #'+tmpLineCount+' begins table stanza: '+tmpCurrentTable);
					libFS.appendFileSync(tmpJSONFile, '\n      {\n        "TableName": "'+tmpCurrentTable+'",\n        "Columns":\n        [')
					tmpColumnCount = 0;
					tmpTableCount++;
				}
				else
				{
					// We are ignoring all lines that aren't in table stanzas
					if (tmpLine !== '')
					{
						// Tell the user that they typed something that was ignored.
						console.error('  > Compiler ignoring line #'+tmpLineCount+' because it is not within a table stanza.');
					}
				}
			}
			else
			{
				// Blank lines are separators between stanzas of tables
				if (tmpLine === '')
				{
					// Close out of the table stanza
					tmpCurrentTable = false;
					libFS.appendFileSync(tmpJSONFile, "\n        ]\n      }");
				}

				// The character at index 0 defines the line type
				var tmpLineTypeCharacter = tmpLine.charAt(0);
				//console.log('   > Line type character: '+tmpLineTypeCharacter);
				var tmpLineType = 'Comment';
				var tmpLineProperties = {};

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
					tmpLineProperties.Column = tmpLineSplit[0].substring(1);
				}
				else
				{
					tmpLineProperties.Column = tmpCurrentTable+'_UnknownColumn_'+tmpColumnCount;
				}

				// This parses each line looking for column definitions
				switch(tmpLineTypeCharacter)
				{
					case '@':
						// ### Identity column
						tmpLineType = 'Column';
						tmpLineProperties.DataType = 'ID';
						break;

					case '%':
						// ### GUID
						tmpLineType = 'Column';
						tmpLineProperties.DataType = 'GUID';
						break;

					case '$':
						// ### String
						tmpLineType = 'Column';
						tmpLineProperties.DataType = 'String';
						tmpLineProperties.Size = '64';
						// Test if there are more than 1 parameters and the second is numeric
						if ((tmpLineSplit.length > 1) && (tmpLineSplit[1].match(/^[0-9]+$/) !== null))
						{
							// Override the default size if so
							tmpLineProperties.Size = tmpLineSplit[1];
						}
						break;

					case '#':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpLineProperties.DataType = 'Numeric';
						// Test if there are more than 1 parameters and the second is numeric
						if ((tmpLineSplit.length > 1) && (tmpLineSplit[1].match(/^[0-9]+$/) !== null))
						{
							// Override the default size if so
							tmpLineProperties.Size = tmpLineSplit[1];
						}
						break;

					case '.':
						// ### Decimal Number
						tmpLineType = 'Column';
						tmpLineProperties.DataType = 'Decimal';
						tmpLineProperties.Size = '10,3';
						// Test if there are more than 1 parameters and the second is numeric with a comma
						if ((tmpLineSplit.length > 1) && (tmpLineSplit[1].match(/^[0-9,]+$/) !== null))
						{
							// Override the default size if so
							tmpLineProperties.Size = tmpLineSplit[1];
						}
						break;

					case '*':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpLineProperties.DataType = 'Text';
						break;

					case '&':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpLineProperties.DataType = 'DateTime';
						break;

					case '^':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpLineProperties.DataType = 'Boolean';
						break;

					case '^':
						// ### Integer Number
						tmpLineType = 'Column';
						tmpLineProperties.DataType = 'Boolean';
						break;
				}
				// Detect a join definition
				if (tmpLineSplit.length > 2)
				{
					if (tmpLineSplit[tmpLineSplit.length - 2] == '->')
					{
						tmpLineProperties.Join = tmpLineSplit[tmpLineSplit.length - 1];
					}
				}

				if (tmpLineType === 'Comment')
				{
					// This line is not recognized and not empty, so we are going to treat it like a comment.
					if (tmpLine !== '')
					{
						console.log('  > Comment on line #'+tmpLineCount+': '+tmpLine);
					}
				}
				else if (tmpLineType === 'Column')
				{
					if (tmpColumnCount > 0)
					{
						libFS.appendFileSync(tmpJSONFile, ',');
					}
					libFS.appendFileSync(tmpJSONFile, '\n          '+JSON.stringify(tmpLineProperties));
					tmpColumnCount++;
				}
			}

			tmpLineReader.resume();
		}
	);

	tmpLineReader.on('end',
		function ()
		{
			// All lines are read, file is closed now.
			if (tmpCurrentTable !== false)
			{
					libFS.appendFileSync(tmpJSONFile, "\n        ]\n      }");
			}
			libFS.appendFileSync(tmpJSONFile, "\n    ]\n}\n");
			console.log('  > Compilation complete');
		}
	);
};

module.exports = CompileMicroDDL;
