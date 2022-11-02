'use strict';


//=====================================================================
//=====================================================================
//
//		WebServer - Web Application Services (Origins and Views)
//
//=====================================================================
//=====================================================================


exports.MountServices =
	function MountServices( CTX )
	{


		//=====================================================================
		//=====================================================================
		//
		//		Initialize
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// Add service origins.
		let service_keys = Object.keys( CTX.Server.Services );
		for ( let index = 0; index < service_keys.length; index++ )
		{
			let service_key = service_keys[ index ];
			let service = CTX.Server.Services[ service_key ];
			if ( !service.Settings.enabled ) { continue; }

			let server_path = CTX.Transport.ServerPath();
			let services_path = CTX.Transport.ServicesPath();

			// Add the service origins
			let origin_count = add_service_origins( service, `${services_path}${service.Definition.name}` );
			CTX.Server.Log.trace( `Added ${origin_count} Origins for service [${services_path}${service.Definition.name}].` );

			// Add the service pages
			let view_count = add_service_pages( service, `${server_path}${service.Definition.name}` );
			CTX.Server.Log.trace( `Added ${view_count} Views for service [${server_path}${service.Definition.name}].` );
		}


		//=====================================================================
		//=====================================================================
		//
		//		Service Origins
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		function add_service_origins( Service, ParentPath )
		{
			let service_name = Service.Definition.name;

			//---------------------------------------------------------------------
			// Add origins for this service.
			let origin_count = 0;
			let origin_keys = Object.keys( Service.Origins );
			for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
			{
				let origin_key = origin_keys[ origin_index ];
				let origin = Service.Origins[ origin_key ];

				if ( !origin.invoke )
				{
					console.error( `Origin [${service_name}.${origin.name}] has no invocation function!` );
				}

				//---------------------------------------------------------------------
				// This is the actual request handler that services this origin.
				async function express_origin_handler( request, response, next ) 
				{

					// Invoke the origin function.
					// Wrap return values in a api_result object.
					let api_result = {
						ok: true,
						origin: `${service_name}/${origin.name}`,
					};
					try
					{
						// Get the origin parameters.
						let parameter_values = Object.values( request.origin_parameters );

						// Invoke the origin function. (finally!)
						api_result.result = await origin.invoke( request.user, ...parameter_values );

						// Post-Processing
						let full_origin_name = `${service_name}/${origin.name}`;
						switch ( full_origin_name )
						{
							// Special exceptions to handle Session Management.
							case 'Authentication/Signup':
								if ( !api_result.result )
								{
									response.status( 401 ).send( 'Logout failed.' );
								}
								else
								{
									CTX.Transport.SetServerCookie( response, api_result.result.session_token );
									response.redirect( 302, CTX.Transport.ServerPath() );
								}
								break;
							case 'Authentication/Login':
								if ( !api_result.result )
								{
									response.status( 401 ).send( 'Incorrect username or password.' );
								}
								else
								{
									CTX.Transport.SetServerCookie( response, api_result.result.session_token );
									response.redirect( 302, CTX.Transport.ServerPath() );
								}
								break;
							case 'Authentication/Logout':
								if ( !api_result.result )
								{
									response.status( 401 ).send( 'Logout failed.' );
								}
								else
								{
									CTX.Transport.SetServerCookie( response, '' );
									response.redirect( 302, CTX.Transport.ServerPath() );
								}
								break;

							// Default processing: Return the result.
							default:
								response.send( api_result );
								break;
						}
					}
					catch ( error )
					{
						api_result.ok = false;
						api_result.error = error.message;
						// Server.Log.error( `Error in [${api_result.origin}]: ${api_result.error}` );
					}
					// Return the api_result back to InvocationGate.
					return api_result;
				}

				//---------------------------------------------------------------------
				// Add routes for each http verb.
				let route_name = `${service_name}.${origin.name}`;
				if ( origin.verbs.includes( 'http-get' ) || origin.verbs.includes( '*' ) )
				{
					CTX.Transport.ExpressApp.get( `${ParentPath}/${origin.name}`,
						CTX.Transport.AuthenticationGate( origin ),
						CTX.Transport.AuthorizationGate( origin ),
						CTX.Transport.InvocationGate( origin, route_name, express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'http-post' ) || origin.verbs.includes( '*' ) )
				{
					CTX.Transport.ExpressApp.post( `${ParentPath}/${origin.name}`,
						CTX.Transport.AuthenticationGate( origin ),
						CTX.Transport.AuthorizationGate( origin ),
						CTX.Transport.InvocationGate( origin, route_name, express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'http-put' ) || origin.verbs.includes( '*' ) )
				{
					CTX.Transport.ExpressApp.put( `${ParentPath}/${origin.name}`,
						CTX.Transport.AuthenticationGate( origin ),
						CTX.Transport.AuthorizationGate( origin ),
						CTX.Transport.InvocationGate( origin, route_name, express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'http-delete' ) || origin.verbs.includes( '*' ) )
				{
					CTX.Transport.ExpressApp.delete( `${ParentPath}/${origin.name}`,
						CTX.Transport.AuthenticationGate( origin ),
						CTX.Transport.AuthorizationGate( origin ),
						CTX.Transport.InvocationGate( origin, route_name, express_origin_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'rest-get' ) || origin.verbs.includes( '*' ) )
				{
					// console.error( `${service_name}.${origin.name} is using verb [rest-get] which is not implemented.` );
					// CTX.Server.Log.warn( `${service_name}.${origin.name} is using verb [rest-get] which is not implemented.` );
				}
				if ( origin.verbs.includes( 'rest-put' ) || origin.verbs.includes( '*' ) )
				{
					// console.error( `${service_name}.${origin.name} is using verb [rest-put] which is not implemented.` );
					// CTX.Server.Log.warn( `${service_name}.${origin.name} is using verb [rest-put] which is not implemented.` );
				}
				if ( origin.verbs.includes( 'rest-post' ) || origin.verbs.includes( '*' ) )
				{
					// console.error( `${service_name}.${origin.name} is using verb [rest-post] which is not implemented.` );
					// CTX.Server.Log.warn( `${service_name}.${origin.name} is using verb [rest-post] which is not implemented.` );
				}
				if ( origin.verbs.includes( 'rest-delete' ) || origin.verbs.includes( '*' ) )
				{
					// console.error( `${service_name}.${origin.name} is using verb [rest-delete] which is not implemented.` );
					// CTX.Server.Log.warn( `${service_name}.${origin.name} is using verb [rest-delete] which is not implemented.` );
				}

			}

			return origin_count;
		};


		//=====================================================================
		//=====================================================================
		//
		//		Service Views
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		function add_service_pages( Service, ParentPath )
		{
			let service_name = Service.Definition.name;

			// Add origins for this service.
			let origin_count = 0;
			let origin_names = Object.keys( Service.Views );
			for ( let origin_index = 0; origin_index < origin_names.length; origin_index++ )
			{
				let origin_key = origin_names[ origin_index ];
				let origin = Service.Views[ origin_key ];

				//---------------------------------------------------------------------
				// This is the actual request handler that services this origin.
				async function express_view_handler( request, response, next ) 
				{
					// Get the origin parameters.
					let parameter_map = request.origin_parameters;

					// Render the view.
					// - Wrap return values in a api_result object.
					let api_result = {
						ok: true,
						origin: `${service_name}/${origin.name}`,
					};
					try
					{
						let view_template_name = origin.view;
						if ( !view_template_name )
						{
							view_template_name = `Services/${service_name}/${origin.name}`;
						}
						response.render(
							view_template_name,
							{
								Server: CTX.Server,
								User: request.user,
								UserViews: CTX.Transport.GetUserViews( request.user, true ),
								Service: Service.Definition,
								Origin: origin,
								Parameters: parameter_map,
							} );
						api_result.result = "OK";
					}
					catch ( error )
					{
						api_result.ok = false;
						api_result.error = error.message;
						// Server.Log.error( `Error in [${api_result.origin}]: ${api_result.error}` );
						response.send( api_result ); // Returning an error object to a page request! Should we redirect to a special error page?
					}
					// Return 'undefined' back to InvocationGate to avoid propagating the api_result.
					return;
				}

				//---------------------------------------------------------------------
				// Add routes for each http verb.
				let route_name = `${service_name}.${origin.name}`;
				if ( origin.verbs.includes( 'http-get' ) || origin.verbs.includes( '*' ) )
				{
					CTX.Transport.ExpressApp.get( `${ParentPath}/${origin.name}`,
						CTX.Transport.AuthenticationGate( origin ),
						CTX.Transport.AuthorizationGate( origin ),
						CTX.Transport.InvocationGate( origin, route_name, express_view_handler ),
					);
					origin_count++;
				}
				if ( origin.verbs.includes( 'rest-get' ) || origin.verbs.includes( '*' ) )
				{
					// console.error( `${service_name}.${origin.name} is using verb [rest-get] which is not implemented.` );
					// CTX.Server.Log.warn( `${service_name}.${origin.name} is using verb [rest-get] which is not implemented.` );
				}

			}

			return origin_count;
		};


		//---------------------------------------------------------------------
		return;
	};

