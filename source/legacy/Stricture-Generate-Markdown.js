/**
* Stricture - Generator - Markdown Documentation
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');

var formatMarkdownTime = function(pDate)
{
	// Left zerofill minifunction
	var fPad = function(pPadding)
	{
		return (''+pPadding).length <2?'0'+pPadding:''+pPadding;
	};

	if (typeof pDate === 'undefined')
		var pDate = new Date();

	return pDate.getFullYear()+'-'+fPad(pDate.getMonth()+1)+'-'+fPad(pDate.getDate())+' at '+fPad(pDate.getHours())+':'+fPad(pDate.getMinutes());
};

/***********
 * Markdown generation
 *****/
var GenerateMarkdownDictionary = function(pFable)
{
	var tmpMarkdownFolder = pFable.settings.OutputLocation;
	var tmpTableFile = tmpMarkdownFolder+'Dictionary.md';
	var tmpChangeTrackingFile = tmpMarkdownFolder+'ModelChangeTracking.md';

	// This generates markdown with wiki add-ins compatible with the orator-wiki project.

	console.log('--> Building the markdown data model documentation...');
	console.log('  > Tables of Contents');
	// TODO: Change this to underscore templates.
	libFS.writeFileSync(tmpTableFile, '##### {DocumentationIndex|Home} > {Model/DataModel|Data Model} > {Model/Dictionary/Dictionary|Data Dictionary}'+"\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, "Data Dictionary\n");
	libFS.appendFileSync(tmpTableFile, "=========================\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, "Each entry below describes a single table in the database.\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, "Table | Column Count \n");
	libFS.appendFileSync(tmpTableFile, "----- | -----------: \n");
	for(var tmpTable in pFable.Model.Tables)
		libFS.appendFileSync(tmpTableFile, "{Model/Dictionary/Model-"+pFable.Model.Tables[tmpTable].TableName+"|"+pFable.Model.Tables[tmpTable].TableName+"} | "+pFable.Model.Tables[tmpTable].Columns.length+"\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, "- - -\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, 'Generated on '+formatMarkdownTime()+''+"\n");

	console.log('  > Raw Tables');
	for(var tmpTable in pFable.Model.Tables)
	{
		var tmpTableModelFile = tmpMarkdownFolder+'Model-'+pFable.Model.Tables[tmpTable].TableName+'.md';
		libFS.writeFileSync(tmpTableModelFile, '##### {DocumentationIndex|Home} > {Model/DataModel|Data Model} > {Model/Dictionary/Dictionary|Data Dictionary} > {Model/Dictionary/Model-'+pFable.Model.Tables[tmpTable].TableName+'|'+pFable.Model.Tables[tmpTable].TableName+' Table}'+"\n");
		libFS.appendFileSync(tmpTableModelFile, "\n");
		libFS.appendFileSync(tmpTableModelFile, pFable.Model.Tables[tmpTable].TableName+"\n");
		libFS.appendFileSync(tmpTableModelFile, "===\n");
		libFS.appendFileSync(tmpTableModelFile, "\n");
		libFS.appendFileSync(tmpTableModelFile, "Column Name | Size | Data Type | Join \n");
		libFS.appendFileSync(tmpTableModelFile, "----------- | ---: | --------- | ---- \n");
		for (var j = 0; j < pFable.Model.Tables[tmpTable].Columns.length; j++)
		{
			// Dump out each column......
			var tmpSize = (pFable.Model.Tables[tmpTable].Columns[j].Size == undefined) ? '' : pFable.Model.Tables[tmpTable].Columns[j].Size;
			var tmpJoin = (pFable.Model.Tables[tmpTable].Columns[j].Join == undefined) ? '' : pFable.ModelIndices[pFable.Model.Tables[tmpTable].Columns[j].Join]+'.'+pFable.Model.Tables[tmpTable].Columns[j].Join;
			libFS.appendFileSync(tmpTableModelFile, pFable.Model.Tables[tmpTable].Columns[j].Column+" | "+tmpSize+" | "+pFable.Model.Tables[tmpTable].Columns[j].DataType+" | "+tmpJoin+" \n");
		}
		libFS.appendFileSync(tmpTableModelFile, "- - -\n");
		libFS.appendFileSync(tmpTableModelFile, "\n");
		libFS.appendFileSync(tmpTableModelFile, 'Generated on '+formatMarkdownTime()+''+"\n");
	}


	console.log('  > Table Change Tracking');
	libFS.writeFileSync(tmpChangeTrackingFile, '##### {DocumentationIndex|Home} > {Model/DataModel|Data Model} > {Model/Dictionary/ModelChangeTracking|Table Change Tracking}'+"\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "Table Change Tracking\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "=====================\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "The following table describes which tables have implicit create, update and delete change tracking (provided by the meadow endpoints API architecture).  This does not include any kind of media archival or record longitudinal backups; just timestamps and user stamps for the last action of each type.\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "Table | Create | Update | Delete \n");
	libFS.appendFileSync(tmpChangeTrackingFile, "----- | :----: | :----: | :----: \n");
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
		libFS.appendFileSync(tmpChangeTrackingFile, pFable.Model.Tables[tmpTable].TableName+" | "+tmpCreate+" | "+tmpUpdate+" | "+tmpDelete+" \n");
	}
	libFS.appendFileSync(tmpChangeTrackingFile, "- - -\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\n");
	libFS.appendFileSync(tmpChangeTrackingFile, 'Generated on '+formatMarkdownTime()+''+"\n");
};

module.exports = GenerateMarkdownDictionary;
