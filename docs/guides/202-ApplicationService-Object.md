
About ApplicationService Object
---------------------------------------------------------------------

The ApplicationService object serves as the basis for all ServerKit services.
It defines additional members for managing Origins and Views.

- `Origins`
	: An object containing all of the Origins for this service.
- `Views`
	: An object containing all of the Views for this service.

An ApplicationService object can be created by calling
the [Server.NewApplicationService()](api/1621-Server.NewApplicationService.md) function.

**Creating a New ApplicationService**

~~~javascript
let service = Server.NewApplicationService(
	// 1st Parameter: Service Definition
	{
		name: 'MyService',
		title: 'My Service',
		description: 'This is my service.',
	},
	// 2nd Parameter: Service Configuration Defaults
	{
		answer: 42,
	},
);

service.Origins.SomeFunction =
	Server.NewOriginDefinition(
		{
			name: 'SomeFunction',
		},
		function some_function() { return ('The answer is: ' + service.Settings.magic_number); }
	);

~~~

