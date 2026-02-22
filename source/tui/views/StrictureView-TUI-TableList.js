/**
 * Stricture TUI View - Table List
 *
 * Manages the sidebar list of table names. The actual blessed list widget
 * is populated by the main TUI app; this view just provides the pict
 * view lifecycle hooks.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: 'TUI-TableList',

	DefaultRenderable: 'TUI-TableList-Content',
	DefaultDestinationAddress: '#TUI-TableList',
	DefaultTemplateRecordAddress: 'AppData.TUI',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'TUI-TableList-Template',
			Template: ''
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'TUI-TableList-Content',
			TemplateHash: 'TUI-TableList-Template',
			ContentDestinationAddress: '#TUI-TableList',
			RenderMethod: 'replace'
		}
	]
};

class StrictureViewTUITableList extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = StrictureViewTUITableList;
module.exports.default_configuration = _ViewConfiguration;
