
# ServerKit Example
## A Simple Application Service

Application services are implemented by javascript files that are loaded and executed by ServerKit.

To implement a new service, create a file in your `services` folder and export a function for ServerKit to call.
Inside this function, you will create your service and provide it with a definition and functions.

When ServerKit intializes, it loads its own services and any services in your `services` folder.
For each javascript file in `services`, ServerKit will load and attempt to call the `Construct()` function.
The result of the `Construct()` function should be an initialized service object.
ServerKit retains this result and makes it accessible via `Server.Services.ServiceName`.

Functions used to construct and configure services:
- [Server.NewApplicationService()](api/1621-Server.NewApplicationService.md)
	: Returns an [ApplicationService Object](api/1400-ApplicationService-Object.md).
	This object needs to be initialized to define the service and its functions.
	After the service object is initialized, you need to return it to ServerKit
	by returning it from the `Construct()` function.
- [Server.NewOriginDefinition()](api/1630-Server.NewOriginDefinition.md)
	: Returns an object that defines a new Origin.
	Part of the service definition is the definition of the service's functions.
	To differentiate between normal javascript callable functions, ServerKit uses the term Origin.
	The Origin includes the definition of the function (name, number and types of parameters, etc),
	as well as the function itself, which the second parameter to `Server.NewOriginDefinition()`
- [Server.NewFieldDefinition()](api/1631-Server.NewFieldDefinition.md)
	: Returns an object that defines a new Field (function parameter) for the Origin.


> **See [ApplicationService Object](api/1400-ApplicationService-Object.md) for more detailed information.**


~~~javascript
// TestService.js : A Simple Service in the 'services' folder
exports.Construct =
	function Construct( Server )
	{

		// Create a new Application Service.
		let service = Server.NewApplicationService(
			{ // The service definition.
				name: 'TestService',
				title: 'Test Service',
				description: 'A test service.',
			},
			{ // The default settings.
				echo_user: false,
			}
		);

		// Define the Origin for our service function.
		service.Origins.EchoText =
			Server.NewOriginDefinition( 
				// Parameter 1: The Origin Definition
				{
					name: 'EchoText',
					description: "Returns the same value that was passed to it.",
					Fields:
					[
						// This Origin has a single parameter named "Text"
						Server.NewFieldDefinition( {
							name: 'Text',
							title: "Text",
							description: "The text to echo.",
							type: 'string',
						} ),
					],
				},
				// Parameter 2: The Origin Function
				function ( User, Text )
				{
					// Echo the value back to the caller.
					let message = `Received "${Text}"`
					if( service.Settings.echo_user )
					{
						message += ` from ${User.user_id}`;
					}
					return message;
				}
			);

		// Return the Application Service.
		return service;
	};
~~~


Create a ServerKit server to load and run the service.

We can tell ServerKit where our application services are located with the `services_path` server option.
This can be a filename or the path of a folder relative to the application folder (e.g. `__dirname`).
If a folder, then all javascript files in that folder will be loaded as services.

In the server options, we also specify a configuration setting `echo_user` for our test service.
This is defined in the service above and shows how you can define and manage your own service configuration.


~~~javascript
// TestServer.js : A Simple Server
const SERVER_KIT = require( '@liquicode/lib-server-kit' );

// Configure the server
let server_options = {
	services_path: 'TestService.js',
	Settings: {
		Services: {
			TestService: {
				echo_user: true,
			}
		},
		Transports: {
			WebSocket: {
				enabled: true,
			},
		},
	}
};

// Create a new server
let server = SERVER_KIT.NewServer( 'MyServer', __dirname, server_options );
await server.Initialize();
await server.Startup();

// Test out our Origin by calling it directly.
console.log( server.Services.TestService.Origins.EchoText.invoke( { user_id: 'nobody' }, 'Hello World!' ) );
// outputs: Received "Hello World!" from nobody

// Test out our Origin by calling it via the WebSocket transport.
let client = server.Transports.WebSocket.NewSocketClient( server );
console.log( client.Call( 'TestService.EchoText', { Text: 'Hello World!' } ) );
// outputs: Received "Hello World!" from anon@server
client.Close();

await server.Shutdown();
~~~
