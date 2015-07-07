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
	var tmpChangeTrackingFile = tmpLaTeXFolder+pFable.settings.OutputFileName+'Headlight-ChangeTracking.tex';

	console.log('--> Building the data model file...');
	console.log('  > Raw Tables');
	libFS.writeFileSync(tmpTableFile, '%% Data Model -- Generated '+new Date().toJSON()+"\n");
	libFS.appendFileSync(tmpTableFile, "\\part{Table Definitions}\n");
	for(var i = 0; i < pFable.Model.Tables.length; i++)
	{
		libFS.appendFileSync(tmpTableFile, "\n\\section{"+pFable.Model.Tables[i].TableName+"}\n");
		libFS.appendFileSync(tmpTableFile, "\\begin{small}\n");
		libFS.appendFileSync(tmpTableFile, "\\begin{tabular}{ p{5cm} p{1cm} p{3cm}  p{3.75cm} }\n");
		libFS.appendFileSync(tmpTableFile, "\\textbf{Column Name} & \\textbf{Size} & \\textbf{Data Type} & \\textbf{Join} \\\\ \\hline \n");
		for (var j = 0; j < pFable.Model.Tables[i].Columns.length; j++)
		{
			// Dump out each column......
			var tmpSize = (pFable.Model.Tables[i].Columns[j].Size == undefined) ? '' : pFable.Model.Tables[i].Columns[j].Size;
			var tmpJoin = (pFable.Model.Tables[i].Columns[j].Join == undefined) ? '' : pFable.ModelIndices[pFable.Model.Tables[i].Columns[j].Join]+'.'+pFable.Model.Tables[i].Columns[j].Join;
			libFS.appendFileSync(tmpTableFile, pFable.Model.Tables[i].Columns[j].Column+" & "+tmpSize+" & "+pFable.Model.Tables[i].Columns[j].DataType+" & "+tmpJoin+" \\\\ \n");
		}
		libFS.appendFileSync(tmpTableFile, "\\end{tabular}\n");
		libFS.appendFileSync(tmpTableFile, "\\end{small}\n");
	}
	console.log('  > Table Change Tracking');
	libFS.writeFileSync(tmpChangeTrackingFile, '%% Data Model -- Generated '+new Date().toJSON()+"\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\part{Implicit Table Change Tracking}\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\begin{small}\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\begin{tabular}{ p{5cm} c c c }\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\textbf{Table} & \\textbf{Create} & \\textbf{Update} & \\textbf{Delete} \\\\ \\hline \n");
	for(var i = 0; i < pFable.Model.Tables.length; i++)
	{
		var tmpDelete = '';
		var tmpUpdate = '';
		var tmpCreate = '';

		for (var j = 0; j < pFable.Model.Tables[i].Columns.length; j++)
		{
			switch (pFable.Model.Tables[i].Columns[j].Column)
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
		libFS.appendFileSync(tmpChangeTrackingFile, pFable.Model.Tables[i].TableName+" & "+tmpCreate+" & "+tmpUpdate+" & "+tmpDelete+" \\\\ \n");
	}
	libFS.appendFileSync(tmpChangeTrackingFile, "\\end{tabular}\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\\end{small}\n");
}

module.exports = GenerateLaTeXDictionary;