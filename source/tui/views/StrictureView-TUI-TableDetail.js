/**
 * Stricture TUI View - Table Detail
 *
 * Displays detailed information about the currently selected table,
 * including all columns with their data types, sizes, and joins.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: 'TUI-TableDetail',

	DefaultRenderable: 'TUI-TableDetail-Content',
	DefaultDestinationAddress: '#TUI-Content',
	DefaultTemplateRecordAddress: 'AppData.TUI',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'TUI-TableDetail-Template',
			Template: ''
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'TUI-TableDetail-Content',
			TemplateHash: 'TUI-TableDetail-Template',
			ContentDestinationAddress: '#TUI-Content',
			RenderMethod: 'replace'
		}
	]
};

class StrictureViewTUITableDetail extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	/**
	 * Build the table detail display dynamically from the selected table data.
	 */
	onAfterRender(pRenderable)
	{
		let tmpTUI = this.pict.AppData.TUI;
		let tmpTable = tmpTUI.SelectedTableData;

		let tmpContent = '';

		if (!tmpTable)
		{
			tmpContent = '{bold}No table selected.{/bold}\n\nSelect a table from the list on the left.';
		}
		else
		{
			tmpContent += '{bold}Table: {yellow-fg}' + tmpTable.TableName + '{/yellow-fg}{/bold}\n';

			if (tmpTable.Description && tmpTable.Description.length > 0)
			{
				tmpContent += tmpTable.Description + '\n';
			}

			tmpContent += '  Domain: {cyan-fg}' + (tmpTable.Domain || 'Default') + '{/cyan-fg}\n';
			tmpContent += '  Columns: {yellow-fg}' + tmpTable.Columns.length + '{/yellow-fg}\n';
			tmpContent += '\n';
			tmpContent += '──────────────────────────────────────────────────────────────\n';

			// Column header
			let tmpNamePad = '                              ';
			let tmpTypePad = '              ';
			let tmpSizePad = '          ';

			tmpContent += '  {bold}' + ('Column' + tmpNamePad).slice(0, 26) + ('Type' + tmpTypePad).slice(0, 12) + ('Size' + tmpSizePad).slice(0, 8) + 'Join{/bold}\n';
			tmpContent += '──────────────────────────────────────────────────────────────\n';

			for (let j = 0; j < tmpTable.Columns.length; j++)
			{
				let tmpCol = tmpTable.Columns[j];
				let tmpName = (tmpCol.Column + tmpNamePad).slice(0, 26);
				let tmpType = (tmpCol.DataType + tmpTypePad).slice(0, 12);
				let tmpSize = ((tmpCol.Size || '') + tmpSizePad).slice(0, 8);
				let tmpJoin = '';

				if (tmpCol.Join)
				{
					let tmpModelIndices = this.pict.AppData.ModelIndices || {};
					let tmpJoinTable = tmpModelIndices[tmpCol.Join] || '?';
					tmpJoin = '{cyan-fg}' + tmpJoinTable + '.' + tmpCol.Join + '{/cyan-fg}';
				}
				if (tmpCol.TableJoin)
				{
					tmpJoin += (tmpJoin.length > 0 ? ' ' : '') + '{magenta-fg}=> ' + tmpCol.TableJoin + '{/magenta-fg}';
				}

				// Color-code by data type
				let tmpTypeColor = 'white';
				switch (tmpCol.DataType)
				{
					case 'ID': tmpTypeColor = 'green'; break;
					case 'GUID': tmpTypeColor = 'yellow'; break;
					case 'ForeignKey': tmpTypeColor = 'cyan'; break;
					case 'Numeric': tmpTypeColor = 'blue'; break;
					case 'Decimal': tmpTypeColor = 'blue'; break;
					case 'String': tmpTypeColor = 'white'; break;
					case 'Text': tmpTypeColor = 'magenta'; break;
					case 'DateTime': tmpTypeColor = 'yellow'; break;
					case 'Boolean': tmpTypeColor = 'red'; break;
				}

				tmpContent += '  ' + tmpName + '{' + tmpTypeColor + '-fg}' + tmpType + '{/' + tmpTypeColor + '-fg}' + tmpSize + tmpJoin + '\n';
			}

			// Show joins section if any
			let tmpJoins = [];
			for (let j = 0; j < tmpTable.Columns.length; j++)
			{
				if (tmpTable.Columns[j].Join)
				{
					tmpJoins.push(tmpTable.Columns[j]);
				}
			}

			if (tmpJoins.length > 0)
			{
				tmpContent += '\n{bold}Foreign Key Joins:{/bold}\n';
				let tmpModelIndices = this.pict.AppData.ModelIndices || {};
				for (let j = 0; j < tmpJoins.length; j++)
				{
					let tmpJoinTable = tmpModelIndices[tmpJoins[j].Join] || '?';
					tmpContent += '  {cyan-fg}' + tmpJoins[j].Column + '{/cyan-fg} -> ' + tmpJoinTable + '.' + tmpJoins[j].Join + '\n';
				}
			}
		}

		this.pict.ContentAssignment.assignContent('#TUI-Content', tmpContent);

		return super.onAfterRender(pRenderable);
	}
}

module.exports = StrictureViewTUITableDetail;
module.exports.default_configuration = _ViewConfiguration;
