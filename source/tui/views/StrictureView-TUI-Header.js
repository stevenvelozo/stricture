/**
 * Stricture TUI View - Header
 *
 * Renders the title bar with the application name, loaded model file,
 * and keyboard shortcut hints.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: 'TUI-Header',

	DefaultRenderable: 'TUI-Header-Content',
	DefaultDestinationAddress: '#TUI-Header',
	DefaultTemplateRecordAddress: 'AppData.TUI',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'TUI-Header-Template',
			Template: '{center}{bold}Stricture TUI{/bold} - {~D:Record.InputFile~}{/center}\n{center}[O]verview  [C]ompile  [G]enerate  [R]elationships  [D]DL  [Q]uit{/center}'
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'TUI-Header-Content',
			TemplateHash: 'TUI-Header-Template',
			ContentDestinationAddress: '#TUI-Header',
			RenderMethod: 'replace'
		}
	]
};

class StrictureViewTUIHeader extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = StrictureViewTUIHeader;
module.exports.default_configuration = _ViewConfiguration;
