'use strict';


const LIB_SOCKET_IO_CLIENT = require( 'socket.io-client' );
const LIB_UID_SAFE = require( 'uid-safe' );


//---------------------------------------------------------------------
exports.NewWebSocketClient =
	async function NewWebSocketClient( Server, SessionToken_or_UserEmail, Password )
	{
		let socket_client = {
			Socket: null,
			User: null,
			session_token: null,
		};

		//---------------------------------------------------------------------
		// Create the socket.
		let server_address = Server.Transports.WebSocket.ServerAddress();
		let server_path = Server.Transports.WebSocket.ServerPath();
		let socket_options = {
			path: server_path,
			autoConnect: true,
		};
		socket_client.Socket = LIB_SOCKET_IO_CLIENT( server_address, socket_options );

		//---------------------------------------------------------------------
		// Define the Call Method.
		socket_client.Call =
			async function Call( RouteName, Parameters )
			{
				// console.log( "WebSocket Invoking [" + RouteName + "] -->> " + JSON.stringify( Parameters ) );
				Server.Log.trace( `WebSocketClient Invoking [${RouteName}] -->> ${JSON.stringify( Parameters )}` );

				let payload = {
					id: LIB_UID_SAFE.sync( 18 ), // uuidv4(),
					session_token: socket_client.session_token,
					route_name: RouteName,
					Fields: Parameters,
					callback_name: null,
				};

				let api_result =
					await new Promise(
						function ( resolve, reject )
						{
							// Setup the callback.
							payload.callback_name = RouteName + '->' + payload.id;
							function socket_proxy_callback( api_result )
							{
								if ( api_result.ok )
								{
									Server.Log.trace( `WebSocketClient: SocketApi Success [${api_result.origin}] <<-- ${JSON.stringify( api_result.result )}` );
									// console.log( "SocketApi Success [" + api_result.origin + "] <-- " + JSON.stringify( api_result.result ) );
									resolve( api_result );
								}
								else
								{
									Server.Log.error( `WebSocketClient: SocketApi Failure [${api_result.origin}] <<-- ${JSON.stringify( api_result.error )}` );
									// console.error( "SocketApi Failure [" + api_result.origin + "] <-- " + api_result.error );
									reject( api_result.error );
								}
								return api_result;
							}
							socket_client.Socket.once( payload.callback_name, socket_proxy_callback );

							// Send the payload.
							socket_client.Socket.emit( RouteName, payload );
						} );

				return api_result.result;
			};

		//---------------------------------------------------------------------
		// Define the Close Method.
		socket_client.Close =
			async function Close()
			{
				if ( socket_client.Socket )
				{
					socket_client.Socket.disconnect();
				}
				socket_client.Socket = null;
				return;
			};

		//---------------------------------------------------------------------
		// Authenticate.
		if ( Password )
		{
			// Called with ( UserEmail, Password )
			let result =
				await socket_client.Call( 'Authentication.Login', {
					UserEmail: SessionToken_or_UserEmail,
					Password: Password,
				} );
			if ( result )
			{
				socket_client.User = result.User;
				socket_client.session_token = result.session_token;
			}
			else
			{
				Server.Log.error( `WebSocketClient: An error occured during authentication.` );
				// console.error( 'An error occured during authentication.' );
			}
		}
		else if ( SessionToken_or_UserEmail )
		{
			// Called with ( SessionToken )
			socket_client.session_token = SessionToken_or_UserEmail;
		}
		else
		{
			// Called with ()
			socket_client.session_token = '';
		}

		//---------------------------------------------------------------------
		// Return the socket client.
		return socket_client;
	};

