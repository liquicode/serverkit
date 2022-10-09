'use strict';


const LIB_PATH = require( 'path' );
const LIB_AMQPLIB = require( 'amqplib' );

const SRC_SERVER_MODULE = require( LIB_PATH.resolve( __dirname, '..', 'core', 'ServerModule.js' ) );

const SRC_AMQP_CLIENT = require( './Amqp/AmqpClient.js' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{

		// Create the transport.
		let transport = SRC_SERVER_MODULE.NewServerModule(
			Server, 'transport',
			{
				name: 'Amqp',
				title: "Amqp Transport",
				description: "Make service origins callable via the amqp protocol.",
				verbs: [ 'amqp-call' ],
			},
			{
				enabled: false,
				amqp_server_url: 'amqp://guest:guest@localhost:5672',
				ConnectOptions: {
					connectRetries: 30,
					connectRetryInterval: 1000,
				},
				CommandQueueOptions: {
					exclusive: false,
					durable: false,
					autoDelete: true,
				},
				ReplyQueueOptions: {
					// exclusive: true,
					exclusive: false,
					durable: false,
					autoDelete: true,
				},
				ClientSupport: {
					enabled: false,
					amqp_api_client: '_amqp-client-api.js',
				},
			}
		);

		transport.Routes = null;		// Set during InitializeModule()
		transport.QueueClient = null;	// Set during StartupModule()


		//=====================================================================
		//=====================================================================
		//
		//	Module Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// NewAmqpClient
		//---------------------------------------------------------------------
		// Returns an amqp client than be used to access this server.
		// Can provide no arguments for anonymous access.
		// Can provide a SessionToken to continue using an existing session.
		// Can provide UserEmail and Password to establish a new session.
		// The returned client object contains session information.
		//---------------------------------------------------------------------

		transport.NewAmqpClient =
			async function NewAmqpClient( SessionToken_or_UserEmail, Password )
			{
				return await SRC_AMQP_CLIENT.NewAmqpClient( Server, SessionToken_or_UserEmail, Password );
			};



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
							if ( Origin.verbs.includes( 'amqp-call' ) || Origin.verbs.includes( '*' ) )
							{
								let route_name = `${Service.Definition.name}.${Origin.name}`;
								if ( transport.Routes[ route_name ] !== undefined ) { throw new Error( `Amqp: Route name [${route_name}] already exists!` ); }
								transport.Routes[ route_name ] = {
									route_name: route_name,
									Service: Service,
									Origin: Origin,
									channel: null,
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
				if ( transport.QueueClient ) { throw new Error( `Amqp.QueueClient is already running. Call the Server.Shutdown() function to shut down first.` ); }
				let amqp_result = null;

				//---------------------------------------------------------------------
				// Connect to the message queue.
				transport.QueueClient = await LIB_AMQPLIB.connect(
					transport.Settings.amqp_server_url,
					transport.Settings.ConnectOptions );

				//---------------------------------------------------------------------
				// Add the routes.
				let route_keys = Object.keys( transport.Routes );
				for ( let route_key_index = 0; route_key_index < route_keys.length; route_key_index++ )
				{
					let route = transport.Routes[ route_keys[ route_key_index ] ];

					// Create the channel.
					route.channel = await transport.QueueClient.createChannel();
					amqp_result = await route.channel.prefetch( 1 );
					amqp_result = await route.channel.assertQueue( route.route_name, transport.Settings.CommandQueueOptions );

					// Create the route handler.
					amqp_result = await route.channel.consume(
						route.route_name,
						async function ( message )
						{
							if ( message === undefined ) { return; }
							if ( message === null ) { return; }
							try
							{
								let message_string = message.content.toString();
								let request = JSON.parse( message_string );
								let response =
								{
									id: request.id,
									ok: true,
								};

								// Invoke the origin.
								try
								{
									// Load the session.
									let user = await Server.Services.Authentication.ConnectSession( request.session_token );
									if ( !user ) { user = JSON.parse( JSON.stringify( Server.Settings.AnonymousUser ) ); }

									// Validate user authorization.
									if ( !Server.AuthorizeOriginAccess( user, route.Origin ) )
									{
										throw new Error( `This user [${user.user_id}] does not have permission to perform this function.` );
									}

									// Validate the parameter values.
									let parameter_values = [];
									if ( request.Fields )
									{
										let validation_result = Server.ValidateFieldValues( route.Origin.Fields, request.Fields );
										if ( validation_result.errors.length ) { throw new Error( `Validation errors: ${validation_result.errors.join( '; ' )}` ); }
										parameter_values = Object.values( validation_result.fields );
									}

									// Invoke the origin.
									response.result = await route.Origin.invoke( user, ...parameter_values );

								}
								catch ( error ) 
								{
									response.ok = false;
									response.error = error.message;
								}

								// Send the reply.
								if ( request.callback_name )
								{
									// let reply_queue_name = `${route.route_name}/${response.id}`;
									let reply_channel = await transport.QueueClient.createChannel();
									amqp_result = await reply_channel.assertQueue( request.callback_name, transport.Settings.ReplyQueueOptions );
									amqp_result = await reply_channel.sendToQueue(
										request.callback_name,
										Buffer.from( JSON.stringify( response ) ),
										{
											contentType: "text/plain",
											// deliveryMode: 1,
											persistent: false,
										},
									);
								}

								// Confirm that message was processed.
								route.channel.ack( message );

							}
							catch ( error )
							{
								Server.Log.error( `Amqp Error: ${error.message}` );
								route.channel.nack( message, false, false );
							}
							finally
							{
							}
							return;
						} );

				}


				//---------------------------------------------------------------------
				// Generate client api file.
				if ( transport.Settings.ClientSupport
					&& transport.Settings.ClientSupport.enabled
					&& transport.Settings.ClientSupport.client_api_file )
				{
					// let code = SRC_WEBSOCKET_CLIENT_API_FILE.Generate( Server, transport );
					// let filename = Server.ResolveApplicationPath( transport.Settings.ClientSupport.client_api_file );
					// LIB_FS.mkdirSync( LIB_PATH.dirname( filename ), { recursive: true } );
					// LIB_FS.writeFileSync( filename, code );
					// Server.Log.trace( `WebSocket.ClientSupport generated client file [${filename}].` );
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
				// Close the command channels.
				let route_keys = Object.keys( transport.Routes );
				for ( let route_key_index = 0; route_key_index < route_keys.length; route_key_index++ )
				{
					let route = transport.Routes[ route_keys[ route_key_index ] ];
					if ( route.channel )
					{
						// await route.channel.close();
						route.channel = null;
					}
				}

				// Disconnect from the message queue.
				if ( transport.QueueClient )
				{
					await transport.QueueClient.close();
					transport.QueueClient = null;
				}

				// Return
				return;
			};


		//---------------------------------------------------------------------
		// Return the Transport.
		//---------------------------------------------------------------------


		return transport;
	};
