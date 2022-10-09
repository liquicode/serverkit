
About Server.Initialize()
---------------------------------------------------------------------

`Server.Initialize()` initializes a server by performing the following tasks:
- Generates a `Defaults.json` file if the server was created with a `ServerOptions.defaults_filename` setting.
- Generates a `Settings.json` file if the server was created with a `ServerOptions.settings_filename` setting.
- Sets the runtime environment by setting the `NODE_ENV` environment variable.
- Initializes all loaded services by calling `service.InitializeModule()` and then `Server.ValidateModule( service )`.
- Initializes all loaded transports by calling `transport.InitializeModule()` and then `Server.ValidateModule( transport )`.

After calling `Server.Initialize()`, all services and transports should be fully functional and callable by your application code.
Also, the server's configuration should be set and not modified after this point.

**Calling Initialize on a new Server**

~~~javascript
const ServerKit = require( '@liquicode/lib-server-kit' );
let server = ServerKit.NewServer( 'MyServer', __dirname );
await server.Initialize();
~~~

**Log output after calling Initialize**

~~~
| 03:46:14 | 0523 | T | Server initialized module [Log].
| 03:46:14 | 0529 | D | Runtime environment set to: development
| 03:46:14 | 0531 | T | Server initialized service [ServerAccounts].
| 03:46:14 | 0531 | T | Server initialized service [Authentication].
| 03:46:14 | 0531 | T | Server initialized service [ServerManagement].
~~~


