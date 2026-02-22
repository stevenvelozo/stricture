/**
 * Stricture - TUI Application
 *
 * Interactive terminal user interface for browsing, editing and compiling
 * MicroDDL models.  Built on pict-application + pict-terminalui + blessed.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────┐
 *   │  Header (title + nav keys)                       │
 *   ├──────────────┬───────────────────────────────────┤
 *   │  Table List  │  Content (overview / table detail  │
 *   │  (sidebar)   │   / compile log / relationships)  │
 *   ├──────────────┴───────────────────────────────────┤
 *   │  Status Bar                                      │
 *   └──────────────────────────────────────────────────┘
 *
 * Keyboard:
 *   Up/Down  - navigate table list
 *   Enter    - select table → show detail
 *   o        - overview
 *   c        - compile current DDL
 *   g        - generate all outputs
 *   r        - show relationship graph
 *   d        - show MySQL DDL for selected table
 *   q/Ctrl-C - quit
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */

// Suppress blessed's Setulc stderr noise before anything loads
const _origStderrWrite = process.stderr.write;
process.stderr.write = function (pChunk)
{
	if (typeof pChunk === 'string' && pChunk.indexOf('Setulc') !== -1)
	{
		return true;
	}
	return _origStderrWrite.apply(process.stderr, arguments);
};

const blessed = require('blessed');
const libPictApplication = require('pict-application');
const libPictTerminalUI = require('pict-terminalui');

// Views
const libViewLayout = require('./views/StrictureView-TUI-Layout.js');
const libViewHeader = require('./views/StrictureView-TUI-Header.js');
const libViewStatusBar = require('./views/StrictureView-TUI-StatusBar.js');
const libViewModelOverview = require('./views/StrictureView-TUI-ModelOverview.js');
const libViewTableList = require('./views/StrictureView-TUI-TableList.js');
const libViewTableDetail = require('./views/StrictureView-TUI-TableDetail.js');
const libViewCompileOutput = require('./views/StrictureView-TUI-CompileOutput.js');
const libViewRelationshipGraph = require('./views/StrictureView-TUI-RelationshipGraph.js');

/**
 * The Stricture TUI Application.
 *
 * Extends PictApplication and wires up all blessed widgets, pict views,
 * and keyboard navigation for an interactive model-browsing experience.
 */
class StrictureTUIApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {Object|null} */
		this.terminalUI = null;
		/** @type {string} */
		this.currentView = 'Overview';
		/** @type {Object|null} */
		this._tableListWidget = null;
		/** @type {Object|null} */
		this._contentWidget = null;
		/** @type {Object|null} */
		this._screen = null;

		// Register all TUI views
		this.pict.addView('TUI-Layout', libViewLayout.default_configuration, libViewLayout);
		this.pict.addView('TUI-Header', libViewHeader.default_configuration, libViewHeader);
		this.pict.addView('TUI-StatusBar', libViewStatusBar.default_configuration, libViewStatusBar);
		this.pict.addView('TUI-ModelOverview', libViewModelOverview.default_configuration, libViewModelOverview);
		this.pict.addView('TUI-TableList', libViewTableList.default_configuration, libViewTableList);
		this.pict.addView('TUI-TableDetail', libViewTableDetail.default_configuration, libViewTableDetail);
		this.pict.addView('TUI-CompileOutput', libViewCompileOutput.default_configuration, libViewCompileOutput);
		this.pict.addView('TUI-RelationshipGraph', libViewRelationshipGraph.default_configuration, libViewRelationshipGraph);
	}

	/**
	 * After Pict initialization, create the blessed screen, widgets, and
	 * bind keyboard navigation. Then render the initial view.
	 *
	 * @param {function} fCallback
	 */
	onAfterInitializeAsync(fCallback)
	{
		let tmpTUI = this.pict.AppData.TUI;

		// Create the terminal UI bridge
		this.terminalUI = new libPictTerminalUI(this.pict,
			{
				Title: 'Stricture TUI'
			});

		// Create the blessed screen
		this._screen = this.terminalUI.createScreen();

		// Build all blessed widgets
		this._createBlessedLayout(this._screen);

		// Bind keyboard navigation
		this._bindNavigation(this._screen);

		// Render the initial layout
		this.pict.views['TUI-Layout'].render();
		this._screen.render();

		return super.onAfterInitializeAsync(fCallback);
	}

	/**
	 * Create the blessed widget hierarchy and register each widget with
	 * the terminal UI bridge so pict views can target them by address.
	 *
	 * @param {Object} pScreen - The blessed screen instance
	 */
	_createBlessedLayout(pScreen)
	{
		// Application container
		let tmpContainer = blessed.box(
			{
				parent: pScreen,
				top: 0,
				left: 0,
				width: '100%',
				height: '100%'
			});
		this.terminalUI.registerWidget('#TUI-Application-Container', tmpContainer);

		// Header bar (3 rows)
		let tmpHeader = blessed.box(
			{
				parent: pScreen,
				top: 0,
				left: 0,
				width: '100%',
				height: 3,
				tags: true,
				style:
				{
					fg: 'white',
					bg: 'blue',
					bold: true
				}
			});
		this.terminalUI.registerWidget('#TUI-Header', tmpHeader);

		// Sidebar — table list (interactive blessed list)
		this._tableListWidget = blessed.list(
			{
				parent: pScreen,
				top: 3,
				left: 0,
				width: '25%',
				bottom: 1,
				tags: true,
				keys: true,
				vi: true,
				mouse: true,
				border:
				{
					type: 'line'
				},
				style:
				{
					border: { fg: 'cyan' },
					selected: { fg: 'white', bg: 'blue', bold: true },
					item: { fg: 'white' }
				},
				label: ' Tables ',
				scrollbar:
				{
					style: { bg: 'blue' }
				}
			});
		this.terminalUI.registerWidget('#TUI-TableList', this._tableListWidget);

		// Content area
		this._contentWidget = blessed.box(
			{
				parent: pScreen,
				top: 3,
				left: '25%',
				width: '75%',
				bottom: 1,
				tags: true,
				scrollable: true,
				mouse: true,
				keys: true,
				vi: true,
				border:
				{
					type: 'line'
				},
				style:
				{
					border: { fg: 'cyan' }
				},
				label: ' Overview ',
				padding:
				{
					left: 1,
					right: 1
				},
				scrollbar:
				{
					style: { bg: 'green' }
				}
			});
		this.terminalUI.registerWidget('#TUI-Content', this._contentWidget);

		// Status bar (1 row)
		let tmpStatusBar = blessed.box(
			{
				parent: pScreen,
				bottom: 0,
				left: 0,
				width: '100%',
				height: 1,
				tags: true,
				style:
				{
					fg: 'white',
					bg: 'gray'
				}
			});
		this.terminalUI.registerWidget('#TUI-StatusBar', tmpStatusBar);

		// Wire up list selection events
		this._tableListWidget.on('select',
			(pItem, pIndex) =>
			{
				this._onTableSelected(pIndex);
			});
	}

	/**
	 * Bind keyboard shortcuts for the TUI.
	 *
	 * @param {Object} pScreen - The blessed screen instance
	 */
	_bindNavigation(pScreen)
	{
		let tmpSelf = this;

		pScreen.key(['o'], () => { tmpSelf.navigateTo('Overview'); });
		pScreen.key(['c'], () => { tmpSelf._runCompile(); });
		pScreen.key(['g'], () => { tmpSelf._runGenerateAll(); });
		pScreen.key(['r'], () => { tmpSelf.navigateTo('RelationshipGraph'); });
		pScreen.key(['d'], () => { tmpSelf._showDDLForSelectedTable(); });
		pScreen.key(['q'], () => { process.exit(0); });

		// Focus the table list for keyboard navigation
		this._tableListWidget.focus();
	}

	/**
	 * Navigate to a named view in the content area.
	 *
	 * @param {string} pViewName - One of: Overview, TableDetail, CompileOutput, RelationshipGraph
	 */
	navigateTo(pViewName)
	{
		this.currentView = pViewName;
		this.pict.AppData.TUI.CurrentView = pViewName;
		this.pict.AppData.TUI.StatusMessage = pViewName;

		if (this._contentWidget)
		{
			this._contentWidget.setLabel(` ${pViewName} `);
		}

		let tmpViewKey = `TUI-${pViewName}`;
		if (this.pict.views[tmpViewKey])
		{
			this.pict.views[tmpViewKey].render();
		}

		this.pict.views['TUI-StatusBar'].render();
		if (this._screen)
		{
			this._screen.render();
		}
	}

	/**
	 * Populate the table list widget with table names from the loaded model.
	 */
	populateTableList()
	{
		let tmpModel = this.pict.AppData.TUI.Model;
		if (!tmpModel || !tmpModel.Tables)
		{
			return;
		}

		let tmpTableNames = Object.keys(tmpModel.Tables);
		this.pict.AppData.TUI.TableNames = tmpTableNames;
		this.pict.AppData.TUI.TableCount = tmpTableNames.length;

		// Count total columns
		let tmpTotalColumns = 0;
		for (let i = 0; i < tmpTableNames.length; i++)
		{
			tmpTotalColumns += tmpModel.Tables[tmpTableNames[i]].Columns.length;
		}
		this.pict.AppData.TUI.TotalColumns = tmpTotalColumns;

		// Count unique domains
		let tmpDomains = {};
		for (let i = 0; i < tmpTableNames.length; i++)
		{
			let tmpDomain = tmpModel.Tables[tmpTableNames[i]].Domain || 'Default';
			tmpDomains[tmpDomain] = true;
		}
		this.pict.AppData.TUI.DomainCount = Object.keys(tmpDomains).length;

		if (this._tableListWidget)
		{
			this._tableListWidget.setItems(tmpTableNames);
			this._tableListWidget.select(0);
		}
	}

	/**
	 * Handle table selection from the list widget.
	 *
	 * @param {number} pIndex - Index of the selected table
	 */
	_onTableSelected(pIndex)
	{
		let tmpTableNames = this.pict.AppData.TUI.TableNames || [];
		if (pIndex >= 0 && pIndex < tmpTableNames.length)
		{
			let tmpTableName = tmpTableNames[pIndex];
			this.pict.AppData.TUI.SelectedTable = tmpTableName;
			this.pict.AppData.TUI.SelectedTableData = this.pict.AppData.TUI.Model.Tables[tmpTableName];
			this.navigateTo('TableDetail');
		}
	}

	/**
	 * Compile the current MicroDDL file and display output in the
	 * compile output view.
	 */
	_runCompile()
	{
		let tmpTUI = this.pict.AppData.TUI;
		let tmpInputFile = tmpTUI.InputFile;

		if (!tmpInputFile)
		{
			tmpTUI.CompileLog = 'No input file specified.';
			this.navigateTo('CompileOutput');
			return;
		}

		tmpTUI.CompileLog = 'Compiling ' + tmpInputFile + '...\n';
		this.navigateTo('CompileOutput');

		let tmpCompiler = this.pict.instantiateServiceProvider('StrictureCompiler');
		let tmpOutputLocation = tmpTUI.OutputLocation || './model/';
		let tmpOutputFileName = tmpTUI.OutputFileName || 'MeadowModel';

		tmpCompiler.compileFile(tmpInputFile, tmpOutputLocation, tmpOutputFileName,
			(pError) =>
			{
				if (pError)
				{
					tmpTUI.CompileLog += '\n{red-fg}ERROR: ' + pError.message + '{/red-fg}\n';
				}
				else
				{
					tmpTUI.CompileLog += '\n{green-fg}Compilation complete!{/green-fg}\n';
					tmpTUI.CompileLog += 'Output: ' + tmpOutputLocation + tmpOutputFileName + '.json\n';

					// Reload the model
					let tmpLoader = this.pict.instantiateServiceProvider('StrictureModelLoader');
					let tmpExtendedFile = tmpOutputLocation + tmpOutputFileName + '-Extended.json';
					tmpLoader.loadFromFile(tmpExtendedFile,
						(pLoadError) =>
						{
							if (!pLoadError)
							{
								tmpTUI.Model = this.pict.AppData.Model;
								this.populateTableList();
								tmpTUI.CompileLog += '{green-fg}Model reloaded.{/green-fg}\n';
							}
							this.pict.views['TUI-CompileOutput'].render();
							this.pict.views['TUI-StatusBar'].render();
							if (this._screen) { this._screen.render(); }
						});
					return;
				}
				this.pict.views['TUI-CompileOutput'].render();
				this.pict.views['TUI-StatusBar'].render();
				if (this._screen) { this._screen.render(); }
			});
	}

	/**
	 * Run all generators on the currently loaded model.
	 */
	_runGenerateAll()
	{
		let tmpTUI = this.pict.AppData.TUI;

		if (!tmpTUI.Model || !tmpTUI.Model.Tables)
		{
			tmpTUI.CompileLog = 'No model loaded. Compile first (press c).';
			this.navigateTo('CompileOutput');
			return;
		}

		tmpTUI.CompileLog = 'Running all generators...\n';
		this.navigateTo('CompileOutput');

		let tmpOutputLocation = tmpTUI.OutputLocation || './model/';
		let tmpOutputFileName = tmpTUI.OutputFileName || 'MeadowModel';
		let tmpMkdirp = require('mkdirp');

		let tmpAnticipate = this.pict.instantiateServiceProviderWithoutRegistration('Anticipate');

		let tmpGenerators = [
			{ Type: 'StrictureGenerateMySQL', Opts: { OutputLocation: tmpOutputLocation + 'mysql_create/', OutputFileName: 'CreateMySQLDatabase' } },
			{ Type: 'StrictureGenerateMeadow', Opts: { OutputLocation: tmpOutputLocation + 'meadow/', OutputFileName: 'MeadowSchema' } },
			{ Type: 'StrictureGenerateMarkdown', Opts: { OutputLocation: tmpOutputLocation + 'doc/', OutputFileName: 'Documentation' } },
			{ Type: 'StrictureGenerateModelGraph', Opts: { OutputLocation: tmpOutputLocation + 'doc/diagrams/', OutputFileName: 'Relationships', GraphFullJoins: false, AutomaticallyCompile: false } }
		];

		for (let i = 0; i < tmpGenerators.length; i++)
		{
			let tmpGenConfig = tmpGenerators[i];
			tmpAnticipate.anticipate(
				(fStageComplete) =>
				{
					tmpMkdirp.sync(tmpGenConfig.Opts.OutputLocation);
					tmpTUI.CompileLog += '  > ' + tmpGenConfig.Type + '...\n';
					this.pict.views['TUI-CompileOutput'].render();
					if (this._screen) { this._screen.render(); }

					let tmpGenerator = this.pict.instantiateServiceProvider(tmpGenConfig.Type);
					tmpGenerator.generate(tmpGenConfig.Opts, fStageComplete);
				});
		}

		tmpAnticipate.wait(
			(pError) =>
			{
				if (pError)
				{
					tmpTUI.CompileLog += '\n{red-fg}ERROR: ' + pError + '{/red-fg}\n';
				}
				else
				{
					tmpTUI.CompileLog += '\n{green-fg}All generators complete!{/green-fg}\n';
				}
				this.pict.views['TUI-CompileOutput'].render();
				this.pict.views['TUI-StatusBar'].render();
				if (this._screen) { this._screen.render(); }
			});
	}

	/**
	 * Show the MySQL CREATE statement for the currently selected table.
	 */
	_showDDLForSelectedTable()
	{
		let tmpTUI = this.pict.AppData.TUI;
		let tmpTable = tmpTUI.SelectedTableData;

		if (!tmpTable)
		{
			return;
		}

		// Build a quick inline DDL preview
		let tmpDDL = '{bold}CREATE TABLE IF NOT EXISTS{/bold}\n';
		tmpDDL += '    {yellow-fg}' + tmpTable.TableName + '{/yellow-fg}\n';
		tmpDDL += '    (\n';

		for (let j = 0; j < tmpTable.Columns.length; j++)
		{
			let tmpCol = tmpTable.Columns[j];
			let tmpLine = '        ';

			switch (tmpCol.DataType)
			{
				case 'ID':
					tmpLine += '{green-fg}' + tmpCol.Column + '{/green-fg} INT UNSIGNED NOT NULL AUTO_INCREMENT';
					break;
				case 'GUID':
					tmpLine += '{green-fg}' + tmpCol.Column + "{/green-fg} CHAR(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'";
					break;
				case 'ForeignKey':
					tmpLine += '{green-fg}' + tmpCol.Column + "{/green-fg} INT UNSIGNED NOT NULL DEFAULT '0'";
					break;
				case 'Numeric':
					tmpLine += '{green-fg}' + tmpCol.Column + "{/green-fg} INT NOT NULL DEFAULT '0'";
					break;
				case 'Decimal':
					tmpLine += '{green-fg}' + tmpCol.Column + '{/green-fg} DECIMAL(' + (tmpCol.Size || '10,2') + ')';
					break;
				case 'String':
					tmpLine += '{green-fg}' + tmpCol.Column + "{/green-fg} CHAR(" + (tmpCol.Size || '64') + ") NOT NULL DEFAULT ''";
					break;
				case 'Text':
					tmpLine += '{green-fg}' + tmpCol.Column + '{/green-fg} TEXT';
					break;
				case 'DateTime':
					tmpLine += '{green-fg}' + tmpCol.Column + '{/green-fg} DATETIME';
					break;
				case 'Boolean':
					tmpLine += '{green-fg}' + tmpCol.Column + "{/green-fg} TINYINT NOT NULL DEFAULT '0'";
					break;
			}

			if (j < tmpTable.Columns.length - 1)
			{
				tmpLine += ',';
			}
			tmpDDL += tmpLine + '\n';
		}

		// Find the primary key
		let tmpPK = 'ID' + tmpTable.TableName;
		for (let j = 0; j < tmpTable.Columns.length; j++)
		{
			if (tmpTable.Columns[j].DataType === 'ID')
			{
				tmpPK = tmpTable.Columns[j].Column;
				break;
			}
		}
		tmpDDL += '\n        PRIMARY KEY ({yellow-fg}' + tmpPK + '{/yellow-fg})';
		tmpDDL += '\n    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n';

		tmpTUI.DDLPreview = tmpDDL;
		tmpTUI.CompileLog = tmpDDL;
		this.navigateTo('CompileOutput');
	}

	/**
	 * Render layout widgets. Called by the layout view template.
	 *
	 * @returns {string} Empty string (widgets are created in JS, not template)
	 */
	renderLayoutWidgets()
	{
		return '';
	}
}

module.exports = StrictureTUIApplication;
