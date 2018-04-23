/**
* Stricture - Generator - Meadow Schema File
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');
var libAsync = require('async');

/***********
 * Meadow generation
 *****/
var GenerateMeadow = function(pFable)
{
	// Use the output file as the prefix
	var tmpMeadowFileLocation = pFable.settings.OutputLocation+pFable.settings.OutputFileName;

	console.log('--> Building the Meadow model description files...');

	libAsync.each
	(
		pFable.Model.Tables,
		function(pRecord, pQueueCallback)
		{
			var tmpTable = pRecord;

			console.log('  > Table: '+tmpTable.TableName);

			var tmpPrimaryKey = 'ID'+tmpTable.TableName;

			// Get the primary key
			for (var j = 0; j < tmpTable.Columns.length; j++)
				if (tmpTable.Columns[j].DataType == 'ID')
					tmpPrimaryKey = tmpTable.Columns[j].Column;

			var tmpModel = ({
				Scope: tmpTable.TableName,
				DefaultIdentifier: tmpPrimaryKey,

				Domain: (typeof(tmpTable.Domain) === 'undefined') ? 'Default' : tmpTable.Domain,

				Schema: [],

				DefaultObject: {},

				JsonSchema: ({
					title: tmpTable.TableName,
					type: 'object',
					properties: {},
					required: []
				}),

				Authorization: {}
			});
			for (var j = 0; j < tmpTable.Columns.length; j++)
			{
				var tmpColumnName = tmpTable.Columns[j].Column;
				var tmpColumnType = tmpTable.Columns[j].DataType;

				var tmpSchemaEntry = {Column:tmpColumnName, Type:'Default'};
				// Dump out each column......
				switch (tmpColumnType)
				{
					case 'ID':
						tmpSchemaEntry.Type = 'AutoIdentity';
						tmpModel.DefaultObject[tmpColumnName] = 0;
						tmpModel.JsonSchema.properties[tmpColumnName] = {type: 'integer'}
						tmpModel.JsonSchema.required.push(tmpColumnName);
						break;
					case 'GUID':
						tmpSchemaEntry.Type = 'AutoGUID';
						tmpModel.DefaultObject[tmpColumnName] = '0x0000000000000000';
						tmpModel.JsonSchema.properties[tmpColumnName] = {type: 'string'}
						break;
					case 'ForeignKey':
						tmpSchemaEntry.Type = 'Integer';
						tmpModel.DefaultObject[tmpColumnName] = 0;
						tmpModel.JsonSchema.properties[tmpColumnName] = {type: 'integer'}
						tmpModel.JsonSchema.required.push(tmpColumnName);
						break;
					case 'Numeric':
						tmpSchemaEntry.Type = 'Integer';
						tmpModel.DefaultObject[tmpColumnName] = 0;
						tmpModel.JsonSchema.properties[tmpColumnName] = {type: 'integer'}
						break;
					case 'Decimal':
						tmpSchemaEntry.Type = 'Decimal';
						tmpModel.DefaultObject[tmpColumnName] = 0.0;
						tmpModel.JsonSchema.properties[tmpColumnName] = {type: 'number'}
						break;
					case 'String':
					case 'Text':
						tmpSchemaEntry.Type = 'String';
						tmpModel.DefaultObject[tmpColumnName] = '';
						tmpModel.JsonSchema.properties[tmpColumnName] = {type: 'string'}
						break;
					case 'DateTime':
						tmpSchemaEntry.Type = 'DateTime';
						tmpModel.DefaultObject[tmpColumnName] = null;
						tmpModel.JsonSchema.properties[tmpColumnName] = {type: 'string'}
						break;
					case 'Boolean':
						tmpSchemaEntry.Type = 'Boolean';
						tmpModel.DefaultObject[tmpColumnName] = false;
						tmpModel.JsonSchema.properties[tmpColumnName] = {type: 'boolean'}
						break;
				}
				// Now mark up the magic columns that branch by name
				switch (tmpColumnName)
				{
					case 'CreateDate':
						tmpSchemaEntry.Type = 'CreateDate';
						break;
					case 'CreatingIDUser':
						tmpSchemaEntry.Type = 'CreateIDUser';
						break;
					case 'UpdateDate':
						tmpSchemaEntry.Type = 'UpdateDate';
						break;
					case 'UpdatingIDUser':
						tmpSchemaEntry.Type = 'UpdateIDUser';
						break;
					case 'DeleteDate':
						tmpSchemaEntry.Type = 'DeleteDate';
						break;
					case 'DeletingIDUser':
						tmpSchemaEntry.Type = 'DeleteIDUser';
						break;
					case 'Deleted':
						tmpSchemaEntry.Type = 'Deleted';
						break;
				}
				// Now add it to the array
				tmpModel.Schema.push(tmpSchemaEntry);
			}
			// Now add authorizers if they exist
			if (pFable.Model.hasOwnProperty('Authorization') && pFable.Model.Authorization.hasOwnProperty(tmpTable.TableName))
			{
				tmpModel.Authorization = pFable.Model.Authorization[tmpTable.TableName];
			}

			// Now persist our schema
			libFS.writeFile(tmpMeadowFileLocation+tmpModel.Scope+".json", JSON.stringify(tmpModel, null, 4), "utf8", pQueueCallback);
 		},
		function(pError)
		{
			if (pError)
				console.log('#### ERROR PERSISTING SCHEMA: '+pError);
		}
	);
}

module.exports = GenerateMeadow;
