/**
 * Stricture TUI View - Status Bar
 *
 * Renders the bottom status bar showing table count, column count,
 * domain count, and current status message.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: 'TUI-StatusBar',

	DefaultRenderable: 'TUI-StatusBar-Content',
	DefaultDestinationAddress: '#TUI-StatusBar',
	DefaultTemplateRecordAddress: 'AppData.TUI',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'TUI-StatusBar-Template',
			Template: ' Tables: {~D:Record.TableCount~} | Columns: {~D:Record.TotalColumns~} | Domains: {~D:Record.DomainCount~}    View: {~D:Record.CurrentView~} | {~D:Record.StatusMessage~}'
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'TUI-StatusBar-Content',
			TemplateHash: 'TUI-StatusBar-Template',
			ContentDestinationAddress: '#TUI-StatusBar',
			RenderMethod: 'replace'
		}
	]
};

class StrictureViewTUIStatusBar extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = StrictureViewTUIStatusBar;
module.exports.default_configuration = _ViewConfiguration;
