/**
* Unit tests for the Orator Server
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

suite
(
	'Orator',
	function()
	{
		setup
		(
			function()
			{
			}
		);

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'initialize should build a happy little object',
					function()
					{
						var tmpStricture = require('../source/Stricture.js');
						Expect(tmpStricture).to.be.an('function', 'Stricture should initialize as an function directly from the require statement.');
					}
				);
			}
		);
		suite
		(
			'Basic DDL Management',
			function()
			{
				test
				(
					'Generate a simple JSON from MicroDDL',
					function(fDone)
					{
						fDone();
					}
				);
			}
		);
	}
);