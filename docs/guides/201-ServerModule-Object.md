
About ServerModule Object
---------------------------------------------------------------------

The ServerModule object serves as the basis for all ServerKit services and transports.
It contains a `Definition` member which describes the module
and two members to manage the module's configuration: `Defaults` and `Settings`:

- `Definition`
	: An object which describes the module and initially contains only a `name` member.
- `Defaults`
	: An object containing the entire configuration of the module and the default values for each setting.
- `Settings`
	: The actual runtime configuration settings for the module.
	This is constructed by ServerKit by combining the module's `Defaults` with runtime configuration settings.

ServerModule also defines three functions which are called by ServerKit during the life-cycle of a server object:

- `InitializeModule()`
	: Takes no parameters and is called during [Server.Initialize()](api/1610-Server.Initialize.md).
- `StartupModule()`
	: Takes no parameters and is called during [Server.Startup()](api/1610-Server.Startup.md).
- `ShutdownModule()`
	: Takes no parameters and is called during [Server.Shutdown()](api/1610-Server.Shutdown.md).

These member functions do nothing and are intended to be overriden by inheriting modules (such as StorageService).

A ServerModule object can be created by calling the [Server.NewServerModule()](api/1620-Server.NewServerModule.md) function.

**Creating a New ServerModule**

~~~javascript
let server_module = Server.NewServerModule();
server_module === {
	Definition: {}, // Stores the module's definiton (e.g. name, etc.).
	Defaults: {},   // The default configuration for the module. This is defined by the module.
	Settings: {},   // The runtime settings for the module. Combines defaults with configuration settings.
	InitializeModule: function () {},  // Called during Server.Initialize().
	StartupModule: function () {},     // Called during Server.Startup().
	ShutdownModule: function () {},    // Called during Server.Shutdown().
};
~~~

