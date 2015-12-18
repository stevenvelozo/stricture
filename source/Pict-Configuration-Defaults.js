// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Pict Configuration Defaults
*/

module.exports = (
	{
		Create: (
			{
				Enabled: true,
				Title: 'Create a <%= EntityName %>'
			}),

		Record: (
			{
				Enabled: true,
				Columns: []
			}),

		List: (
			{
				Enabled: true,
				RowMenu: true,
				Columns: []
			}),

		Delete: (
			{
				Enabled: true,
				Validation: true,
				DisplayRecord: true,
				ConfirmationMessage: 'Are you sure you want to delete this record with ID XXXXX?'
			})
	}
);