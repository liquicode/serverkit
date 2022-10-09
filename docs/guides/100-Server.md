
# Server

The `Server` object provides a single place to control and manage your server.


<hr>


Create a Server
---------------------------------------------------------------------

Create a new server object by calling the library's `NewServer()` function.
It takes two required parameters:
- `ApplicationName`: The name of your application or server.
- `ApplicationPath`: The root folder of your server.

```javascript
// Include the library in your source code
const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );
// Create a new server
let server = LIB_SERVER_KIT.NewServer( 'FirstServer', __dirname );
```


<hr>


Server Configuration
---------------------------------------------------------------------

A third, optional, parameter `ServerOptions` is a configuration object which provides you
control over how the server loads and runs.

```javascript
// Custom server options
let ServerOptions = {
	write_defaults: false,		// Writes '<ApplicationName>.defaults.json'.
	write_settings: false,		// Writes '<ApplicationName>.settings.json'.
	config_path: '',			// Merges, alphabetically, all json/yaml files in path. (can be a filename)
	Settings: null,				// Merge an explicit object with the configuration. This is applied last.
};
// Create a new server
let server = LIB_SERVER_KIT.NewServer( 'FirstServer', __dirname, ServerOptions );
```

A newly instantiated server will load whatever modules and optional features to match the provided
configuration settings.

Using the `ServerOptions` parameter:
- To see a list of all available configuration options, you can specify `true` for the `write_defaults`
and/or the `write_settings` options.
- The `write_defaults` option will generate a json file in `ApplicationPath` that contains the entire set of
configuration options and their default values.
- To review the configuration options and see their runtime values, use the `write_settings` option.
	Be aware that the resulting settings file will contain all of your runtime settings,
	including connection strings and secret keys.
	The file is available to assist with debugging and developing new services and should not be
	backed up or included in your source control archives.
- Use `config_path` to specify either a single configuration file or a folder of configuration files
	that are processed in alphabetical order.
	Configuration files are loaded and their settings are applied to the working configuration.
	Using a folder of configuration files, you can distribute the entire configuration across multiple
	files and runtime environments.
	Be careful about any archiving of these files as they will likely contain secrets.
- To provide settings via code, use the `Settings` object to pass in configuraton changes:
	```javascript
	ServerOptions.Settings = {
		AppInfo: { version: '1.0.0' },
		Transports: {
			Web: { enabled: true },
		},
	};
	```

After calling `NewServer()`, your server is created and loaded but not initialized.
You have access to both the default and the finalized runtime configuration options:
- `Server.Defaults`: A configuration object containing all of the default configuration values.
- `Server.Settings`: A configuration object containing all of the runtime configuration values.

***Notes***

- Virtually every aspect of the server's operation is controlled through its configuration settings.
- All settings have sensible defaults that can handle most common scenarios with minimal customization.
- When custom settings are supplied, either through config files or in `ServerOptions.Settings`, they
	are merged with the existing set of defaults.
	So, you dont need specifiy every configuration setting, just the ones you want to change.
- For more information on server configuration, see the [Configuration](Configuration.md) topic.


<hr>


Server Initialization
---------------------------------------------------------------------

Before we can do anything with the server, like calling functions in our services, it must be initialized
with a call to `Server.Initialize()`.
This function takes no parameters and it initializes all services and transports.
It does this by applying all runtime configuration settings and calling `InitializeModule()` on each of them.
This is the opportunity for services and transports to do any needed one-time intialization.

After calling `Server.Initialize()`, you will notice some console output.
There will be plenty of log output as you start and run your server.
The are server configuration settings that control how much log output you see.
```
| 03:46:14 | 0523 | T | Server initialized module [Log].
| 03:46:14 | 0529 | D | Runtime environment set to: development
| 03:46:14 | 0531 | T | Server initialized service [ServerAccounts].
| 03:46:14 | 0531 | T | Server initialized service [Authentication].
| 03:46:14 | 0531 | T | Server initialized service [ServerManagement].
| 03:46:14 | 0531 | T | Server initialized service [Maths].
```

All services have now been initialized (even the ones you create) and you can interact with them
by calling any functions that they define:
```javascript
user = { user_id: 'john@doe.com', user_role: 'user' }
result = Server.Services.ServerAccounts.StorageFindOne( user, user );  // result = user from storage
result = Server.Services.Maths.Add( user, 3, 4 );       // result = 7
result = Server.Services.Maths.Subtract( user, 3, 4 );  // result = -1
```

***Notes***
- During `Server.Initialize()`, disabled services and transports are unloaded from `Server.Services`
and `Server.Transports`, respectively.


<hr>


Server Startup
---------------------------------------------------------------------

Calling `Server.Startup()` starts the server and, in turn, also starts all enabled services and transports.
Services and trabsports will have each of their `StartupModule()` functions called by the server.
```javascript
Server.Startup();
```

Now service functions are available via any configured transport.
For example, using the `Web` transport, your service functions can be invoked via a simple http call.
All function paramters are decoded and passed on to your functions.
Whatever your function returns also gets transferred back to the client in response to their request.
```bash
# MyService.DoSomeMagic( 5, 3 )
http://myserver.url/MyService/DoSomeMagic?Toadstools=5&Sparkles=3
```

***Notes***
- When starting up, all services are started first, then all transports.
- When shutting down, all transports are shut down first, then all services.


<hr>


Server Shutdown
---------------------------------------------------------------------

The server can be shut down at any time by calling the `Server.Shutdown()` function.
As expected, the server calls `ShutdownModule()` and all service and transports.


A Complete and Minimal Example
---------------------------------------------------------------------

```javascript
const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );
let server = LIB_SERVER_KIT.NewServer( 'FirstServer', __dirname );
await server.Initialize();
console.log( server.Services.length + ' services have been initialized.' );
console.log( server.Transports.length + ' transports have been initialized.' );
await server.Startup();
console.log( server.Settings.AppInfo.name + ' has started.' );
await server.Shutdown();
```
