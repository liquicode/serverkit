
# Items, Parameters, and Schema


One of the primary features of `Server Kit` is the ability to provide descriptive schema for
data fields and leverage that information to automate much of the repetetive code involved
in data storage, validation, and transmission of data over the wire.


Service Items
---------------------------------------------------------------------

Each `Service` you develop has an `ItemDefinition` structure which defines the type of data that
the service will be working with.
For example, the `ServerAccounts` service defines the fields needed for a user object:
`user_id`, `user_name`, `user_role`, and `image_url`.

Here is an example `ItemDefinition` which might describe a sales invoice:
```js
MyService.ItemDefinition = {
	name: 'SalesInvoice',		// Programmatic name of the item
	title: 'Sales Invoice',		// Title to use when displaying a single item in the UI
	titles: 'Sales Invoices',	// Title to use when listing multiple items in the UI
	shareable: true,			// Enable sharing of this item to other users
	Fields: {
		InvoiceID: {
			name: 'invoice_id',
			title: 'Invoice ID',
			description: 'The unique id for this invoice.',
			schema: { type: 'string', format: 'uuid' },
			readonly: true,
		},
		InvoiceName: {
			name: 'invoice_name',
			title: 'Invoice Name',
			description: 'The name for this invoice.',
			schema: { type: 'string', format: 'text' },
			readonly: false,
		},
		InvoiceAmount: {
			name: 'invoice_amount',
			title: 'Invoice Amount',
			description: 'The total amount for this invoice.',
			schema: { type: 'Number' },
			readonly: false,
		},
	},
};
```


Service Parameters
---------------------------------------------------------------------

The primary function of a `Service` is to export internal application functions to external clients
in the form of an `Origin` or `Page`.
Each function parameter has a schema associated with it that allows `Server Kit` to package and
validate function parameters for you.

```js
ServerAccounts.ServiceDefinition.Origins.StorageFindOne = {
	name: 'StorageFindOne',
	description: 'Returns the first object matching the given Criteria.',
	requires_login: true,
	allowed_roles: [ 'admin', 'super', 'user' ],
	verbs: [ 'call', 'get', 'post' ],
	// parameters: [ 'Criteria' ],
	parameters: [
		{
			name: 'Criteria',
			description: 'Criteria of objects to find.',
			schema: { type: 'object' },
			example: { foo: 'bar' },
		},
	],
	// invoke: async function ( User, Criteria ) { return await service.StorageFindOne( User, Criteria ); },
	invoke: service.StorageFindOne,
};
```

### Definition for the page at `ServerAccounts/Item`:

```js
ServerAccounts.ServiceDefinition.Pages.Item = {
	name: 'Item',
	description: 'Shows item detail and management functions.',
	requires_login: true,
	allowed_roles: [ 'admin', 'super', 'user' ],
	parameters: [
		{
			name: 'ItemID',
			description: 'ItemID of object to work with.',
			schema: { type: 'string' },
			example: 'b88d6048-725f-4f21-a8b0-e6de2de262e0',
		},
		{
			name: 'PageOp',
			description: 'Page operation: Create, Read, Update, or Delete',
			schema: { type: 'string' },
			example: 'Read',
		},
	],
	view: 'storage/item',
};
```

### Invoke this page and pass it parameter values by requesting its url:

```url
http://server-name/ServerAccounts/Item?ItemID=b88d6048-725f-4f21-a8b0-e6de2de262e0&PageOp=Update
```

Within the `storage/item` view file, you will have access to the parameters as global variables.
```pug
//- web/views/storage/item.pug :
script
	!= `window.SERVER_DATA.Parameters = ${JSON.stringify( locals.Parameters )};\n`
```

```js
// web/public/storage/item.js :
window.SERVER_DATA.Parameters = {"ItemID":"a47f49b1-7d9d-42f2-8090-ffba67b20c7a","PageOp":"Update"};
```




Schema
---------------------------------------------------------------------




| Type    | Format    | Examples                      | Description                            |
|---------|-----------|-------------------------------|----------------------------------------|
| boolean | -         | `true`, `false`               | A boolean value.                       |
| integer | -         | `1`, `2`, `3`                 | A numeric integer value.               |
| number  | -         | `1`, `2`, `3.14`              | A numeric real (floating point) value. |
| string  | -         | `“Hello World!”`              | A text value.                          |
| string  | text      | `“Hello World, Again!”`       | A text value.                          |
| string  | date      |                               |                                        |
| string  | time      |                               |                                        |
| string  | datetime  |                               |                                        |
| string  | uuid      |                               | Universally Unique Identifier          |
| string  | email     |                               |                                        |
| string  | password  |                               |                                        |
| string  | base64    |                               |                                        |
| string  | url       |                               |                                        |
| string  | image_url |                               |                                        |
| array   | -         | `[ 1, 2, 3 ]`                 | An array of values.                    |
| object  | -         | `{ foo: ‘bar”, value: 3.14 }` | An object value.                       |



