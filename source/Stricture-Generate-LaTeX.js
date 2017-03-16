/**
* Stricture - Generator - LaTeX Documentation
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');

/***********
 * LaTeX generation
 *****/
 var GenerateLaTeXDictionary = function(pFable)
 {
	var tmpLaTeXFolder = pFable.settings.OutputLocation;
	var tmpTableFile = tmpLaTeXFolder+pFable.settings.OutputFileName+'-Tables.tex';
	var tmpChangeTrackingFile = tmpLaTeXFolder+pFable.settings.OutputFileName+'-ChangeTracking.tex';

	console.log('--> Building the data model file...');
	console.log('  > Raw Tables');
	libFS.writeFileSync(tmpTableFile, '%% Data Model -- Generated '+new Date().toJSON()+"\n");
	libFS.appendFileSync(tmpTableFile, "\\part{Table Definitions}\n");
	for(var tmpTable in pFable.Model.Tables)
	{
		libFS.appendFileSync(tmpTableFile, "\n\\section{"+pFable.Model.Tables[tmpTable].TableName+"}\n");
		libFS.appendFileSync(tmpTableFile, "\\begin{small}\n");
		libFS.appendFileSync(tmpTableFile, "\\begin{tabularx}{\\textwidth}{ l r l X }\n");
		libFS.appendFileSync(tmpTableFile, "\\textbf{Column Name} & \\textbf{Size} & \\textbf{Data Type} & \\textbf{Notes} \\\\ \\hline \n");
		for (var j = 0; j < pFable.Model.Tables[tmpTable].Columns.length; j++)
		{
			// Dump out each column......
			var tmpSize = (pFable.Model.Tables[tmpTable].Columns[j].Size == undefined) ? '' : pFable.Model.Tables[tmpTable].Columns[j].Size;

			var tmpJoin = (pFable.Model.Tables[tmpTable].Columns[j].Join == undefined) ? '' : 'Joined to '+pFable.ModelIndices[pFable.Model.Tables[tmpTable].Columns[j].Join]+'.'+pFable.Model.Tables[tmpTable].Columns[j].Join;
			var tmpTableJoin = (!pFable.Model.Tables[tmpTable].Columns[j].hasOwnProperty('TableJoin')) ? '' : 'Joins to '+pFable.Model.Tables[tmpTable].Columns[j].TableJoin;
			var tmpNotes = (!pFable.Model.Tables[tmpTable].Columns[j].hasOwnProperty('Description')) ? '' : pFable.Model.Tables[tmpTable].Columns[j].Description;

			var tmpDescription = tmpJoin;
			if (tmpJoin.length > 0)
				tmpDescription += "\n";
			tmpDescription += tmpTableJoin;
			if (tmpTableJoin.length > 0)
				tmpDescription += "\n";
			tmpDescription += tmpNotes;
			libFS.appendFileSync(tmpTableFile, pFable.Model.Tables[tmpTable].Columns[j].Column+" & "+tmpSize+" & "+pFable.Model.Tables[tmpTable].Columns[j].DataType+" & "+tmpDescription+" \\\\ \n");
		}
		libFS.appendFileSync(tmpTableFile, "\\end{tabularx}\n");
		libFS.appendFileSync(tmpTableFile, "\\end{small}\n");
	}
	console.log('  > Table Change Tracking');
	libFS.writeFileSync(tmpChangeTrackingFile, '%% Data Model -- Generated '+new Date().toJSON()+"\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\part{Implicit Table Change Tracking}\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\begin{small}\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\begin{tabular}{ p{5cm} c c c }\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\textbf{Table} & \\textbf{Create} & \\textbf{Update} & \\textbf{Delete} \\\\ \\hline \n");
	for(var tmpTable in pFable.Model.Tables)
	{
		var tmpDelete = '';
		var tmpUpdate = '';
		var tmpCreate = '';

		for (var j = 0; j < pFable.Model.Tables[tmpTable].Columns.length; j++)
		{
			switch (pFable.Model.Tables[tmpTable].Columns[j].Column)
			{
				case 'UpdateDate':
					tmpUpdate = 'X';
					break;
				case 'Deleted':
					tmpDelete = 'X';
					break;
				case 'CreateDate':
					tmpCreate = 'X';
					break;
			}
		}
		libFS.appendFileSync(tmpChangeTrackingFile, pFable.Model.Tables[tmpTable].TableName+" & "+tmpCreate+" & "+tmpUpdate+" & "+tmpDelete+" \\\\ \n");
	}
	libFS.appendFileSync(tmpChangeTrackingFile, "\\end{tabular}\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\end{small}\n");
}

module.exports = GenerateLaTeXDictionary;