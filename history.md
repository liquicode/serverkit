# Version History


## v0.0.30


- Fixed inconsistent usage of client callback between `WebTransport` and `WebSocketTransport`.
- Added `ServerAddress.public_address` field in `WebTransport` and `WebSocketTransport`.
	This field is optional and defaults to `ServerAddress.address`.
	This address is used when generating client api files.


---


## TODO for v0.1.0


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
		- allow js-style syntax for user input
	- **COMPLETED** When reporting file and folder names, use a truncated version of the name that is relative to the application folder.
	- **COMPLETED** Make `VisitOrigins()` an async function.
	- **COMPLETED** Make `VisitViews()` an async function.
	- **COMPLETED** Rename `Origin.Parameters` to `Origin.Fields`, to match the vernacular found elsewhere.
	- **COMPLETED** Rename `Server.NewField()` to `Server.NewFieldDefinition()`.
	- **COMPLETED** Develop a `Server.NewOriginDefinition()` function to make it easier to define Origins.
	- **COMPLETED** Allow wildcards in `Origin.verbs`.
	- Make a task scheduler to invoke origins.


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
	- Add: `ProxyTo` Setting which informs transports to proxy all calls for a service to a remote server.
	- Rename configuration setting `StorageService.Defaults.Storage` to `StorageService.Defaults.UserStorage`
	- Add Origins using their `Definition.name` field rather than the programmatic name. Or remove the `Definition.name` field.


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


- `ServerManagement` Service
	- **COMPLETED** Develop: Origin `ServerManagement.Diagnostics()`
	- **COMPLETED** Develop: Origin `ServerManagement.RestartServer()`
	- **COMPLETED** Develop: Origin `ServerManagement.StopServer()`
	- Explorer UI
		- **COMPLETED** Make 'Response' box resizable
		- **COMPLETED** Fix: The client-api implementation uses $.ajax which drops any empty array or object parameters
		- Select user to Invoke As


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

