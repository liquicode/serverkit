# Version History


v0.0.46, 2024-03-01
------------------------------------------

- pinned `package.json` engine to node v14.17.3.
- recompiled `better-sqlite3@7.6.2 ` for node `v14.17.3`.
- Minor fixes to `Server.ResolveApplicationPath()` and `Server.ResolveDataPath()` functions.
	They can now be called with no parameters to return the base path for each.
- Fixed error during WebTransport initialization where Service web (public & view) files are deployed multiple times.
- Administrative web ui now displays the runtime settings. This is currently limited to read-only.
- The npm library `better-sqlite3` is compiled against, and bound to, a specific version of node. Changing node versions requires doing an `npm rebuild`. This library needs to be replaced.
- Fixed issue with `allowed_roles` in `src\transports\Web\ViewCores\w3css-angularjs\public\Services\StorageService\List.js`


v0.0.45, 2022-11-27
------------------------------------------

- Added the `SourceWatcher` core module.
- Added the `Server.source_watcher_ms` configuration setting.
- Added the `Server.data_path` configuration setting.
- Added the `Server.ResolveDataPath()` function.
- Updated all services and default settings to use `Server.data_path`.
- All service data (e.g. storages) are now stored under a `data_path/service_name` folder.
	This primarily affects and simplifies storages and their configuration settings.
- Enhanced the storage provider code and added four new functions:
	- `Server.StorageDefaults()`
	- `Server.NewStorage( Service, StorageSettings )`
	- `Server.UserStorageDefaults()`
	- `Server.NewUserStorage( Service, UserStorageSettings )`
- Cleaned up the session storage code in the `Authnetication` service.


v0.0.44, 2022-11-26
------------------------------------------

- Added storage provider `NedbProvider`.
- Cleaned up storage provider code.
- Added the `Server.NewStorage( ProviderName, ProviderSettings )` and `Server.NewUserStorage( UserStorageSettings )` functions.
- Added defensive code in server initialize, startup, and shutdown.


v0.0.43, 2022-11-22
------------------------------------------

- Fixed an issue in the `_websocket-client-api.js` file when using `WebSocket.use_http_server = 'web'`.
	The client side of socket.io was not initializing properly and was unable to make a connection to the server.


v0.0.42, 2022-11-22
------------------------------------------

- Fixed bug in `Server.InstallAutoShutdown()`.
- Added a `web` option to configuration setting `WebSocket.use_http_server`.
	Use the `web` option when the `Web` transport is running and you want o piggy-back on the existing http/s server.
	This is useful when running behind a proxy and/or where you have a single port being forwarded.


v0.0.41, 2022-11-21
------------------------------------------

- Bug fixing in ViewCore `w3css-angularjs`. Make code ES5 compatible.


v0.0.40, 2022-11-21
------------------------------------------

- Bug fixing in ViewCore `w3css-angularjs`.


v0.0.39, 2022-11-20
------------------------------------------

- Changed visibility of `ServerManagement.Explorer` view. Now requires `admin` or `super`.


v0.0.38, 2022-11-20
------------------------------------------

- Added configuration settings in `WebTransport`.
	- `ClientSupport.view_core_show_signup`
	- `ClientSupport.view_core_show_login`
	- `ClientSupport.view_core_easy_admin_login`


v0.0.37, 2022-11-19
------------------------------------------

- Services can now contribute files to the ViewCore.
	Folders and files located at `{App}/Services/{ServiceName}/web/public` and `{App}/Services/{ServiceName}/web/public` will be copied.


v0.0.36, 2022-11-08
------------------------------------------

- Throttled code coloring of call results in `Services/ServerManagament/Explorer.js` to <= 8KB.
- Enhanced TaskManager.


v0.0.35, 2022-11-04
------------------------------------------

- The `Web` transport no longer enables `Web.Security.Cors` by default. Both `Web.Security.Cors` and `Web.Security.Helmet` are now disabled by default.
- Moved configuration `Web.ClientSupport.Views.root_view` to `Web.ClientSupport.home_view`.
- Renamed configuration setting `StorageService.Storage` to `StorageService.UserStorage`.
- Renamed configuration setting `Authentication.Storage` to `Authentication.SessionStorage`.
- Changed usage of the `StorageService.storage_provider` configuration setting. It is now set to the full provider name: `MemoryProvider`, `FileProvider`, `Sqlite3Provider`, or `MongoProvider`
- New UserStorage providers for `StorageService.UserStorage` can be authored in the source folder `src/core/StorageProviders`
	and named as `{StorageProviderName}.js`.
- Simplified Log configuration. No longer a seperate object for Shell, just a new `Console.ShellColorTheme` setting.


v0.0.34, 2022-11-03
------------------------------------------

- Changed ServerKit startup behavior.
	If `services_path` is not provided to `ServerKit.NewServer()`,
	ServerKit will look for services within these folders: `App/services`, `App/Services`, and `App`.
- Added `server_timeout` (in milliseconds) to the Web and WebSocket configurations.
- Added the `ServerManagement/Administration` view to the view core.
- Added "Directory of Pages" to the home view.


v0.0.33, 2022-11-02
------------------------------------------

- Reworked the `Service.Views` mechanism.
	- The `Service.Definition.view` field is now optional.
	- The view template file will default to `Services/{ServiceName}/{OriginName}`.

- Integrated the `Authentication` views (Signup, Login, Logout) into the views mechanism.
	They are no longer as much of an exceptional case within the codebase.

- Cleaned up the `w3css-angularjs` ViewCore implementation.


v0.0.32, 2022-11-01
------------------------------------------

- Added `WebTransport.GetUserViews()` function.


v0.0.31, 2022-10-30
------------------------------------------

- Added `Server.TaskManager` object.


v0.0.30, 2022-10-29
------------------------------------------

- Fixed inconsistent usage of client callback between `WebTransport` and `WebSocketTransport`.
- Added `ServerAddress.public_address` field in `WebTransport` and `WebSocketTransport`.
	This field is optional and defaults to `ServerAddress.address`.
	This address is used when generating client api files.

---


TODO for v0.1.0
------------------------------------------

- Server
	- **COMPLETED** Rename: `ModuleBase` to `ServerModule`
	- **COMPLETED** Rename: `ServiceBase` to `ApplicationService`
	- **COMPLETED** Move `ApplicationService.NewServiceItem` to `StorageService.NewStorageItem`
	- **COMPLETED** Move `ApplicationService.ItemDefinition` to `StorageService.Definition.Item`
	- **DECLINED** Rename: `Authentication` service to `ServerAuthentication`.
	- **DECLINED** Rename: `ClientSupport` to `BrowserSupport`
	- **COMPLETED** Develop: `TextTransport`
		- **COMPLETED** `Server.Transports.Text.Call( SessionToken, CommandText )`
		- **COMPLETED** Used by `server-kit-cli.js`
	- Update lib-json to support hjson. Go full lib-json
	- CONFIRM: Allow js-style syntax for user input.
	- **COMPLETED** When reporting file and folder names, use a truncated version of the name that is relative to the application folder.
	- **COMPLETED** Make `VisitOrigins()` an async function.
	- **COMPLETED** Make `VisitViews()` an async function.
	- **COMPLETED** Rename `Origin.Parameters` to `Origin.Fields`, to match the vernacular found elsewhere.
	- **COMPLETED** Rename `Server.NewField()` to `Server.NewFieldDefinition()`.
	- **COMPLETED** Develop a `Server.NewOriginDefinition()` function to make it easier to define Origins.
	- **COMPLETED** Allow wildcards in `Origin.verbs`.
	- **COMPLETED** Make a task scheduler.
	- **COMPLETED** Simplify Log configuration. Add `Log.shell_colors` configuration setting to enable colorized output.
		Valid values can be one of `'light'`, `'dark'`, or empty.
		Additionally, add `Log.Colors.Light` and `Log.Colors.Dark` to define the color values.
	- Add `Log.Console.max_line_length` configuration setting to limit the length of log output lines.
	- TaskScheduler: During initialize, only load the tasks and do not start them. Start and Stop tasks with `StartServer` and `StopServer`.
	- TaskScheduler: Have a `run_once` option for tasks.
	- TaskScheduler: Support running tasks in a new thread.
	- Log: Add `Log.Console.MaxMessageLength` configuration setting.
	- Replace the `better-sqlite3` npm library. Maybe use `ne-db`.


- Services
	- **COMPLETED** Rename `Endpoints` to `Origins`
	- **COMPLETED** Rename `Pages` to `Views`
	- **DECLINED** Create an `Origins` namespace to implement functions
	- **COMPLETED** Rename `SystemUsers` to `ServerAccounts`
	- **COMPLETED** Reconcile: `Service.ItemDefinition.Fields` is a map, yet `Origin.parameters` and `Page.parameters` are arrays
	- **DECLINED** Develop: `ApiExplorer` service. Add Explorer page.
	- **DECLINED** Generate a yargs file `cli_runner_file` into the application's folder to expose origins with `cli-call`.
	- **COMPLETED** Develop: `Authentication` application service
		- **DECLINED** Exports authentication pages: signup, login, logout
		- **COMPLETED** Uses the `ServerAccounts` service to perform the signup and login functions
		- **DECLINED** User authentication is still performed by Passport
			- **DEPRECATED** Can passport be abstracted enough to support other protocols?
	- **COMPLETED** Add a `default` field to `Item.Fields` and `Origin.Parameters`.
		- **COMPLETED** Function `Server.VerifyFields` will apply defaults to missing fields.
	- **COMPLETED** Rename: `Origin.parameters` and `Page.parameters` to `Parameters`.
	- **COMPLETED** Rename: All Origin and View Parameter names should be in PascalCase.
	- **COMPLETED** Rename configuration setting `StorageService.Defaults.Storage` to `StorageService.Defaults.UserStorage`
	- Add: `ProxyTo` Setting which informs transports to proxy all calls for a service to a remote server.
	- CONFIRM: Add Origins using their `Definition.name` field rather than the programmatic name. Or remove the `Definition.name` field.


	- `Authentication` Service
		- **DEPRECATED** Develop: Cache system for sessions.
		- **COMPLETED** Implement: database storage for sessions.
		- **COMPLETED ???** Encrypt stored user passwords.
		- **COMPLETED** Implement: file storage for sessions.
		- Add Feature: Allow admin and super users to `Impersonate` other users.
		- Add Configuration Settings:
			- `failure_max_tries`
			- `failure_cooldown_seconds`
			- `session_lifetime_seconds`
		- The `Logout` function needs to actually delete the session so that a logout appiles to all devices.


	- `ServerManagement` Service
		- **COMPLETED** Develop: Origin `ServerManagement.Diagnostics()`
		- **COMPLETED** Develop: Origin `ServerManagement.RestartServer()`
		- **COMPLETED** Develop: Origin `ServerManagement.StopServer()`
		- Explorer UI
			- **COMPLETED** Make 'Response' box resizable
			- **COMPLETED** Fix: The client-api implementation uses $.ajax which drops any empty array or object parameters
			- Select user to Invoke As

- Transports

	- `TextTransport`
		- **COMPLETED** Validate SessionToken and user_role.
		- **COMPLETED** Origin must have the 'text-call' varb.
		- **COMPLETED** Limit to Origins which have the 'text-call' verb.
		- Develop `TextClient`.
		- Remove `TextTransport` and promote the `ParseCommand()` and `InvokeCommand()` functions to the Server. (?)


	- `WebTransport`
		- **COMPLETED** Move `AnonymousUser` to the top, underneath `WebServer`
		- **COMPLETED** Convert all configuration/initialization bits into functions that can be called in any order
		- **COMPLETED** Develop `Express.AuthorizationGate` middleware to check user roles
		- **COMPLETED** Convert `WebServer.RequestProcessor` to `Express.InvocationGate`
		- **COMPLETED** Fix: All Origin calls are being stringified
		- **COMPLETED** Fix: Origin socket call logs do not show the result. Because we are getting the result of the middleware and not the call itself
		- **COMPLETED** Fix: When an error occurs during an Express origin call, an eror string is returned rather than an ApiResult
		- **DECLINED** Rename: `DataHandling` to `Middlewares`
		- **COMPLETED** Rename `ExpressTransport` to `WebTransport`.
		- Come up with a way for admin users and super users to impersonate another user.
		- Add `Web.ClientSupport.auto_favicon` configuration setting to generate a favicon based on the server name.

		- **DEPRECATED** Session persistence strategies
			- **COMPLETED** [memorystore](https://www.npmjs.com/package/memorystore)
			- **COMPLETED** [session-file-store](https://www.npmjs.com/package/session-file-store)
			- **DEPRECATED** [better-sqlite3-session-store](https://www.npmjs.com/package/better-sqlite3-session-store)
			- **DEPRECATED** [connect-mongo](https://www.npmjs.com/package/connect-mongo)
			- **DEPRECATED** [connect-session-sequelize](https://www.npmjs.com/package/connect-session-sequelize)

		- Security
			- **COMPLETED** Add helmet.

		- ClientSupport
			- **COMPLETED** Implement generation of `view_core` files.
			- **UNNECESSARY** Implement more view engines (e.g. jade, ejs).
			- Implement Auth0 (or other passwordless strategy) integration.

		- **DEPRECATED** Remove: Swagger *** Remove It! ***
			- **DEPRECATED** authorization
			- **DEPRECATED** parameter data types
			- **DEPRECATED** service item definitions
			- **DEPRECATED** Add Module: `Express.ClientSupport.Swagger`
				- **DEPRECATED** [https://swagger.io/](https://swagger.io/)
				- **DEPRECATED** [https://blog.logrocket.com/documenting-your-express-api-with-swagger/](https://blog.logrocket.com/documenting-your-express-api-with-swagger/)


	- `WebSocketTransport`
		- **COMPLETED** Validate SessionToken and user_role.
		- **COMPLETED** Origin must have the 'socket-call' varb.
		- **DECLINED** Rename `WebSocketTransport` to `SocketTransport`.
		- Add `ServerAddress.public_address` field.
			This field is optional and defaults to `ServerAddress.address`.
			This address is used when generating client api files.


	- `AmqpTransport`
		- **COMPLETED** Develop: `AmqpTransport`
		- **COMPLETED** Develop: `AmqpClient`
		- Develop: `amqp-client-api`
			- Use (rabbit.js)[http://www.squaremobius.net/rabbit.js/] for browser support.


# Notes

- General
	- Make documentation similar to [webpack](http://webpack.js.org).
	- Use [SuperStruct](https://www.npmjs.com/package/superstruct).

- API Marketplaces
	- [RapidAPI](https://rapidapi.com/)
	- [APILayer](https://apilayer.com/marketplace)
	- [ApiList](https://apilist.fun/)

