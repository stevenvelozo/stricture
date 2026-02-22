/**
 * Stricture TUI View - Relationship Graph
 *
 * Displays an ASCII representation of the table relationships
 * (foreign key joins and table joins) in the model.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: 'TUI-RelationshipGraph',

	DefaultRenderable: 'TUI-RelationshipGraph-Content',
	DefaultDestinationAddress: '#TUI-Content',
	DefaultTemplateRecordAddress: 'AppData.TUI',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'TUI-RelationshipGraph-Template',
			Template: ''
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'TUI-RelationshipGraph-Content',
			TemplateHash: 'TUI-RelationshipGraph-Template',
			ContentDestinationAddress: '#TUI-Content',
			RenderMethod: 'replace'
		}
	]
};

class StrictureViewTUIRelationshipGraph extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	/**
	 * Build an ASCII representation of the model's relationships.
	 */
	onAfterRender(pRenderable)
	{
		let tmpTUI = this.pict.AppData.TUI;
		let tmpModel = tmpTUI.Model;

		let tmpContent = '';

		if (!tmpModel || !tmpModel.Tables)
		{
			tmpContent = '{bold}No model loaded.{/bold}\n\nPress {yellow-fg}c{/yellow-fg} to compile first.';
		}
		else
		{
			let tmpModelIndices = this.pict.AppData.ModelIndices || {};
			let tmpTableNames = Object.keys(tmpModel.Tables);

			tmpContent += '{bold}Table Relationships{/bold}\n';
			tmpContent += '══════════════════════════════════════════\n\n';

			for (let i = 0; i < tmpTableNames.length; i++)
			{
				let tmpTableName = tmpTableNames[i];
				let tmpTable = tmpModel.Tables[tmpTableName];
				let tmpRelations = [];

				for (let j = 0; j < tmpTable.Columns.length; j++)
				{
					let tmpCol = tmpTable.Columns[j];
					if (tmpCol.Join)
					{
						let tmpTargetTable = tmpModelIndices[tmpCol.Join] || '?';
						// Skip standard change-tracking joins for cleaner output
						if (tmpCol.Column !== 'CreatingIDUser' && tmpCol.Column !== 'UpdatingIDUser' && tmpCol.Column !== 'DeletingIDUser')
						{
							tmpRelations.push(
								{
									Column: tmpCol.Column,
									TargetTable: tmpTargetTable,
									TargetColumn: tmpCol.Join,
									Type: 'FK'
								});
						}
					}
					if (tmpCol.TableJoin)
					{
						tmpRelations.push(
							{
								Column: tmpCol.Column,
								TargetTable: tmpCol.TableJoin,
								TargetColumn: '',
								Type: 'TJ'
							});
					}
				}

				// Draw the table box
				let tmpBoxWidth = Math.max(tmpTableName.length + 4, 20);
				let tmpTopBorder = '┌' + '─'.repeat(tmpBoxWidth) + '┐';
				let tmpBottomBorder = '└' + '─'.repeat(tmpBoxWidth) + '┘';
				let tmpNamePad = ' '.repeat(Math.max(0, tmpBoxWidth - tmpTableName.length));

				tmpContent += '{yellow-fg}' + tmpTopBorder + '{/yellow-fg}\n';
				tmpContent += '{yellow-fg}│{/yellow-fg} {bold}' + tmpTableName + '{/bold}' + tmpNamePad.slice(1) + '{yellow-fg}│{/yellow-fg}\n';
				tmpContent += '{yellow-fg}' + tmpBottomBorder + '{/yellow-fg}\n';

				if (tmpRelations.length > 0)
				{
					for (let r = 0; r < tmpRelations.length; r++)
					{
						let tmpRel = tmpRelations[r];
						if (tmpRel.Type === 'FK')
						{
							tmpContent += '  {cyan-fg}└──>{/cyan-fg} ' + tmpRel.Column + ' {cyan-fg}──>{/cyan-fg} {bold}' + tmpRel.TargetTable + '{/bold}.' + tmpRel.TargetColumn + '\n';
						}
						else
						{
							tmpContent += '  {magenta-fg}└══>{/magenta-fg} ' + tmpRel.Column + ' {magenta-fg}══>{/magenta-fg} {bold}' + tmpRel.TargetTable + '{/bold}\n';
						}
					}
				}
				else
				{
					tmpContent += '  {gray-fg}(no relationships){/gray-fg}\n';
				}

				tmpContent += '\n';
			}
		}

		this.pict.ContentAssignment.assignContent('#TUI-Content', tmpContent);

		return super.onAfterRender(pRenderable);
	}
}

module.exports = StrictureViewTUIRelationshipGraph;
module.exports.default_configuration = _ViewConfiguration;
