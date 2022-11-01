'use strict';


//---------------------------------------------------------------------
exports.ClientSupport_MountAuthenticatorRoutes =
	function ClientSupport_MountAuthenticatorRoutes( CTX )
	{
		if ( CTX.Transport.Settings.ClientSupport
			&& CTX.Transport.Settings.ClientSupport.enabled )
		{


			let authenticator_signup_origin = {
				name: 'authenticator_signup',
				requires_login: false,
				allowed_roles: [ '*' ],
			};

			let authenticator_login_origin = {
				name: 'authenticator_login',
				requires_login: false,
				allowed_roles: [ '*' ],
			};

			let authenticator_logout_origin = {
				name: 'authenticator_logout',
				requires_login: true,
				allowed_roles: [ '*' ],
			};



			//=====================================================================
			//=====================================================================
			//
			//		Authenticator Routes
			//
			//=====================================================================
			//=====================================================================


			//---------------------------------------------------------------------
			// POST Signup
			CTX.Transport.ExpressApp.post(
				CTX.Transport.ServerPath() + CTX.Transport.Settings.ClientSupport.Views.signup_url,
				// CTX.Transport.AuthenticationGate( false ),
				// CTX.Transport.AuthorizationGate( [ '*' ] ),
				CTX.Transport.AuthenticationGate( authenticator_signup_origin ),
				CTX.Transport.AuthorizationGate( authenticator_signup_origin ),
				CTX.Transport.InvocationGate( null, CTX.Transport.Settings.ClientSupport.Views.signup_url,
					async function express_origin_handler( request, response, next ) 
					{
						// Get the signup values.
						let user_id = request.body.user_email;;
						let password = request.body.password;
						let user_name = request.body.user_name;
						if ( !user_id ) { response.status( 401 ).send( 'Missing user_email.' ); return; }
						if ( !password ) { response.status( 401 ).send( 'Missing password.' ); return; }
						if ( !user_name ) { user_name = user_id; }

						// Signup the user.
						let result = await CTX.Server.Services.Authentication.Signup( null, user_id, password, user_name );
						if ( result === false ) { response.status( 401 ).send( 'Signup failed.' ); return; }

						// Set the downstream cookie.
						CTX.Transport.SetServerCookie( response, result.session_token );

						// Return.
						response.redirect( 302, CTX.Transport.ServerPath() );		// Return to client.
						return `Redirecting to ${CTX.Transport.ServerPath()}`;		// Return to InvocationGate.
					}
				),
			);


			//---------------------------------------------------------------------
			// POST Login
			CTX.Transport.ExpressApp.post(
				CTX.Transport.ServerPath() + CTX.Transport.Settings.ClientSupport.Views.login_url,
				// CTX.Transport.AuthenticationGate( false ),
				// CTX.Transport.AuthorizationGate( [ '*' ] ),
				CTX.Transport.AuthenticationGate( authenticator_login_origin ),
				CTX.Transport.AuthorizationGate( authenticator_login_origin ),
				CTX.Transport.InvocationGate( null, CTX.Transport.Settings.ClientSupport.Views.login_url,
					async function express_origin_handler( request, response, next ) 
					{
						// Get the login values.
						let user_id = request.body.username;
						if ( !user_id ) { user_id = request.body.user_id; }
						if ( !user_id ) { user_id = request.body.user_email; }
						if ( !user_id ) { response.status( 401 ).send( 'Missing username, user_id, or user_email.' ); return; }
						let password = request.body.password;

						// Authenticate the user.
						let result = await CTX.Server.Services.Authentication.Login( null, user_id, password );
						if ( result === false ) { response.status( 401 ).send( 'Incorrect username or password.' ); return; }

						// Set the downstream cookie.
						CTX.Transport.SetServerCookie( response, result.session_token );

						// Return the user.
						response.redirect( 302, CTX.Transport.ServerPath() );		// Return to client.
						return `Redirecting to ${CTX.Transport.ServerPath()}`;		// Return to InvocationGate.
					}
				),
			);


			//---------------------------------------------------------------------
			// POST Logout
			CTX.Transport.ExpressApp.post(
				CTX.Transport.ServerPath() + CTX.Transport.Settings.ClientSupport.Views.logout_url,
				// CTX.Transport.AuthenticationGate( true ),
				// CTX.Transport.AuthorizationGate( [ '*' ] ),
				CTX.Transport.AuthenticationGate( authenticator_logout_origin ),
				CTX.Transport.AuthorizationGate( authenticator_logout_origin ),
				CTX.Transport.InvocationGate( null, CTX.Transport.Settings.ClientSupport.Views.logout_url,
					async function express_origin_handler( request, response, next ) 
					{
						// Logout the user.
						let logout_result = await CTX.Server.Services.Authentication.Logout( null, request.user.user_id );

						// Remove the server cookie.
						CTX.Transport.SetServerCookie( response, '' );

						// Return, OK.
						response.redirect( 302, CTX.Transport.ServerPath() );		// Return to client.
						return `Redirecting to ${CTX.Transport.ServerPath()}`;		// Return to InvocationGate.
					}
				),
			);


			//=====================================================================
			//=====================================================================
			//
			//		Authenticator User Interface
			//
			//=====================================================================
			//=====================================================================


			//---------------------------------------------------------------------
			// GET Signup
			CTX.Transport.ExpressApp.get(
				CTX.Transport.ServerPath() + CTX.Transport.Settings.ClientSupport.Views.signup_url,
				// CTX.Transport.AuthenticationGate( false ),
				// CTX.Transport.AuthorizationGate( [ '*' ] ),
				CTX.Transport.AuthenticationGate( authenticator_signup_origin ),
				CTX.Transport.AuthorizationGate( authenticator_signup_origin ),
				CTX.Transport.InvocationGate( null, CTX.Transport.Settings.ClientSupport.Views.signup_url,
					async function express_view_handler( request, response, next ) 
					{
						response.render(
							CTX.Transport.Settings.ClientSupport.Views.signup_view,
							{
								Server: CTX.Server,
								User: request.user,
								UserViews: CTX.Transport.GetUserViews( request.user, true ),
							} );
						return `Rendering ${CTX.Transport.Settings.ClientSupport.Views.signup_view}`;
					}
				),
			);

			//---------------------------------------------------------------------
			// GET Login
			CTX.Transport.ExpressApp.get(
				CTX.Transport.ServerPath() + CTX.Transport.Settings.ClientSupport.Views.login_url,
				// CTX.Transport.AuthenticationGate( false ),
				// CTX.Transport.AuthorizationGate( [ '*' ] ),
				CTX.Transport.AuthenticationGate( authenticator_login_origin ),
				CTX.Transport.AuthorizationGate( authenticator_login_origin ),
				CTX.Transport.InvocationGate( null, CTX.Transport.Settings.ClientSupport.Views.login_url,
					async function express_view_handler( request, response, next ) 
					{
						response.render(
							CTX.Transport.Settings.ClientSupport.Views.login_view,
							{
								Server: CTX.Server,
								User: request.user,
								UserViews: CTX.Transport.GetUserViews( request.user, true ),
							} );
						return `Rendering ${CTX.Transport.Settings.ClientSupport.Views.login_view}`;
					}
				),
			);

			//---------------------------------------------------------------------
			// GET Logout
			CTX.Transport.ExpressApp.get(
				CTX.Transport.ServerPath() + CTX.Transport.Settings.ClientSupport.Views.logout_url,
				// CTX.Transport.AuthenticationGate( true ),
				// CTX.Transport.AuthorizationGate( [ '*' ] ),
				CTX.Transport.AuthenticationGate( authenticator_logout_origin ),
				CTX.Transport.AuthorizationGate( authenticator_logout_origin ),
				CTX.Transport.InvocationGate( null, CTX.Transport.Settings.ClientSupport.Views.logout_url,
					async function express_view_handler( request, response, next ) 
					{
						response.render(
							CTX.Transport.Settings.ClientSupport.Views.logout_view,
							{
								Server: CTX.Server,
								User: request.user,
								UserViews: CTX.Transport.GetUserViews( request.user, true ),
							} );
						return `Rendering ${CTX.Transport.Settings.ClientSupport.Views.logout_view}`;
					}
				),
			);

			//---------------------------------------------------------------------
			CTX.Server.Log.trace( `Web.ClientSupport.Authenticator is initialized.` );
			return;
		}
	};
