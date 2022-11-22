'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_HTTP = require( 'http' );
const LIB_HTTPS = require( 'https' );
const LIB_SOCKET_IO = require( 'socket.io' );

const SRC_SERVER_MODULE = require( LIB_PATH.resolve( __dirname, '..', 'core', 'ServerModule.js' ) );

const SRC_WEBSOCKET_CLIENT = require( './WebSocket/WebSocketClient.js' );
const SRC_WEBSOCKET_CLIENT_API_FILE = require( './WebSocket/WebSocket.ClientSupport.ClientApiFile.js' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{

		// Create the transport.
		let transport = SRC_SERVER_MODULE.NewServerModule(
			Server, 'transport',
			{
				name: 'WebSocket',
				title: "WebSocket Transport",
				description: "Make service origins callable via web-sockets.",
				verbs: [ 'socket-call' ],
			},
			{
				enabled: false,
				server_url_path: '/socket.io/',
				trace_connections: false,
				use_http_server: 'internal',	// One of: 'internal', 'node', or 'web'
				server_timeout: 120000,
				// server_timeout: 5000,
				ServerAddress: {
					protocol: 'http',
					address: '0.0.0.0',
					public_address: '',
					port: 8081,
				},
				ClientSupport: {
					enabled: false,
					client_api_file: '~web-public/_websocket-client-api.js',
					client_log_service_calls: true,				// console.log any messages sent and received.
					client_log_errors: true,					// console.error any errors.
				},
			},
		);


		transport.Routes = null;		// Set during InitializeModule()
		transport.HttpServer = null;	// Set during StartupModule() and ShutdownModule()
		transport.SocketServer = null;	// Set during StartupModule() and ShutdownModule()


		//=====================================================================
		//=====================================================================
		//
		//	Module Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// ServerAddress
		//---------------------------------------------------------------------
		// Returns the server protocol, address, and port.
		//---------------------------------------------------------------------

		transport.ServerAddress =
			function ServerAddress()
			{
				let url = '';
				switch ( transport.Settings.use_http_server )
				{
					case 'internal':
					case 'node':
						let address = transport.Settings.ServerAddress.address;
						if ( transport.Settings.ServerAddress.public_address )
						{
							address = transport.Settings.ServerAddress.public_address;
						}
						if ( address === '0.0.0.0' )
						{
							address = 'localhost';
						}
						url = transport.Settings.ServerAddress.protocol
							+ '://' + address
							+ ':' + transport.Settings.ServerAddress.port;
						break;

					case 'web':
						url = Server.Transports.Web.ServerAddress();
						break;
				}
				return url;
			};


		//---------------------------------------------------------------------
		// ServerPath
		//---------------------------------------------------------------------
		// Returns the root server path.
		// Will always start and end with a '/' character.
		//---------------------------------------------------------------------

		transport.ServerPath =
			function ServerPath()
			{
				let url = transport.Settings.server_url_path;
				if ( !url.startsWith( '/' ) ) { url = '/' + url; }
				if ( !url.endsWith( '/' ) ) { url += '/'; }
				return url;
			};


		//---------------------------------------------------------------------
		// NewWebSocketClient
		//---------------------------------------------------------------------
		// Returns a socket client than be used to access this server.
		// Can provide no arguments for anonymous access.
		// Can provide a SessionToken to continue using an existing session.
		// Can provide UserEmail and Password to establish a new session.
		// The returned socket object contains session information.
		//---------------------------------------------------------------------

		transport.NewWebSocketClient =
			async function NewWebSocketClient( SessionToken_or_UserEmail, Password )
			{
				return await SRC_WEBSOCKET_CLIENT.NewWebSocketClient( Server, SessionToken_or_UserEmail, Password );
			};



		//=====================================================================
		//=====================================================================
		//
		//	Internal Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		function web_socket_handler( Socket, RouteName, Origin )
		{
			let handler =
				async function socket_handler( Payload ) 
				{
					let api_result = {
						ok: true,
						origin: RouteName,
						result: null,
					};
					let invocation_tracer = null;
					try
					{
						if ( !Payload ) { throw new Errors( `Message.Payload is missing!` ); }

						//---------------------------------------------------------------------
						// Authentication Gate
						//---------------------------------------------------------------------

						// Get and validate the session.
						let session_token = Payload.session_token;
						let user = null;
						if ( session_token )
						{
							user = await Server.Services.Authentication.ConnectSession( session_token );
						}

						// Use AnonymousUser if not logged in.
						if ( !user ) { user = JSON.parse( JSON.stringify( Server.Settings.AnonymousUser ) ); }

						// Report.
						invocation_tracer = Server.InvocationTracer( user.user_id, transport.Definition.name, RouteName, null );

						// Check for login requirement.
						if ( Origin.requires_login && ( user.user_role === 'anon' ) )
						{
							throw new Error( 'Authentication.Login is required.' );
						}

						//---------------------------------------------------------------------
						// Authorization Gate
						//---------------------------------------------------------------------

						if ( !Server.AuthorizeOriginAccess( user, Origin ) )
						{
							throw new Error( `Insufficent permission to perform this function.` );
						}

						//---------------------------------------------------------------------
						// Invocation Gate
						//---------------------------------------------------------------------

						// Report.
						Server.Log.debug( invocation_tracer.LogRequest( Payload.Fields ) );

						// Get the parameters.
						let parameter_values = [];
						if ( Origin && Origin.Fields )
						{
							let validation_result = Server.ValidateFieldValues( Origin.Fields, Payload.Fields );
							if ( validation_result.errors.length ) { throw new Error( `Validation errors: ${validation_result.errors.join( '; ' )}` ); }
							parameter_values = Object.values( validation_result.fields );
						}

						//---------------------------------------------------------------------
						// Invocation
						//---------------------------------------------------------------------

						// Do the invocation.
						api_result.result = await Origin.invoke( user, ...parameter_values );
						Server.Log.debug( invocation_tracer.LogResponse( null, api_result.result ) );

					}
					catch ( error )
					{
						api_result.ok = false;
						api_result.error = error.message;
						// if ( invocation_tracer ) { invocation_tracer.LogResponse( api_result.error, null ); }
						// else { Server.Log.error( api_result.error, null ); }
						Server.Log.error( invocation_tracer.LogResponse( api_result.error, null ) );
					}
					finally
					{
						if ( Payload.callback_name ) 
						{
							Socket.emit( Payload.callback_name, api_result );
						}
					}
				};
			return handler;
		}


		//---------------------------------------------------------------------
		async function start_http_server()
		{
			Server.Log.trace( `WebSocket.HttpServer is initializing.` );

			//---------------------------------------------------------------------
			// Create the HTTP Server.
			if ( transport.Settings.ServerAddress.protocol === 'http' )
			{
				transport.HttpServer = LIB_HTTP.createServer();
			}
			else if ( transport.Settings.ServerAddress.protocol === 'https' )
			{
				transport.HttpServer = LIB_HTTPS.createServer();
			}
			else
			{
				throw new Error( Server.Utility.invalid_parameter_value_message(
					'WebSocket.ServerAddress.protocol',
					transport.Settings.ServerAddress.protocol,
					`Must be either 'http' or 'https'.` ) );
			}

			//---------------------------------------------------------------------
			// Configure the HTTP Server.
			transport.HttpServer.timeout = transport.Settings.server_timeout;

			// Begin accepting connections.
			await new Promise(
				function ( resolve, reject )
				{
					transport.HttpServer.listen(
						transport.Settings.ServerAddress.port,
						transport.Settings.ServerAddress.address,
						function ( err ) 
						{
							if ( err ) { reject( err ); }
							else { resolve( true ); }
						} );
				} );


			Server.Log.trace( `WebSocket.HttpServer has initialized.` );
			return;
		}


		//---------------------------------------------------------------------
		async function stop_http_server()
		{
			if ( transport.HttpServer ) 
			{
				// if ( transport.HttpServer.listening ) 
				{
					Server.Log.trace( `WebSocket.HttpServer is stopping. This may take up to ${parseInt( transport.Settings.server_timeout / 1000 )} seconds if connections are being held open.` );
					await new Promise(
						function ( resolve, reject )
						{
							transport.HttpServer.close(
								function ( error ) 
								{
									if ( error ) 
									{
										if ( error.code = 'ERR_SERVER_NOT_RUNNING' ) { resolve( true ); }
										else { reject( error ); }
									}
									else { resolve( true ); }
									return;
								} );
							return;
						} );
					Server.Log.trace( `WebSocket.HttpServer has stopped.` );
				}
			}
			transport.HttpServer = null;
			return;
		}


		//---------------------------------------------------------------------
		async function start_web_socket_server()
		{
			Server.Log.trace( `WebSocket.SocketServer is initializing.` );

			let socket_server_options = {
				// REF: https://socket.io/docs/v4/server-options/
				path: transport.ServerPath(),
				serveClient: true,
				cors: {
					// origin: transport.Settings.ServerAddress.address + ':*',
					// origin: transport.Settings.ServerAddress.address + ':' + transport.Settings.ServerAddress.port,
					origins: [ '*' ],
					// origin: false,
				},
				// credentials: true,
				connect_timeout: 45000,
			};

			if ( transport.Settings.use_http_server === 'internal' )
			{
				// Start Internal Socket Server
				let server_address = transport.ServerAddress();
				let server_port = transport.Settings.ServerAddress.port;

				// transport.SocketServer = LIB_SOCKET_IO( server_address, socket_server_options );
				transport.SocketServer = LIB_SOCKET_IO( server_port, socket_server_options );
				// transport.SocketServer = LIB_SOCKET_IO( socket_server_options );
				// transport.SocketServer.listen( server_port );
				transport.SocketServer.httpServer.timeout = transport.Settings.server_timeout;

				Server.Log.debug( `WebSocket.SocketServer is listening at [${transport.ServerAddress()}].` );
			}
			else if ( transport.Settings.use_http_server === 'node' )
			{
				// Start Node Http Server
				await start_http_server();
				Server.Log.debug( `WebSocket.HttpServer is listening at [${transport.ServerAddress()}].` );
				// Start Socket Server
				transport.SocketServer = LIB_SOCKET_IO( transport.HttpServer, socket_server_options );
				Server.Log.debug( `WebSocket.SocketServer is listening at [${transport.ServerAddress()}].` );
			}
			else if ( transport.Settings.use_http_server === 'web' )
			{
				// Start Socket Server, Connected to Express
				transport.SocketServer = LIB_SOCKET_IO( Server.Transports.Web.HttpServer, socket_server_options );
				Server.Log.debug( `WebSocket.SocketServer is listening at [${transport.ServerAddress()}]` );
			}
			else
			{
				throw new Error( Server.Utility.invalid_parameter_value_message(
					'WebSocket.HttpServer.protocol',
					transport.Settings.use_http_server,
					`Must be either 'internal', 'node', or 'web'.` ) );
			}

			Server.Log.trace( `WebSocket.SocketServer has initialized.` );
			return;
		}


		//---------------------------------------------------------------------
		async function stop_web_socket_server()
		{
			if ( transport.SocketServer ) 
			{
				Server.Log.trace( `WebSocket.SocketServer is stopping. This may take up to ${parseInt( transport.Settings.server_timeout / 1000 )} seconds if connections are being held open.` );
				await new Promise(
					function ( resolve, reject )
					{
						transport.SocketServer.close(
							function ( error ) 
							{
								if ( error ) 
								{
									if ( error.code = 'ERR_SERVER_NOT_RUNNING' ) { resolve( true ); }
									else { reject( error ); }
								}
								else { resolve( true ); }
								return;
							} );
						return;
					} );
				Server.Log.trace( `WebSocket.SocketServer has stopped.` );
			}
			transport.SocketServer = null;
			return;
		}


		//=====================================================================
		//=====================================================================
		//
		//	Module Control
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		//	Initialize Module
		//---------------------------------------------------------------------
		//	Server has loaded and configurations are set.
		//	Modules should finalize their Definition here.
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		transport.InitializeModule =
			async function InitializeModule()
			{
				// Build the route map.
				transport.Routes = {};
				await Server.VisitOrigins(
					function ( Service, Origin )
					{
						if ( Origin )
						{
							if ( Origin.verbs.includes( 'socket-call' ) || Origin.verbs.includes( '*' ) )
							{
								let route_name = `${Service.Definition.name}.${Origin.name}`;
								if ( transport.Routes[ route_name ] !== undefined ) { throw new Error( `WebSocket: Route name [${route_name}] already exists!` ); }
								transport.Routes[ route_name ] = {
									route_name: route_name,
									Service: Service,
									Origin: Origin,
								};
							}
						}
						return;
					}
				);

				// Return
				return;
			};


		//---------------------------------------------------------------------
		//	Startup Module
		//---------------------------------------------------------------------
		//	Server has been initialized and is now starting up.
		//---------------------------------------------------------------------


		transport.StartupModule =
			async function StartupModule()
			{
				if ( transport.HttpServer ) { throw new Error( `WebSocket.HttpServer is already running. Call the Server.Shutdown() function to shut down first.` ); }
				if ( transport.SocketServer ) { throw new Error( `WebSocket.SocketServer is already running. Call the Server.Shutdown() function to shut down first.` ); }

				//---------------------------------------------------------------------
				// Create Socket Server
				await start_web_socket_server();

				//---------------------------------------------------------------------
				// Initialize Socket Server
				transport.SocketServer.on( 'connection',
					( Socket ) =>
					{
						//---------------------------------------------------------------------
						function trace_connection( Message )
						{
							if ( transport.Settings.trace_connections )
							{
								Server.Log.trace( `WebSocket Trace Connection: ${Message}` );
							}
						}

						trace_connection( `New socket connection received.` );

						Socket.on( 'disconnecting', async function ( Reason )
						{ trace_connection( `Socket is disconnecting because [${Reason}].` ); } );

						Socket.on( 'disconnect', async function ( Reason )
						{ trace_connection( `Socket has disconnected because [${Reason}].` ); } );

						Socket.on( 'connect', async function ( Reason )
						{ trace_connection( `connected.` ); } );

						Socket.on( 'connect_error', async function ( Reason )
						{ trace_connection( `connection error [${Reason}]` ); } );

						//---------------------------------------------------------------------
						// Initialize new socket endpoints.
						let route_keys = Object.keys( transport.Routes );
						for ( let route_index = 0; route_index < route_keys.length; route_index++ )
						{
							let route_key = route_keys[ route_index ];
							let route = transport.Routes[ route_key ];
							let route_handler = web_socket_handler( Socket, route.route_name, route.Origin );
							Socket.on( route.route_name, route_handler );
						}

						return;
					} );

				//---------------------------------------------------------------------
				// Generate client api file.
				if ( transport.Settings.ClientSupport
					&& transport.Settings.ClientSupport.enabled
					&& transport.Settings.ClientSupport.client_api_file )
				{
					let code = await SRC_WEBSOCKET_CLIENT_API_FILE.Generate( Server, transport );
					let filename = Server.ResolveApplicationPath( transport.Settings.ClientSupport.client_api_file );
					LIB_FS.mkdirSync( LIB_PATH.dirname( filename ), { recursive: true } );
					LIB_FS.writeFileSync( filename, code );
					Server.Log.debug( `WebSocket.ClientSupport generated client file [${transport.Settings.ClientSupport.client_api_file}].` );
				}

				// Return
				return;
			};


		//---------------------------------------------------------------------
		//	Shutdown Module
		//---------------------------------------------------------------------
		//	Server has been running and is now shutting down.
		//---------------------------------------------------------------------


		transport.ShutdownModule =
			async function ShutdownModule()
			{

				// Shutdown the socket server.
				if ( transport.SocketServer )
				{
					await stop_web_socket_server();
				}

				// Shutdown the http server.
				if ( transport.HttpServer ) 
				{
					await stop_http_server();
				}

				// Return
				return;
			};


		//---------------------------------------------------------------------
		// Return the Transport.
		//---------------------------------------------------------------------


		return transport;
	};
