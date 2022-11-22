'use strict';


//=====================================================================
//=====================================================================
//
//		Generate Javascript Client API
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
exports.Generate =
	async function Generate( Server, Transport )
	{
		let code = '';
		let server_name = Server.Settings.AppInfo.name;
		// let service_names = Object.keys( Server.Services );
		// let server_path = Transport.ServerPath();
		// let service_path = Transport.ServicesPath();
		let timestamp = ( new Date() ).toISOString();
		let timestamp_local = ( new Date() ).toString();

		let client_log_service_calls_disabler = '// ';
		if ( Transport.Settings.ClientSupport.client_log_service_calls ) { client_log_service_calls_disabler = ''; }

		let client_log_errors_disabler = '// ';
		if ( Transport.Settings.ClientSupport.client_log_errors ) { client_log_errors_disabler = ''; }

		let socket_io_initializer = '';
		switch ( Transport.Settings.use_http_server )
		{
			case 'web':
				socket_io_initializer = 'io()';
				break;
			case 'internal':
			case 'node':
				socket_io_initializer = `io( "${Transport.ServerAddress()}", { path: "${Transport.ServerPath()}" } )`;
				break;
		}

		code += `'use strict';
//---------------------------------------------------------------------
// WebSocket Api Client File for: ${server_name}
// Generated:  ${timestamp}
//---------------------------------------------------------------------
// ${timestamp_local}
//---------------------------------------------------------------------


var WebSocket = {};


//---------------------------------------------------------------------
function get_session_token()
{
	var cookies = document.cookie.split( '; ' );
	for( var index = 0; index < cookies.length; index++ )
	{
		var cookie = cookies[ index ];
		if( cookie.startsWith( '${server_name}=' ) )
		{
			cookie = cookie.substring( '${server_name}='.length );
			return cookie;
		}
	}
	return '';
}


//---------------------------------------------------------------------
function set_session_token( SessionToken )
{
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var  expires = "expires="+ d.toUTCString();
	document.cookie = "${server_name}=" + SessionToken + ";" + expires + ";path=/";
	return;
}


//---------------------------------------------------------------------
function send_socket_message( RouteName, Fields, Callback )
{
	${client_log_service_calls_disabler}console.log( "WebSocket Invoking [" + RouteName + "] -->> ", Fields );

	var payload = {
		id: uuidv4(),
		session_token: WebSocket._Session.session_token,
		route_name: RouteName,
		Fields: Fields,
		callback_name: null,
	};

	// Load the session token.
	payload.session_token = WebSocket._Session.session_token;

	// Setup the callback.
	payload.callback_name = RouteName + '->' + payload.id;
	function socket_proxy_callback( api_result )
	{
		var error = null;
		if ( api_result.ok )
		{
			${client_log_service_calls_disabler}console.log( "WebSocket Success [" + api_result.origin + "] <-- ", api_result.result );
		}
		else
		{
			${client_log_errors_disabler}console.log( "WebSocket Failure [" + api_result.origin + "] <-- " + api_result.error );
			error = api_result.error;
		}
		if ( Callback )
		{
			Callback( error, api_result );
		}
		return;
	}
	WebSocket._Session.socket.once( payload.callback_name, socket_proxy_callback );

	// Send the payload.
	WebSocket._Session.socket.emit( RouteName, payload );

	return;
};

WebSocket._Session = {
	socket: ${socket_io_initializer},
	session_token: get_session_token(),
};

WebSocket.Login =
	function Login( UserEmail, Password, Callback )
	{
		WebSocket.Authentication.Login(
			UserEmail, Password,
			function authentication_callback( ApiResult )
			{
				if( ApiResult.ok )
				{
					set_session_token( ApiResult.result.session_token );
				}
				if( Callback ) { Callback( ApiResult ); }
				return;
			}
		)
	}

`;

		// Generate the Service Clients.
		await Server.VisitOrigins(
			function ( Service, Origin )
			{
				if ( Origin )
				{
					if ( Origin.verbs.includes( 'socket-call' ) || Origin.verbs.includes( '*' ) )
					{
						// Get the parameter info.
						let parameters = ``;
						let payload = ``;
						for ( let parameter_index = 0; parameter_index < Origin.Fields.length; parameter_index++ )
						{
							// Construct the parameters and payload.
							let parameter_name = Origin.Fields[ parameter_index ].name;
							parameters += parameter_name + ', ';
							if ( payload ) { payload += ', '; };
							payload += `${parameter_name}: ${parameter_name}`;
						}
						parameters += 'Callback';
						payload = `{ ${payload} }`;

						let route_name = `${Service.Definition.name}.${Origin.name}`;
						code += `WebSocket.${route_name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { send_socket_message( '${route_name}', ${payload}, Callback ); };\n`;
					}
				}
				else
				{
					// Define a new service container.
					code += `\n`;
					code += `//---------------------------------------------------------------------\n`;
					code += `// ${Service.Definition.name} Service\n`;
					code += `WebSocket.${Service.Definition.name} = {};\n`;
				}
				return;
			} );


		// Return the code.
		return code;
	};


