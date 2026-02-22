/**
 * Stricture TUI View - Compile Output
 *
 * Displays compilation log output and DDL preview content.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */
const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: 'TUI-CompileOutput',

	DefaultRenderable: 'TUI-CompileOutput-Content',
	DefaultDestinationAddress: '#TUI-Content',
	DefaultTemplateRecordAddress: 'AppData.TUI',

	AutoRender: false,

	Templates:
	[
		{
			Hash: 'TUI-CompileOutput-Template',
			Template: ''
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'TUI-CompileOutput-Content',
			TemplateHash: 'TUI-CompileOutput-Template',
			ContentDestinationAddress: '#TUI-Content',
			RenderMethod: 'replace'
		}
	]
};

class StrictureViewTUICompileOutput extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable)
	{
		let tmpTUI = this.pict.AppData.TUI;
		let tmpContent = tmpTUI.CompileLog || '{bold}No compilation output yet.{/bold}\n\nPress {yellow-fg}c{/yellow-fg} to compile.';

		this.pict.ContentAssignment.assignContent('#TUI-Content', tmpContent);

		return super.onAfterRender(pRenderable);
	}
}

module.exports = StrictureViewTUICompileOutput;
module.exports.default_configuration = _ViewConfiguration;
