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
	function Generate( Server, Transport )
	{
		let code = '';
		let server_name = Server.Settings.AppInfo.name;
		let service_names = Object.keys( Server.Services );
		let server_path = Transport.ServerPath();
		let service_path = Transport.ServicesPath();
		let timestamp = ( new Date() ).toISOString();
		let timestamp_local = ( new Date() ).toString();

		let client_log_service_calls_disabler = '// ';
		if ( Transport.Settings.ClientSupport.client_log_service_calls ) { client_log_service_calls_disabler = ''; }

		let client_log_errors_disabler = '// ';
		if ( Transport.Settings.ClientSupport.client_log_errors ) { client_log_errors_disabler = ''; }

		let client_style_code = '';
		if ( Transport.Settings.ClientSupport.client_api_style === 'ajax' )
		{
			client_style_code = client_style_ajax();
		}
		else if ( Transport.Settings.ClientSupport.client_api_style === 'fetch' )
		{
			client_style_code = client_style_fetch();
		}
		else
		{
			let message = `The configuration setting Web.ClientSupport.client_api_style [${Transport.Settings.ClientSupport.client_api_style}] is not an accepted value.`;
			Server.Log.error( message );
			client_style_code = `console.error( '${message}' );`;
		}

		code += `'use strict';
//---------------------------------------------------------------------
// Web Api Client File for: ${server_name}
// Generated:  ${timestamp}
//---------------------------------------------------------------------
// ${timestamp_local}
//---------------------------------------------------------------------

var WebOrigins = {};    // Service Origins
var WebViews = {};      // Service Views

//---------------------------------------------------------------------
function send_web_message( Method, Address, Payload, Callback )
{
	${client_log_service_calls_disabler}console.log( "WebOrigins Invoking [" + Method + "] on [" + Address + "] -->> ", Payload );
${client_style_code}
	return;
};

//---------------------------------------------------------------------
function handle_message_success( ApiResult, Callback )
{
	if ( ApiResult.ok )
	{
		${client_log_service_calls_disabler}console.log( "WebOrigins Success [" + ApiResult.origin + "] <<-- ", ApiResult.result );
	}
	else
	{
		${client_log_service_calls_disabler}console.log( "WebOrigins Failure [" + ApiResult.origin + "] <<-- " + ApiResult.error );
	}
	Callback( null, ApiResult );
	return;
};

//---------------------------------------------------------------------
function handle_message_error( ErrorMessage, Callback )
{
	${client_log_errors_disabler}console.error( ErrorMessage );
	Callback( ErrorMessage, null );
	return;
};

//---------------------------------------------------------------------
function make_page_url( url, params_object )
{
	let search_params = new URLSearchParams( params_object );
	url += '?' + search_params.toString();
	return url;
}
`;

		// Generate the Service Clients.
		for ( let index = 0; index < service_names.length; index++ )
		{
			let service = Server.Services[ service_names[ index ] ];
			// code = Generate_ServiceHttpClient( Server, service, code, {} );
			let service_name = service.Definition.name;
			code += `\n`;
			code += `//---------------------------------------------------------------------\n`;
			code += `// ${service_name} Origins\n`;
			code += `WebOrigins.${service_name} = {};\n`;

			{ // Service API.
				let origins = service.Origins;
				let origin_keys = Object.keys( origins );
				for ( let index = 0; index < origin_keys.length; index++ )
				{
					let origin = origins[ origin_keys[ index ] ];

					// Get the parameter info.
					let parameters = ``;
					let payload = ``;
					for ( let parameter_index = 0; parameter_index < origin.Fields.length; parameter_index++ )
					{
						// Construct the parameters and payload.
						let parameter_name = origin.Fields[ parameter_index ].name;
						parameters += parameter_name + ', ';
						if ( payload ) { payload += ', '; };
						payload += `${parameter_name}: ${parameter_name}`;
					}
					parameters += 'Callback';
					payload = `{ ${payload} }`;

					// Generate client functions for each verb.
					if ( origin.verbs.includes( 'http-get' ) || origin.verbs.includes( '*' ) )
					{
						code += `WebOrigins.${service_name}.http_get_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { send_web_message( 'get', '${service_path}${service_name}/${origin.name}', ${payload}, Callback ); };\n`;
					}
					if ( origin.verbs.includes( 'http-put' ) || origin.verbs.includes( '*' ) )
					{
						code += `WebOrigins.${service_name}.http_put_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { send_web_message( 'put', '${service_path}${service_name}/${origin.name}', ${payload}, Callback ); };\n`;
					}
					if ( origin.verbs.includes( 'http-post' ) || origin.verbs.includes( '*' ) )
					{
						code += `WebOrigins.${service_name}.http_post_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { send_web_message( 'post', '${service_path}${service_name}/${origin.name}', ${payload}, Callback ); };\n`;
					}
					if ( origin.verbs.includes( 'http-delete' ) || origin.verbs.includes( '*' ) )
					{
						code += `WebOrigins.${service_name}.http_delete_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { send_web_message( 'delete', '${service_path}${service_name}/${origin.name}', ${payload}, Callback ); };\n`;
					}
					if ( origin.verbs.includes( 'rest-get' ) || origin.verbs.includes( '*' ) )
					{
						code += `WebOrigins.${service_name}.rest_get_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { Callback( '${service_name}.${origin.name} is using verb [rest-get] which is not implemented.' ); };\n`;
					}
					if ( origin.verbs.includes( 'rest-put' ) || origin.verbs.includes( '*' ) )
					{
						code += `WebOrigins.${service_name}.rest_put_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { Callback( '${service_name}.${origin.name} is using verb [rest-put] which is not implemented.' ); };\n`;
					}
					if ( origin.verbs.includes( 'rest-post' ) || origin.verbs.includes( '*' ) )
					{
						code += `WebOrigins.${service_name}.rest_post_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { Callback( '${service_name}.${origin.name} is using verb [rest-post] which is not implemented.' ); };\n`;
					}
					if ( origin.verbs.includes( 'rest-delete' ) || origin.verbs.includes( '*' ) )
					{
						code += `WebOrigins.${service_name}.rest_delete_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { Callback( '${service_name}.${origin.name} is using verb [rest-delete] which is not implemented.' ); };\n`;
					}

				}
			}

			{ // Service Views.
				code += `\n`;
				code += `//---------------------------------------------------------------------\n`;
				code += `// ${service_name} Views\n`;
				code += `WebViews.${service_name} = {};\n`;
				let origins = service.Views;
				let origin_keys = Object.keys( origins );
				for ( let index = 0; index < origin_keys.length; index++ )
				{
					let origin = origins[ origin_keys[ index ] ];

					// Get the parameter info.
					let parameters = ``;
					let payload = ``;
					for ( let parameter_index = 0; parameter_index < origin.Fields.length; parameter_index++ )
					{
						// Construct the parameters and payload.
						let parameter_name = origin.Fields[ parameter_index ].name;
						if ( parameters ) { parameters += ', '; };
						parameters += parameter_name;
						if ( payload ) { payload += ', '; };
						payload += `${parameter_name}: ${parameter_name}`;
					}
					payload = `{ ${payload} }`;

					// Generate client function.
					if ( origin.verbs.includes( 'http-get' ) || origin.verbs.includes( '*' ) )
					{
						code += `WebViews.${service_name}.http_get_${origin.name}`;
						code += ` = function ( ${parameters} )`;
						code += ` { return make_page_url( '${server_path}${service_name}/${origin.name}', ${payload} ); };\n`;
					}
					if ( origin.verbs.includes( 'rest-get' ) )
					{
						// console.error( `${service_name}.${origin.name} is using verb [rest-get] which is not implemented.` );
						// Server.Log.warn( `${service_name}.${origin.name} is using verb [rest-get] which is not implemented.` );
					}

				}
			}

		}

		// Return the code.
		return code;
	};


//---------------------------------------------------------------------
function client_style_ajax()
{
	return `
	$.ajax(
		{
			url: Address,
			type: Method,
			data: Payload,
			success:
				function ( ApiResult, textStatus, jqXHR )
				{
					handle_message_success( ApiResult, Callback );
				},
			error:
				function ( jqXHR, textStatus, errorThrown )
				{
					let message = '';
					if ( textStatus ) { message += '[status=' + textStatus + ']'; }
					if ( errorThrown ) { message += ' [error=' + errorThrown + ']'; }
					message = 'Error [' + Method + '] on [' + Address + '] <-- ' + message;
					handle_message_error( message, Callback );
				},
		}
	);
`;
}


//---------------------------------------------------------------------
function client_style_fetch()
{
	return `
	let url = '';
	let options = { method: Method };
	if ( [ 'get', 'head' ].includes( Method ) )
	{
		url = make_page_url( Address, Payload );
	}
	else
	{
		url = Address;
		let form_data = new FormData();
		Object.keys( Payload ).forEach( key => form_data.append( key, Payload[ key ] ) );
		options.body = form_data;
	}
	fetch( url, options )
		.then(
			function ( Response )
			{
				Response.json()
					.then(
						function ( ApiResult )
						{
							handle_message_success( ApiResult, Callback );
						}
					);
			}
		)
		.catch(
			function ( Error )
			{
				handle_message_error( Error.message, Callback );
			}
		);
`;
}


