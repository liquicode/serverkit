'use strict';


const LIB_PATH = require( 'path' );
const LIB_HTTP = require( 'http' );
const LIB_HTTPS = require( 'https' );
const LIB_EXPRESS = require( 'express' );

const SRC_SERVER_MODULE = require( LIB_PATH.resolve( __dirname, '..', 'core', 'ServerModule.js' ) );


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{

		// Create the transport.
		let transport = SRC_SERVER_MODULE.NewServerModule(
			Server, 'transport',
			{
				name: 'Web',
				title: "Web Transport",
				description: "Make service origins callable via the http protocol.",
				verbs: [
					'http-get', 'http-put', 'http-post', 'http-delete',
					'rest-get', 'rest-put', 'rest-post', 'rest-delete',
				],
			},
			{
				enabled: false,
				server_url_path: '',				// Root path for this server. (e.g. '/MyApp/...')
				services_url_path: '',				// Path to services and functions. (e.g. '/MyApp/api/...')
				report_routes: false,				// Reports all routes added on startup.
				set_express_trust_proxy: false,		// Use when running behind a proxy.
				server_timeout: 120000,
				// server_timeout: 5000,

				//---------------------------------------------------------------------
				// Http Server
				//	- A running Http server is required for the Web transport.
				//---------------------------------------------------------------------
				ServerAddress: {
					protocol: 'http',
					address: '0.0.0.0',
					public_address: '',
					port: 8080,
				},

				//---------------------------------------------------------------------
				// Data Handling
				//	- The Web transport requires the use of data handling
				//	  middleware to translate data over the wire.
				//---------------------------------------------------------------------
				DataHandling: {
					JsonBodyParser: {
						Settings: {
							limit: '50mb',
						},
					},
					UrlEncodedParser: {
						Settings: {
							extended: true,
							limit: '50 MB',
						},
					},
					FileUpload: {
						Settings: {
							debug: false,
							limits: { fileSize: 500 * 1024 * 1024 /* 500 MB */ },
							abortOnLimit: true,
							responseOnLimit: 'Uploads cannot be larger than 500MB.',
							useTempFiles: false,
							tempFileDir: '~server-data/temp',
						},
					},
				},

				//---------------------------------------------------------------------
				// Security
				//	- Security features for the Web transport (use Helmet or Cors)
				//---------------------------------------------------------------------
				Security: {
					Cors: {
						enabled: false,
						Settings: {
							origin: '*',				// Allow all origins
							optionsSuccessStatus: 200,	// some legacy browsers (IE11, various SmartTVs) choke on 204
						},
					},
					Helmet: {
						enabled: false,
						Settings: { /* needs research */ },	// See: https://helmetjs.github.io/
					},
				},

				//---------------------------------------------------------------------
				// Client Support
				//	- To support interactivity with the browser.
				//---------------------------------------------------------------------
				ClientSupport: {
					enabled: false,

					// Public static folder.
					public_folder: '~web-public',				// Application folder of public files.
					public_url_path: 'public',					// Url path of the public files.

					// Generated client api file.
					client_api_file: '~web-public/_web-client-api.js',	// Generate Web client api file (in Application folder).
					client_api_style: 'ajax',							// Generate 'fetch' or 'ajax' style http calls.
					client_log_service_calls: true,						// console.log any messages sent and received.
					client_log_errors: true,							// console.error any errors.

					// Generated open api file.
					open_api_file: '~web-public/_open-api.json',	// Generate Swagger definitions file (in Application folder).

					// Views
					view_engine: 'pug',							// Any Express compatible templating engine (e.g. pug, jade, etc.)
					view_folder: '~web-views',					// Application folder of the view files.
					home_view: 'home',							// Name of default home view ('/').
					view_core: 'w3css-angularjs',				// Generate core ui elements (into public_folder).
					view_core_overwrite: false,					// Overwrite existing files when copying the view core.
					view_core_show_signup: true,				// Allow users to signup and create an account.
					view_core_show_login: true,				// Allow users to login with their account.
					view_core_easy_admin_login: true,			// Login form is prefilled with default admin credentials.

					// Views: {
					// 	root_view: 'home',						// Name of default home view ('/').
					// },

					// Authenticator
					Authenticator: {
						engine: 'Local',
						Engines: {
							Local: { /* No Settings */ },
							Auth0: {
								Settings: {
									domain: 'auth0-domain',
									client_id: 'auth0-client-id',
									client_secret: 'auth0-client-secret',
									callback_url: 'auth0-callback-url'
								}
							}
						},
					},
				},

			},
		);


		transport.ExpressApp = null;	// Set during InitializeModule()
		transport.HttpServer = null;	// Set during StartupModule() and ShutdownModule()


		//=====================================================================
		//=====================================================================
		//
		//	Module Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// ServerAddress
		//	- Returns the server protocol, address, and port.
		//---------------------------------------------------------------------

		transport.ServerAddress =
			function ServerAddress()
			{
				let address = transport.Settings.ServerAddress.address;
				if ( transport.Settings.ServerAddress.public_address )
				{
					address = transport.Settings.ServerAddress.public_address;
				}
				if ( address === '0.0.0.0' )
				{
					address = 'localhost';
				}
				let url = transport.Settings.ServerAddress.protocol
					+ '://' + address
					+ ':' + transport.Settings.ServerAddress.port;
				return url;
			};


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
		// Returns the path to the services, including the root server path.
		// Will always end with a '/' character.
		//---------------------------------------------------------------------

		transport.ServicesPath =
			function ServicesPath()
			{
				let url = transport.ServerPath();
				url += transport.Settings.services_url_path;
				if ( !url.endsWith( '/' ) ) { url += '/'; }
				return url;
			};


		//---------------------------------------------------------------------
		// Returns the path to the services, including the root server path.
		// Will always end with a '/' character.
		//---------------------------------------------------------------------

		transport.PublicPath =
			function PublicPath()
			{
				let url = transport.ServerPath();
				if ( transport.Settings.ClientSupport.enabled )
				{
					url += transport.Settings.ClientSupport.public_url_path;
				}
				if ( !url.endsWith( '/' ) ) { url += '/'; }
				return url;
			};


		//---------------------------------------------------------------------
		// Returns the server cookie value from the request headers.
		//---------------------------------------------------------------------

		transport.GetServerCookie =
			function GetServerCookie( WebRequest )
			{
				if ( WebRequest
					&& WebRequest.headers
					&& WebRequest.headers.cookie )
				{
					let cookies = WebRequest.headers.cookie.split( ';' );
					let cookie_start = Server.Settings.AppInfo.name + '=';
					for ( let index = 0; index < cookies.length; index++ )
					{
						let cookie = cookies[ index ].trim();
						if ( cookie.startsWith( cookie_start ) )
						{
							let session_token = cookie.substr( cookie_start.length );
							return session_token;
						}
					}
				}
				return null;
			};


		//---------------------------------------------------------------------
		// Sets the server cookie value in the response headers.
		//---------------------------------------------------------------------

		transport.SetServerCookie =
			function SetServerCookie( WebResponse, SessionToken )
			{
				let cookie_name = Server.Settings.AppInfo.name;
				let environment = Server.Settings.AppInfo.environment;
				let cookie_settings =
				{
					// Specifies the value for the Path Set-Cookie. By default, this is set to '/', which is the root path of the domain.
					path: transport.ServerPath(),
					// Specifies the boolean value for the HttpOnly Set-Cookie attribute.
					// When truthy, the HttpOnly attribute is set, otherwise it is not.
					// By default, the HttpOnly attribute is set.
					// Note be careful when setting this to true, as compliant clients will not allow client-side JavaScript to see the cookie in document.cookie.
					httpOnly: false,
					// Use secure cookies in production (requires SSL/TLS)
					secure: ( environment === 'production' ),
					// Specifies the number (in milliseconds) to use when calculating the Expires Set-Cookie attribute.
					maxAge: null,
					// Specifies the value for the Domain Set-Cookie attribute.
					// By default, no domain is set, and most clients will consider the cookie to apply to only the current domain.
					domain: null,
					// Specifies the boolean or string to be the value for the SameSite Set-Cookie attribute. By default, this is false.
					sameSite: false,
				};
				if ( SessionToken )
				{
					WebResponse.cookie( cookie_name, SessionToken, cookie_settings );
				}
				else
				{
					WebResponse.clearCookie( cookie_name, cookie_settings );
				}
				return;
			};


		//---------------------------------------------------------------------
		// Generate a User Service View Mapping
		//---------------------------------------------------------------------

		transport.GetUserViews =
			function GetUserViews( User, OnlyNoRequiredFields = true )
			{
				let user_views = {};
				Server.VisitViewsSync(
					function process_view( Service, Origin )
					{
						if ( !Service.Settings.enabled ) { return; }
						if ( !Origin ) { return; }

						if ( Origin.requires_login )
						{
							if ( User.user_role === 'anon' ) { return; }
							if (
								!Origin.allowed_roles.includes( User.user_role )
								&& !Origin.allowed_roles.includes( '*' )
							)
							{
								return;
							}
						}

						// Check to allow User Signup and Login.
						if ( Service.Definition.name === 'Authentication' )
						{
							if ( ( Origin.name === 'Signup' ) && !transport.Settings.ClientSupport.view_core_show_signup ) { return; }
							if ( ( Origin.name === 'Login' ) && !transport.Settings.ClientSupport.view_core_show_login ) { return; }
						}

						{
							// Get the number of required parameters.
							let required_fields = 0;
							Origin.Fields.forEach( function ( Field ) { if ( Field.required ) { required_fields++; } } );
							if ( OnlyNoRequiredFields && required_fields ) { return; }

							// Initialize this service entry if it doesn't already exist.
							if ( user_views[ Service.Definition.name ] === undefined )
							{
								user_views[ Service.Definition.name ] = {
									name: Service.Definition.name,
									title: Service.Definition.title || Service.Definition.name,
									description: Service.Definition.description,
									Views: [],
								};
							}

							// Initialize a new entry for this Origin.
							let service_entry = user_views[ Service.Definition.name ];
							service_entry.Views.push( {
								name: Origin.name,
								title: Origin.title || Origin.name,
								description: Origin.description,
								url: Service.Definition.name + '/' + Origin.name,
								required_fields: required_fields,
							} );

						}
						return;
					}
				);
				return user_views;
			};


		//=====================================================================
		//=====================================================================
		//
		//		AuthenticationGate
		//
		// - returns an Express middleware.
		// - If the user is logged in, then execution flow continues to the next middleware.
		// - If the user is not logged in and a login is required, then the user is redirected to the login page.
		// - If the user is not logged in and no login is required, then the user is set to Anonymous and execution flow continues.
		// - request is guaranteed to have an attached user account for subsequent middlewares (e.g. AuthorizationGate).
		//
		//=====================================================================
		//=====================================================================


		transport.AuthenticationGate =
			function AuthenticationGate( Origin )
			{
				let middleware =
					async function ( request, response, next )
					{
						// If the user already exists and is not the Anonymous user, then continue next.
						if ( request.user ) { console.error( `request.user is already set in AuthenticationGate!` ); }

						// Get the session user.
						let session_token = transport.GetServerCookie( request );
						let user = await Server.Services.Authentication.ConnectSession( session_token );

						// Use AnonymousUser if not logged in.
						if ( !user ) { user = JSON.parse( JSON.stringify( Server.Settings.AnonymousUser ) ); }

						// Redirect to login page if login is required and user is not logged in.
						if ( Origin.requires_login && ( user.user_role === 'anon' ) )
						{
							// Clear the server cookie.
							transport.SetServerCookie( response, '' );

							// Redirect user to the login page, or send a 401.
							if ( transport.Settings.ClientSupport
								&& transport.Settings.ClientSupport.enabled )
							{
								//TODO:

								// // Store the original url in our session.
								// if ( request.session )
								// {
								// 	// Remember this url so that a successful authentication can redirect to the originally requested url.
								// 	request.session.redirect_url_after_login = request.originalUrl;
								// }

								// response.redirect( `${transport.ServerPath()}${transport.Settings.ClientSupport.Views.login_url}` );
								response.redirect( `${transport.ServerPath()}Authentication/Login` );
							}
							else
							{
								response.send( 401, 'Web.ClientSupport is not enabled.' );
							}
							return next( 'route' );
						}

						// Set the user.
						request.user = user;

						return next();

					};
				return middleware;
			};


		//=====================================================================
		//=====================================================================
		//
		//		AuthorizationGate
		//
		// - returns an Express middleware.
		// - if AllowedRoles is empty, then execution flow continues to the next middleware.
		// - if user_role is listed in AllowedRoles, then execution flow continues to the next middleware.
		// - if user_role is not listed in AllowedRoles, a 403 (Forbidden) code is returned.
		//
		//=====================================================================
		//=====================================================================


		transport.AuthorizationGate =
			function AuthorizationGate( Origin )
			{
				let middleware =
					async function ( request, response, next )
					{
						if ( !request.user ) { throw new Error( `request.user is null. Authentication must precede Authorization.` ); }
						if ( !Server.AuthorizeOriginAccess( request.user, Origin ) )
						{
							response.status( 403 ).send( { error: `Insufficent permission to perform this function.` } );
							return;
						}
						return next();
					};
				return middleware;
			};


		//=====================================================================
		//=====================================================================
		//
		//		InvocationGate
		//
		// - returns an Express middleware.
		// - Validates invocation parameters.
		// - Reports invocation status.
		// - Reports invocation duration.
		// - Reports error information.
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// InvocationGate returns an Express middleware.
		transport.InvocationGate =
			function InvocationGate( Origin, RouteName, Invocation )
			{
				let middleware =
					async function ( request, response, next )
					{
						let invocation_tracer = Server.InvocationTracer( request.user.user_id, transport.Definition.name, RouteName, null );
						try
						{
							// Get a working copy of the parameters.
							let request_parameters = {};
							if ( request.query && Object.keys( request.query ).length ) { request_parameters = request.query; }
							else if ( request.body && Object.keys( request.body ).length ) { request_parameters = request.body; }
							else if ( request.params && Object.keys( request.params ).length ) { request_parameters = request.params; }

							// Report.
							invocation_tracer.Fields = request_parameters;
							Server.Log.debug( invocation_tracer.LogRequest( request_parameters ) );

							// Validate the parameters.
							request.origin_parameters = {};
							if ( Origin && Origin.Fields )
							{
								let validation_result = Server.ValidateFieldValues( Origin.Fields, request_parameters );
								if ( validation_result.errors.length ) { throw new Error( `Validation errors: ${validation_result.errors.join( '; ' )}` ); }
								request.origin_parameters = validation_result.fields;
							}

							// Do the invocation. (amost there!)
							let invocation_result = await Invocation( request, response, next );

							// Process the result.
							if ( invocation_result
								&& ( invocation_result.ok === false )
								&& invocation_result.error )
							{
								throw new Error( invocation_result.error );
							}
							Server.Log.debug( invocation_tracer.LogResponse( null, invocation_result ) );

							return;
						}
						catch ( error ) 
						{
							// Internal error.
							// response.status( 500 ).send( { error: error.message } );
							let message = invocation_tracer.LogResponse( error.message, null );
							let api_result = {
								ok: false,
								origin: RouteName,
								error: error.message,
							};
							response.send( api_result );
							Server.Log.error( message );
							next( message );
						}
					};
				return middleware;
			};


		//=====================================================================
		//=====================================================================
		//
		//	Module Control
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Initialize Module
		//	Server has loaded and configurations are set.
		//	Modules should finalize their Definition here.
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		transport.InitializeModule =
			async function InitializeModule()
			{
				if ( !transport.Settings.enabled ) { return; }
				if ( transport.ExpressApp ) { throw new Error( `The Web transport has already been initialized.` ); }

				transport.ExpressApp = LIB_EXPRESS();

				let component_context = {
					Server: Server,
					Transport: transport,
					LIB_EXPRESS: LIB_EXPRESS,
				};

				let components = {};


				//---------------------------------------------------------------------
				//---------------------------------------------------------------------
				//		Load Components
				//---------------------------------------------------------------------
				//---------------------------------------------------------------------


				//---------------------------------------------------------------------
				// Data Handling
				{
					let SRC = require( './Web/Web.DataHandling.js' );
					components.DataHandling_JsonBodyParser = SRC.DataHandling_JsonBodyParser;
					components.DataHandling_UrlEncodedParser = SRC.DataHandling_UrlEncodedParser;
					components.DataHandling_FileUpload = SRC.DataHandling_FileUpload;
				}

				//---------------------------------------------------------------------
				// Security
				{
					let SRC = require( './Web/Web.Security.js' );
					components.Security_Cors = SRC.Security_Cors;
					components.Security_Helmet = SRC.Security_Helmet;
				}

				//---------------------------------------------------------------------
				// Client Support
				{
					let SRC = require( './Web/Web.ClientSupport.js' );
					components.ClientSupport_ViewEngine = SRC.ClientSupport_ViewEngine;
					components.ClientSupport_GenerateClientApiFile = SRC.ClientSupport_GenerateClientApiFile;
					components.ClientSupport_GenerateOpenApiFile = SRC.ClientSupport_GenerateOpenApiFile;
					components.ClientSupport_GenerateViewCore = SRC.ClientSupport_GenerateViewCore;
					components.ClientSupport_MountPublicFolder = SRC.ClientSupport_MountPublicFolder;
					components.ClientSupport_MountRootRoute = SRC.ClientSupport_MountRootRoute;
					components.ClientSupport_MountExplorerRoute = SRC.ClientSupport_MountExplorerRoute;
				}

				//---------------------------------------------------------------------
				// Web Services
				{
					let SRC = require( './Web/Web.Services.js' );
					components.MountServices = SRC.MountServices;
				}


				//---------------------------------------------------------------------
				//---------------------------------------------------------------------
				//		Initialize Components
				//---------------------------------------------------------------------
				//---------------------------------------------------------------------


				// `session-file-store` must be initialized after setting the
				// ClientSupport.public_files static folder and before the adding
				// of any routes.

				components.DataHandling_JsonBodyParser( component_context );
				components.DataHandling_UrlEncodedParser( component_context );
				components.DataHandling_FileUpload( component_context );
				components.Security_Cors( component_context );
				components.Security_Helmet( component_context );
				components.ClientSupport_ViewEngine( component_context );
				components.ClientSupport_GenerateClientApiFile( component_context );
				components.ClientSupport_GenerateOpenApiFile( component_context );
				components.ClientSupport_GenerateViewCore( component_context );
				components.ClientSupport_MountPublicFolder( component_context );
				components.ClientSupport_MountRootRoute( component_context );
				components.MountServices( component_context );


				//---------------------------------------------------------------------
				//---------------------------------------------------------------------
				//		Report Routes
				//---------------------------------------------------------------------
				//---------------------------------------------------------------------


				if ( transport.Settings.report_routes )
				{
					Server.Log.debug( 'Reporting express routes:' );
					let stack = transport.ExpressApp._router.stack;
					stack.forEach(
						function ( r )
						{
							if ( r.route && r.route.path )
							{
								let verbs = [];
								if ( r.route.methods.get ) { verbs.push( 'GET ' ); }
								if ( r.route.methods.put ) { verbs.push( 'PUT ' ); }
								if ( r.route.methods.post ) { verbs.push( 'POST' ); }
								if ( r.route.methods.delete ) { verbs.push( 'DEL ' ); }
								let text = '  ' + verbs.join( '|' );
								text = text.padEnd( 20 );
								text += ' ' + r.route.path;
								Server.Log.debug( text );
							}
						} );
				}


				// Return
				// Server.Log.trace( `Transports: Web is initialized.` );
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Startup Module
		//	Server has been initialized and is now starting up.
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		transport.StartupModule =
			async function StartupModule()
			{
				if ( transport.HttpServer ) { throw new Error( `HttpServer is already running. Call the StopServer() function to shut down.` ); }
				Server.Log.trace( `Web.HttpServer is initializing.` );

				//---------------------------------------------------------------------
				// Create the HTTP Server.
				if ( transport.Settings.ServerAddress.protocol === 'http' )
				{
					transport.HttpServer = LIB_HTTP.createServer( transport.ExpressApp );
				}
				else if ( transport.Settings.ServerAddress.protocol === 'https' )
				{
					transport.HttpServer = LIB_HTTPS.createServer( transport.ExpressApp );
				}
				else
				{
					throw new Error( Server.Utility.invalid_parameter_value_message(
						'Web.ServerAddress.protocol',
						transport.Settings.ServerAddress.protocol,
						`Must be either 'http' or 'https'.` ) );
				}

				//---------------------------------------------------------------------
				// Configure the HTTP Server.
				transport.HttpServer.timeout = transport.Settings.server_timeout;

				// Server.Log.trace( `Web.HttpServer is initialized.` );

				//---------------------------------------------------------------------
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
				Server.Log.debug( `Web.HttpServer is listening at [${transport.ServerAddress()}].` );

				Server.Log.trace( `Web.HttpServer has initialized.` );

				// Return
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Shutdown Module
		//	Server has been running and is now shutting down.
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		transport.ShutdownModule =
			async function ShutdownModule()
			{
				if ( transport.HttpServer ) 
				{
					Server.Log.trace( `Web.HttpServer is stopping. This may take up to ${parseInt( transport.Settings.server_timeout / 1000 )} seconds if connections are being held open.` );
					if ( transport.HttpServer.listening ) 
					{
						await new Promise(
							function ( resolve, reject )
							{
								transport.HttpServer.close(
									function ( error ) 
									{
										if ( error ) { reject( error ); }
										else { resolve( true ); }
									} );
							} );
					}
					Server.Log.trace( `Web.HttpServer has stopped.` );
				}
				transport.HttpServer = null;
				return;
			};


		//---------------------------------------------------------------------
		// Return the Transport.
		//---------------------------------------------------------------------


		return transport;
	};
