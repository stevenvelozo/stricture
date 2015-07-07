/**
* Stricture MicroDDL JSON Parser
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*
* @description Processes the JSON Data Description into documentation and SQL statements
*/

console.log('Stricture JSON DDL Processing Utility');
console.log('Contact: Steven Velozo <steven@velozo.com>');
console.log('');
console.log('---');
console.log('');

// No frills, run it and use command arguments.
var libStricture = require('./source/Stricture.js');

module.exports = libStricture();