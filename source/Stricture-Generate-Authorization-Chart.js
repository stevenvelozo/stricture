/**
* Stricture - Generator -  CSV Authorization Map
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @module Stricture
*/
var libFS = require('fs');

/***********
 * CSV Authorization Map generation
 *****/
 var GenerateCSVAuthorizationMap = function(pFable)
 {
	var tmpAuthorizorChartFile = pFable.settings.OutputLocation+pFable.settings.OutputFileName+'-Authorizors.csv';

	console.log('--> Building a cache of all Authorizors');
	var tmpAuthorizorCache = {};
	for(var tmpTable in pFable.Model.Authorization)
	{
		for (var tmpRole in pFable.Model.Authorization[tmpTable])
		{
			// Add the role to the cache if we haven't seen it before
			if (!tmpAuthorizorCache.hasOwnProperty(tmpRole))
			{
				tmpAuthorizorCache[tmpRole] = {};
			}

			for (var tmpPermission in pFable.Model.Authorization[tmpTable][tmpRole])
			{
				// Add the permission to the cache if we haven't seen it before
				if (!tmpAuthorizorCache[tmpRole].hasOwnProperty(tmpPermission))
				{
					// TODO: Give the option to keep counts by value here to see how many of each authorizer there is
					tmpAuthorizorCache[tmpRole][tmpPermission] = true;
				}
			}
		}
	}

	// Now build the CSV header, hacky-like
	var tmpCSVHead = 'Authorization for '+pFable.settings.OutputFileName;
	libFS.writeFileSync(tmpAuthorizorChartFile, tmpCSVHead+"\n");

	var tmpCSVRoles = '';
	var tmpCurrentRole = '';
	var tmpCSVPermissions = '';
	for (var tmpRole in tmpAuthorizorCache)
	{
		tmpCSVRoles += ','+tmpRole;
		for (var tmpPermission in tmpAuthorizorCache[tmpRole])
		{
			if (tmpCurrentRole !== tmpRole)
			{
				tmpCurrentRole = tmpRole;
			}
			else
			{
				tmpCSVRoles += ',';
			}
			tmpCSVPermissions += ','+tmpPermission;
		}
	}
	libFS.appendFileSync(tmpAuthorizorChartFile, tmpCSVRoles+"\n");
	libFS.appendFileSync(tmpAuthorizorChartFile, tmpCSVPermissions+"\n");

	// Now enumerate the roles.
	var tmpCSVLine = false;
	for (var tmpTable in pFable.Model.Authorization)
	{
		if (tmpCSVLine)
			libFS.appendFileSync(tmpAuthorizorChartFile, tmpCSVLine+"\n");
		tmpCSVLine = tmpTable;
		for (var tmpRole in tmpAuthorizorCache)
		{
			for (var tmpPermission in tmpAuthorizorCache[tmpRole])
			{
				tmpCSVLine += ',';
				if (pFable.Model.Authorization[tmpTable][tmpRole].hasOwnProperty(tmpPermission))
					tmpCSVLine += '"'+pFable.Model.Authorization[tmpTable][tmpRole][tmpPermission]+'"';
			}
		}
	}
	if (tmpCSVLine)
		libFS.appendFileSync(tmpAuthorizorChartFile, tmpCSVLine+"\n");
}

module.exports = GenerateCSVAuthorizationMap;