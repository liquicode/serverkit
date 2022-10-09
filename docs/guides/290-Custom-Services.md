
# Custom Services

### Develop a Custom Service

You define your service in a javascript file stored in the `services` folder under your server's root folder.
All javascript files in this folder get loaded as services into the server.

```javascript
// MyServer.js : A file in your server's root folder.
const LIB_SERVER_KIT = require( '@liquicode/lib-server-kit' );
// Create a new server.
let server = LIB_SERVER_KIT.NewServer( 'MyServer', __dirname );
// Initialize and startup.
await server.Initialize(); // Services ready for inetrnal use.
await server.Startup();    // Services now available via transports.
```

```javascript
// MyService.js : A file in your 'services' folder.
exports.Construct =
	function Construct( Server )
	{
		// Create a new application service.
		let service = Server.NewApplicationService( Server );
		
		// Set the service definition.
		service.Definition.name = 'MyService';
		service.Definition.title = 'My Service';
		service.Definition.description = "This is my custom application service.";
		
		// Define my magic function.
		async function DoSomeMagic( User, Toadstools, Sparkles )
		{
			let amount = Toadstools * Sparkles;
			let message = `${User.user_name} does ${amount} magics.`;
			return message;
		}

		// Export my magic function to the server.
		service.DoSomeMagic = DoSomeMagic;

		// Return this service to the server.
		return service.
	};
```

### Expose Service Functions to Transports

Add an entry in the service definition to describe your service functions.
The server uses a service's Definition to know how to respond to client requests
and marshal parameters back and forth over a transport.

```javascript
// MyService.js : A file in your 'services' folder.
exports.Construct =
	function Construct( Server )
	{

		...

		// Describe an  origin for my magic function.
		service.Definition.Origins.DoSomeMagic = {
			name: 'DoSomeMagic',
			description: 'Does magics.',
			verbs: [ 'socket-call', 'http-get', 'http-post' ],
			Parameters: [
				Server.NewField( {
					name: 'Toadstools',
					type: 'integer',
					required: true,
				} ),
				Server.NewField( {
					name: 'Sparkles',
					type: 'integer',
					required: true,
				} ),
			],
		};

		// Return this service to the server.
		return service.
	};
```
