# Server Startup

Source file: [lib-server-kit.js](https://github.com/liquicode/lib-server-kit/blob/main/src/lib-server-kit.js)

Your application will use code like the following to include `lib-server-kit`,
instantiate a new `Server` object, and then initialize it:

```javascript
const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );
let Server = LIB_SERVER_KIT.NewServer( 'app-name', 'my-app-path' );
Server.Initialize();
```


Server Instantiation
---------------------------------------------------------------------

The `Server` object contains all of the configuration settings and service functions
that make up your server.

Your application creates a new `Server` object by calling the `NewServer` function which
takes a path to your application's root folder.
This folder contains all of your application's configuration files and any custom services.

During the call to `NewServer`, the following initialization takes place:

- Load the base modules and export their construction functions:
	`Server.NewServerModule`, `Server.NewService`, and `Server.NewStorageService`

- Load the `package.json` file residing at the given application path.
	If this file does not exist, then an error is thrown.
	The contents of the `package.json` file are parsed and stored as `Server.Package`.

- The `Utility` module is loaded and its functions are available via `Server.Utility`.

- The `Config` module is loaded and is now available as `Server.Config`.
	The defaults block `Server.Config.Defaults.AppInfo` is added containing information found in `Server.Package`.

- The `Log` module is loaded and is now available as `Server.Log`.

- The `WebServer` module is loaded and is now available as `Server.WebServer`.
	A defaults block `Server.Config.Defaults.WebServer` is added containing default settings for `WebServer`.

- All internal services are loaded (i.e. `ServerAccounts`) and made available as `Server.{ServiceName}`.
	Each loaded service also gets a defaults block (`Server.Config.Defaults.{ServiceName}`) containing the
	default settings for this service, obtained by calling the service's `GetDefaults` function.

- All external services are loaded from the application's `services` folder and made available as `Server.{ServiceName}`.
	Each loaded service also gets a defaults block (`Server.Config.Defaults.{ServiceName}`) containing the
	default settings for this service, obtained by calling the service's `GetDefaults` function.

- A defaults block `Server.Config.Defaults.Log` is added containing default settings for `Log`.
	This is a large configuration block and is saved until the end.
	This is an effort to make it a bit easier to work with configuration files.

- Finally, the `Server.Settings` is intialized by a call to `Server.Config.ResetSettings`
	which sets `Settings` equal to a clone of `Defaults`.

The return value of `NewServer` is a `Server` object which will have the following structure:

```javascript
Server = {
	NewServerModule: function () { /* creates a new module object */ },
	NewService: function () { /* creates a new service object */ },
	NewStorageService: function () { /* creates a new storage service object */ },
	Utility: { /* miscellaneous utility functions */ },
	Config: {
		Defaults: { /* Default settings for this server and all of its services */ },
		Settings: { /* The actual settings for this server and all of its services */ },
	},
	Log: { /* logging module functions */ },
	WebServer: { /* web server module functions */ },
	ServerAccounts: { /* system users service functions */ },
	// ... other application defined services
}
```

The `Server` object will have the `Config.Defaults` object populated at this time.
And `Config.Settings` will just be a copy of `Config.Defaults`.

The `Server` object now has the bare minimum to exist but none of its modules or services
will operate.
They first need to be configureed and initialized in order to function correctly.


Server Initialization
---------------------------------------------------------------------

Before use, the `Server` object must be initialized with a call to `Server.Initialize`.
This function will read all configuration settings and initialize all loaded services.
It takes a single argument which can be either a string (the filename of a custom settings file)
or an object (containing configuration settings).

Here is a breakdown of what happens inside of `Server.Initialize`:

- The application's settings file is loaded.
	This file must be named `{app-name}.settings.json` and must reside in the application's main folder.
	The contents of this file are loaded and merged with `Server.Settings`, establishing the initial server configuration.
	If this file is missing, a new file `{app-name}.defaults.json` is written to the application's main folder.

- If the application provided a filename argument, then that file is loaded as a settings file and merged with `Server.Settings`,
	over-writing any existing values.

- If the application provided an object argument, then that object is treated as a settings file and merged with `Server.Settings`,
	over-writing any existing values.

- The `Server.Settings` values now finalized and this enables the initialization of the rest of the server below.

- The NodeJS runtime environment variable `NODE_ENV` is set from the value of `Settings.AppInfo.environment`.

- The `Log` module is initialized with settings from `Settings.Log`.

- The `WebServer` module is initialized with settings from `Settings.WebServer`.

- All loaded services are configured by calling the service's `SetSettings` function,
	using values from `Settings.{ServiceName}`.

- All loaded services are initialized by calling the service's `InitializeService` function.
	The service's configuration is finalized at this point and further steps can be taken by the service to
	initialize its internal facilities.

When the `Initialization` function completes, the `Server` object is fully initialized and all of it services are available for use.

