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

	console.log('--> Building the markdown data model documentation...');
	console.log('  > Tables of Contents');
	// TODO: Change this to underscore templates.
	libFS.writeFileSync(tmpTableFile, '##### {DocumentationIndex|Home} > {Model/DataModel|Data Model} > {Model/Dictionary/Dictionary|Data Dictionary}'+"\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, "Headlight Data Dictionary\n");
	libFS.appendFileSync(tmpTableFile, "=========================\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, "Each entry below describes a single table in the Headlight database.\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, "Table | Column Count \n");
	libFS.appendFileSync(tmpTableFile, "----- | -----------: \n");
	for(var i = 0; i < pFable.Model.Tables.length; i++)
		libFS.appendFileSync(tmpTableFile, "{Model/Dictionary/Model-"+pFable.Model.Tables[i].TableName+"|"+pFable.Model.Tables[i].TableName+"} | "+pFable.Model.Tables[i].Columns.length+"\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, "- - -\n");
	libFS.appendFileSync(tmpTableFile, "\n");
	libFS.appendFileSync(tmpTableFile, 'Generated on '+formatMarkdownTime()+''+"\n");

	console.log('  > Raw Tables');
	for(var i = 0; i < pFable.Model.Tables.length; i++)
	{
		var tmpTableModelFile = tmpMarkdownFolder+'Model-'+pFable.Model.Tables[i].TableName+'.md';
		libFS.writeFileSync(tmpTableModelFile, '##### {DocumentationIndex|Home} > {Model/DataModel|Data Model} > {Model/Dictionary/Dictionary|Data Dictionary} > {Model/Dictionary/Model-'+pFable.Model.Tables[i].TableName+'|'+pFable.Model.Tables[i].TableName+' Table}'+"\n");
		libFS.appendFileSync(tmpTableModelFile, "\n");
		libFS.appendFileSync(tmpTableModelFile, pFable.Model.Tables[i].TableName+"\n");
		libFS.appendFileSync(tmpTableModelFile, "===\n");
		libFS.appendFileSync(tmpTableModelFile, "\n");
		libFS.appendFileSync(tmpTableModelFile, "Column Name | Size | Data Type | Join \n");
		libFS.appendFileSync(tmpTableModelFile, "----------- | ---: | --------- | ---- \n");
		for (var j = 0; j < pFable.Model.Tables[i].Columns.length; j++)
		{
			// Dump out each column......
			var tmpSize = (pFable.Model.Tables[i].Columns[j].Size == undefined) ? '' : pFable.Model.Tables[i].Columns[j].Size;
			var tmpJoin = (pFable.Model.Tables[i].Columns[j].Join == undefined) ? '' : pFable.ModelIndices[pFable.Model.Tables[i].Columns[j].Join]+'.'+pFable.Model.Tables[i].Columns[j].Join;
			libFS.appendFileSync(tmpTableModelFile, pFable.Model.Tables[i].Columns[j].Column+" | "+tmpSize+" | "+pFable.Model.Tables[i].Columns[j].DataType+" | "+tmpJoin+" \n");
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
	libFS.appendFileSync(tmpChangeTrackingFile, "The following table describes which Headlight tables have implicit create, update and delete change tracking (provided by the API architecture).  This does not include any kind of media archival or record longitudinal backups; just timestamps and user stamps for the last action of each type.\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "Table | Create | Update | Delete \n");
	libFS.appendFileSync(tmpChangeTrackingFile, "----- | :----: | :----: | :----: \n");
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
		libFS.appendFileSync(tmpChangeTrackingFile, pFable.Model.Tables[i].TableName+" | "+tmpCreate+" | "+tmpUpdate+" | "+tmpDelete+" \n");
	}
	libFS.appendFileSync(tmpChangeTrackingFile, "- - -\n");
	libFS.appendFileSync(tmpChangeTrackingFile, "\n");
	libFS.appendFileSync(tmpChangeTrackingFile, 'Generated on '+formatMarkdownTime()+''+"\n");
};

module.exports = GenerateMarkdownDictionary;
