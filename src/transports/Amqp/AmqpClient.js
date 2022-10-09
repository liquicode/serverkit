'use strict';


const LIB_AMQPLIB = require( 'amqplib' );
const LIB_UID_SAFE = require( 'uid-safe' );


//---------------------------------------------------------------------
exports.NewAmqpClient =
	async function NewAmqpClient( Server, SessionToken_or_UserEmail, Password )
	{
		let transport = Server.Transports.Amqp;
		let amqp_client = {
			QueueClient: null,
			User: null,
			session_token: null,
		};

		//---------------------------------------------------------------------
		// Connect to the message queue.
		amqp_client.QueueClient = await LIB_AMQPLIB.connect(
			transport.Settings.amqp_server_url,
			transport.Settings.ConnectOptions );

		//---------------------------------------------------------------------
		// Define the Call Method.
		amqp_client.Call =
			async function Call( RouteName, Parameters )
			{
				// console.log( "WebSocket Invoking [" + RouteName + "] -->> " + JSON.stringify( Parameters ) );
				Server.Log.trace( `AmqpClient Invoking [${RouteName}] -->> ${JSON.stringify( Parameters )}` );

				// Build the request.
				let request = {
					id: LIB_UID_SAFE.sync( 18 ), // uuidv4(),
					session_token: amqp_client.session_token,
					route_name: RouteName,
					Fields: Parameters,
					callback_name: null,
				};
				request.callback_name = `${request.route_name}.${request.id}`;

				// Send the request and await the response.
				let call_result =
					await new Promise(
						async function ( resolve, reject )
						{
							try
							{
								// Setup the reply callback.
								let amqp_result = null;
								let reply_channel = await amqp_client.QueueClient.createChannel();
								amqp_result = await reply_channel.assertQueue( request.callback_name, transport.Settings.ReplyQueueOptions );
								amqp_result = await reply_channel.consume(
									request.callback_name,
									async function ( message )
									{
										try
										{
											if ( message )
											{
												let message_string = message.content.toString();
												let response = JSON.parse( message_string );
												if ( response.error ) { throw new Error( response.error ); }
												Server.Log.trace( `AmqpClient: Call Success [${request.route_name}] <<-- ${JSON.stringify( response.result )}` );
												resolve( response.result );
											}
										}
										catch ( error )
										{
											Server.Log.error( `AmqpClient: Reply Failure [${request.route_name}] <<-- ${JSON.stringify( error.message )}` );
											reject( error.message );
										}
										finally
										{
											await reply_channel.close();
										}
									},
									{ noAck: true }
								);

								// Send the request.
								let command_channel = await transport.QueueClient.createChannel();
								amqp_result = await command_channel.assertQueue( request.route_name, transport.Settings.CommandQueueOptions );
								amqp_result = await command_channel.sendToQueue(
									request.route_name,
									Buffer.from( JSON.stringify( request ) ),
									{
										contentType: "text/plain",
										// deliveryMode: 1,
										persistent: false,
									},
								);

							}
							catch ( error ) 
							{
								Server.Log.error( `AmqpClient Error: ${JSON.stringify( error.message )}` );
								reject( error.message );
							}
						} );

				return call_result;
			};

		//---------------------------------------------------------------------
		// Define the Close Method.
		amqp_client.Close =
			async function Close()
			{
				if ( amqp_client.QueueClient )
				{
					await amqp_client.QueueClient.close();
				}
				amqp_client.QueueClient = null;
				return;
			};

		//---------------------------------------------------------------------
		// Authenticate.
		if ( Password )
		{
			// Called with ( UserEmail, Password )
			let result =
				await amqp_client.Call( 'Authentication.Login', {
					UserEmail: SessionToken_or_UserEmail,
					Password: Password,
				} );
			if ( result )
			{
				amqp_client.User = result.User;
				amqp_client.session_token = result.session_token;
			}
			else
			{
				Server.Log.error( `AmqpClient: An error occured during authentication.` );
				// console.error( 'An error occured during authentication.' );
			}
		}
		else if ( SessionToken_or_UserEmail )
		{
			// Called with ( SessionToken )
			amqp_client.session_token = SessionToken_or_UserEmail;
		}
		else
		{
			// Called with ()
			amqp_client.session_token = '';
		}

		//---------------------------------------------------------------------
		// Return the socket client.
		return amqp_client;
	};

