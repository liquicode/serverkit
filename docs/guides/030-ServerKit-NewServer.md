
About ServerKit.NewServer()
---------------------------------------------------------------------

This function creates and returns a new ServerKit Server.

The parameters `ApplicationName` and `ApplicationPath` are required.
`ApplicationName` is used in various ways throughout the Server's operation.
The Server will always read and write files in the folder `ApplicationPath`.
All Server configuration settings that represent paths or filenames will be relative to `ApplicationPath`.

The third parameter `ServerOptions` is optional and controls how the Server is constructed and initialized:
~~~javascript
ServerOptions = {
	defaults_filename: '',		// Writes server defaults to a file.
	settings_filename: '',		// Writes server settings to a file.
	config_path: '',			// Merges, alphabetically, all files in path. Can be the filename of a single config file.
	services_path: '',			// Path to the application services folder. Can be the filename of a single service.
	Settings: null,				// Merge an explicit object with the configuration. This is applied last.
};
~~~

A newly instantiated server will load whatever modules and optional features to match the provided configuration settings.

Using the `ServerOptions` parameter:
- To see a list of all available configuration options and their default values,
	specify a filename for the `defaults_filename` option.
- Use the `settings_filename` option to generate a json file of the working configuration
	after all configuration files and runtime settings have been applied.
	Be aware that the resulting settings file will contain all of your runtime settings.
	This includes all of your connection strings and secret keys.
	This file is available to assist with debugging and developing new services and should not be
	backed up or included in your source control archives.
- Use `config_path` to specify either a single configuration file or a folder of configuration files.
	If this is a folder of files, they are processed in alphabetical order.
	Configuration files are loaded and their settings are merged/applied to the working configuration.
	Using a folder of configuration files, you can distribute the entire configuration across multiple
	files and runtime environments.
	Be careful about any archiving of these configuration files as they will likely also contain secrets.
- To provide settings via code, use the `Settings` object to pass in configuraton settings to be applied:
	```javascript
	ServerOptions.Settings = {
		AppInfo: { version: '1.0.0' },
		Transports: {
			Web: { enabled: true },
		},
	};
	```

After calling [`ServerKit.NewServer()`](api/1002-ServerKit-NewServer.md),
your server is created and loaded but not initialized.
You have access to both the default and the finalized runtime configuration options:
- `Server.Defaults`: A configuration object containing all of the default configuration values.
- `Server.Settings`: A configuration object containing all of the runtime configuration values.

***Notes***

- When custom settings are supplied, either through configuration files or or directly through code,
	they are merged with the existing set of defaults.
	So, you dont need specifiy every configuration setting, just the ones you want to change.
- For more information on server configuration, see the [Configuration](guides/120-Configuration.md) page.

At this point, the Server will have loaded, but not initialized, all Services and Transports.
You need to call the [`Server.Initialize()`](api/1610-Server.Initialize.md) function to initialize the Server for further use.

> **See the [Server Object](api/1600-Server-Object.md) page for more detailed information.**


Examples
---------------------------------------------------------------------

There are many ways to create a new server.
Most of the time, you will be using a combination of options.

**Create a new server in the current folder**

This server won't do anything interesting because nothing has been enabled.
See the configuration examples below to see how to configure server settings.

~~~javascript
const ServerKit = require( '@liquicode/lib-server-kit' );
let Server = ServerKit.NewServer( 'My-Server', __dirname );
~~~

**Generate both the Defaults and the Settings files**

These files can be used to help design your service configurations and debug any configuration issues.

~~~javascript
let server_options = {
	defaults_filename: 'defaults.json',
	settings_filename: 'settings.json',
};
let Server = ServerKit.NewServer( 'My-Server', __dirname, server_options );
// Two new files are written: __dirname/defaults.json and __dirname/settings.json
~~~

**Create a new server using a configuration file**

All server configuration can be done through a system of configuration files.

~~~javascript
let server_options = {
	config_path: 'my-settings.json',
};
let Server = ServerKit.NewServer( 'My-Server', __dirname, server_options );
// Reads configuration settings from the file: __dirname/my-settings.json
~~~

**Create a new server with settings in code**

~~~javascript
let server_options = {
	Settings: {
		Transports: {
			Web: {
				enabled: true,
				ClientSupport: {
					enabled: true,
				},
			},
		},
	},
};
let Server = ServerKit.NewServer( 'My-Server', __dirname, server_options );
// Creates a server using the Web transport.
~~~

**Create a new server that loads application services**

Application services are located in a specific folder.

~~~javascript
let server_options = {
	services_path: 'app-services',
};
let Server = ServerKit.NewServer( 'My-Server', __dirname, server_options );
// Server loads all services found in the folder: __dirname/app-services
~~~

**A more complex example**

~~~javascript
let server_options = {
	services_path: 'app-services',
	Settings: {
		Services: {
			ServerAccounts: {
				Storage: {
					storage_provider: 'mongo',
					MongoProvider: {
						database_name: 'MyServerDB',
						collection_name: 'Accounts',
						connection_string: 'mongodb://admin:password@localhost',
					},
				},
			},
		},
		Transports: {
			Web: {
				enabled: true,
				ClientSupport: {
					enabled: true,
				},
			},
		},
	},
};
let Server = ServerKit.NewServer( 'My-Server', __dirname, server_options );
// Server loads all services found in the folder: __dirname/app-services
~~~

