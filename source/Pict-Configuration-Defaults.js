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

		Read: (
			{
				Enabled: true,
				Columns:
				{
					Name: { Type: 'Text' }
				}
			}),

		ReadList: (
			{
				Enabled: true,
				Columns:
				{
					Name: { Type: 'Text' },
					CreateDate: { Type: 'Date-Relative' }
				}
			}),


		Update: (
			{
				Enabled: true,
				Columns:
				{
					Name: { Type: 'Text' }
				}
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