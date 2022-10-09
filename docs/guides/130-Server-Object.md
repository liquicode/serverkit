
About Server Object
---------------------------------------------------------------------

The ServerKit Server object implements a number of network transports
that are used to allow remote callers to invoke functions within your application's services.
The Server loads your application services and hosts them on the transports that you enable and configure.
ServerKit handles all of the plumbing for calling your defined service functions.


Server Lifecycle
---------------------------------------------------------------------

**Creating a Server Object**

You instantiate a new server by calling the [ServerKit.NewServer()](api/1002-ServerKit.NewServer.md) function:

~~~javascript
const ServerKit = require( '@liquicode/lib-server-kit' );
let Server = ServerKit.NewServer( 'My-Server', __dirname );
~~~

The `ServerKit.NewServer()` function has a third parameter `ServerOptions` which allows you to specify
the location of your application services and configuration settings.

For small or new projects, you will probably supply all of your configuration settings in code and
pass them to `ServerKit.NewServer()` via the `ServerOptions` parameter.
As a project gets larger and is deployed in various environments (e.g. test and production),
it makes more sense to encode your configuration settings into separate files specific to each environment.

Prior to intialization, you can inspect `Server.Defaults` to view all of the available configuration settings
and their default values.
You may also manipulate the `Server.Settings` object to make configuration changes prior to initialization.

**Server Initialization**

Before using the new Server you must initialize it by calling the `Server.Initialize()` function.
This will, in turn, call the `InitializeModuile()` function for each service and transport loaded in the Server.

**Start the Server**

To get everything running and make your services available to clients, call the `Server.Startup()` function.
All enabled transports will begin receiving messages, all database connections will be made, etc.

After startup, all services have been initialized (even the ones you create) and you can interact with them
by calling any functions that they define:
```javascript
user = { user_id: 'john@doe.com', user_role: 'user' }
result = Server.Services.ServerAccounts.StorageFindOne( user, user );  // result = user from storage
result = Server.Services.Maths.Add( user, 3, 4 );       // result = 7
result = Server.Services.Maths.Subtract( user, 3, 4 );  // result = -1
```

**Stop the Server**

If your application needs to shut down the Server at some point, call the `Server.Shutdown()` function.
All running transports will be shut down.
You can later call `Server.Startup()` to start them up again.

You can also call `Server.InstallAutoShutdown()` at any point to have the Server automatically
call Shutdown when the Node process exits.

**Notes**

- During `Server.Initialize()`, disabled services and transports are unloaded
	from `Server.Services` and `Server.Transports`.


Server Operation
---------------------------------------------------------------------

Follows is the typical usage pattern for a ServerKit Server.

Create it, configure it, and let it run.

~~~javascript
// Include the library in your source code
const ServerKit = require( '@liquicode/lib-server-kit' );

// Create a new server by supplying the Server's name and its root folder.
let server_options = {
	config_path: 'app-config.json',
	services_path: 'app-services',
	Settings: { AppInfo: { version: '1.0.0' } },
};
let server = ServerKit.NewServer( 'MyServer', __dirname, server_options );
// - The server is created.
// - Initial configuration settings have been calculated but not finalized.
// - No Services or Transports have been initialized.

// Initialize the server
await server.Initialize();
// - Server configuration is finalized.
// - Services and Transports are initialized.
// - Services and Transports are ready for internal consumption.
// - You start seeing some log messages output to the console:
//	| 03:46:14 | 0523 | T | Server initialized module [Log].
//	| 03:46:14 | 0529 | D | Runtime environment set to: development
//	| 03:46:14 | 0531 | T | Server initialized service [ServerAccounts].
//	| 03:46:14 | 0531 | T | Server initialized service [Authentication].
//	| 03:46:14 | 0531 | T | Server initialized service [ServerManagement].

// Start the server
await server.Startup();
// - Services and Transports are started.
// - Services can be called remotely via Transports (e.g. Web, WebSocket).

// Wait for some signal to stop the server ...

// Stop the server
await server.Shutdown();
~~~

**Notes**

- Virtually every aspect of the server's operation is controlled through its configuration settings.
- All settings have sensible defaults that can handle most common scenarios with minimal customization.
- All transports are disabled by default and all services are enabled by default.
- For more information on server configuration, see the [Configuration](guides/120-Configuration.md) page.


User Management
---------------------------------------------------------------------

ServerKit handles much of the complexity required for user and session management.
This functionality is supplied by two of its built-in services:
[ServerAccounts](api/2100-ServerAccounts-Object.md) and [Authentication](api/2200-Authentication-Object.md).
All users are identified by their email address and will have a record in the ServerAccounts storage.
The Authentication service manages all user credentials and sessions for the server.


Application Services
---------------------------------------------------------------------

Your application server is defined by the application services that you write.
Each remotely callable function in your service is termed `Origin` in ServerKit parlance.
An Origin consists of a defintion that tells ServerKit how your function is to be used
as well as a callable function that will be invoked when a service request has been made
through one or more transports.

An Origin definition has a `name` and a `Fields` array describing each of the function parameters.

All Origin functions take a `User` object as the first parameter which represents the user making the request.
This is mainly for informational purposes as all authentication and authorization has already been performed
by the time your function gets called.

**An Example Application Service**

Builds a simple service that has a single function called EchoTest().
Anyone can call this service and it can be called on any transport.

~~~javascript
// my-service.js in the services folder:
exports.Construct =
	function Construct( Server )
	{
		// Create an application service.
		let service = Server.NewApplicationService();

		// Describe the service.
		service.Definition.name = 'my-service';
		service.Definition.title = 'My Service';
		service.Definition.description = "Does things.";

		// Describe a new Origin called EchoTest.
		service.Definition.Origins.EchoTest = {
			// Describe the function.
			name: 'EchoTest',
			description: "Returns the same thing you sent to it.",
			// Describe any user requirements.
			requires_login: false,
			allowed_roles: [ '*' ],
			// Describe the transports to bind to.
			verbs: [ 'http-get', 'socket-call', 'amqp-call', 'text-call' ],
			// Describe the function parameters.
			Fields: [
				// Describe the Text parameter.
				Server.NewField( {
					name: 'Text',
					type: 'string',
					required: true,
				} ),
			],
			// The actual function.
			invoke: async function( User, Text ) { return 'You said: ' + Text; },
		};

		// Return the Service.
		return service;
	};
~~~

> **See Also**
> - [ApplicationService](api/1500-ApplicationService.Object.md) : A generic service that can host callable Origins.
> - [StorageService](api/1500-StorageService.Object.md) : A user-centric storage service with prebuilt Origins for searching and manipulating data.

