/**
 * Stricture TUI View - Model Overview
 *
 * Shows a summary of the loaded model: table count, column count,
 * domain list, and a per-table summary with column counts.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: 'TUI-ModelOverview',

	DefaultRenderable: 'TUI-ModelOverview-Content',
	DefaultDestinationAddress: '#TUI-Content',
	DefaultTemplateRecordAddress: 'AppData.TUI',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'TUI-ModelOverview-Template',
			// This is a placeholder; the view builds content dynamically
			Template: ''
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'TUI-ModelOverview-Content',
			TemplateHash: 'TUI-ModelOverview-Template',
			ContentDestinationAddress: '#TUI-Content',
			RenderMethod: 'replace'
		}
	]
};

class StrictureViewTUIModelOverview extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	/**
	 * Build the overview content dynamically from the model data and
	 * write it directly to the content widget.
	 */
	onAfterRender(pRenderable)
	{
		let tmpTUI = this.pict.AppData.TUI;
		let tmpModel = tmpTUI.Model;

		let tmpContent = '';

		if (!tmpModel || !tmpModel.Tables)
		{
			tmpContent = '{bold}No model loaded.{/bold}\n\n';
			tmpContent += 'Press {yellow-fg}c{/yellow-fg} to compile a MicroDDL file.\n';
			tmpContent += 'Input file: ' + (tmpTUI.InputFile || '(none)') + '\n';
		}
		else
		{
			let tmpTableNames = Object.keys(tmpModel.Tables);

			tmpContent += '{bold}Model Overview{/bold}\n';
			tmpContent += '──────────────────────────────────────\n\n';
			tmpContent += '  Tables:  {yellow-fg}' + tmpTableNames.length + '{/yellow-fg}\n';
			tmpContent += '  Columns: {yellow-fg}' + (tmpTUI.TotalColumns || 0) + '{/yellow-fg}\n';
			tmpContent += '  Domains: {yellow-fg}' + (tmpTUI.DomainCount || 1) + '{/yellow-fg}\n';
			tmpContent += '\n';

			// Domain breakdown
			let tmpDomains = {};
			for (let i = 0; i < tmpTableNames.length; i++)
			{
				let tmpDomain = tmpModel.Tables[tmpTableNames[i]].Domain || 'Default';
				if (!tmpDomains[tmpDomain])
				{
					tmpDomains[tmpDomain] = [];
				}
				tmpDomains[tmpDomain].push(tmpTableNames[i]);
			}

			for (let tmpDomain in tmpDomains)
			{
				tmpContent += '{bold}Domain: {cyan-fg}' + tmpDomain + '{/cyan-fg}{/bold}\n';
				for (let i = 0; i < tmpDomains[tmpDomain].length; i++)
				{
					let tmpTN = tmpDomains[tmpDomain][i];
					let tmpColCount = tmpModel.Tables[tmpTN].Columns.length;
					let tmpPad = '                                        ';
					let tmpPaddedName = tmpTN + tmpPad.slice(0, Math.max(1, 30 - tmpTN.length));
					tmpContent += '  ' + tmpPaddedName + '{yellow-fg}' + tmpColCount + ' columns{/yellow-fg}\n';
				}
				tmpContent += '\n';
			}
		}

		// Write content directly to the widget via the content assignment bridge
		this.pict.ContentAssignment.assignContent('#TUI-Content', tmpContent);

		return super.onAfterRender(pRenderable);
	}
}

module.exports = StrictureViewTUIModelOverview;
module.exports.default_configuration = _ViewConfiguration;
