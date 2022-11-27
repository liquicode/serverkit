'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_CRYPTO = require( 'crypto' );

// const LIB_UID_SAFE = require( 'uid-safe' );
const LIB_JOSE = require( 'jose' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{

		// Create the storage service.
		let service = Server.NewApplicationService(
			{
				name: 'Authentication',
				title: "Authentication",
				description: "Manages user credentials and authenticates users for the server.",
			},
			{
				Session: {
					session_key: '*** A MAGICAL SECRET KEY !!! ***',	// 32 bytes of magic.
					session_duration: '24h',
				},
				SessionStorage: Server.StorageDefaults(),
			}
		);

		service.SessionStorage = null;


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Origin Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		service.Origins.Signup =
			Server.NewOriginDefinition( {
				name: 'Signup',
				description: "Creates a new account with the provided credentials; Returns an authorization token.",
				requires_login: false,
				verbs: [ 'http-post', 'text-call', 'socket-call', 'amqp-call' ],
				Fields: [
					Server.NewFieldDefinition( {
						name: 'UserEmail',
						title: "User Email",
						description: "Email address of the user.",
						type: 'string',
						format: 'email',
						example: 'username@server',
						required: true,
					} ),
					Server.NewFieldDefinition( {
						name: 'Password',
						title: "Password",
						description: "The user's secret password.",
						type: 'string',
						format: 'password',
						example: 'keyboard cat',
						required: true,
					} ),
					Server.NewFieldDefinition( {
						name: 'UserName',
						title: "User Name",
						description: "Display name of the user.",
						type: 'string',
						example: 'John Doe',
					} ),
				],
				rest_parameters: ':UserEmail/:Password/:UserName',
			},
				async function ( User, UserEmail, Password, UserName )
				{ return service.Signup( User, UserEmail, Password, UserName ); },
			);


		//---------------------------------------------------------------------
		service.Origins.Login =
			Server.NewOriginDefinition( {
				name: 'Login',
				description: "Login to the server with the provided credentials; Returns an authorization token.",
				requires_login: false,
				verbs: [ 'http-post', 'text-call', 'socket-call', 'amqp-call' ],
				Fields: [
					Server.NewFieldDefinition( {
						name: 'UserEmail',
						title: "User Email",
						description: "Email address of the user.",
						type: 'string',
						format: 'email',
						example: 'username@server',
						required: true,
					} ),
					Server.NewFieldDefinition( {
						name: 'Password',
						title: "Password",
						description: "The user's secret password.",
						type: 'string',
						format: 'password',
						example: 'keyboard cat',
						required: true,
					} ),
				],
				rest_parameters: ':UserEmail/:Password',
			},
				async function ( User, UserEmail, Password )
				{ return service.Login( User, UserEmail, Password ); },
			);


		//---------------------------------------------------------------------
		service.Origins.Logout =
			Server.NewOriginDefinition( {
				name: 'Logout',
				description: "Logout from the server.",
				requires_login: true,
				verbs: [ 'http-post', 'text-call', 'socket-call', 'amqp-call' ],
				Fields: [
					Server.NewFieldDefinition( {
						name: 'UserEmail',
						title: "User Email",
						description: "Email address of the user.",
						type: 'string',
						format: 'email',
						example: 'username@server',
						required: true,
					} ),
				],
				rest_parameters: ':UserEmail',
			},
				async function ( User, UserEmail )
				{ return service.Logout( User, UserEmail ); },
			);


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	View Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		service.Views.Signup =
			Server.NewOriginDefinition( {
				name: 'Signup',
				title: 'User Signup',
				description: "User signup form.",
				requires_login: false,
				Fields: [],
			} );


		//---------------------------------------------------------------------
		service.Views.Login =
			Server.NewOriginDefinition( {
				name: 'Login',
				title: 'User Login',
				description: "User login form.",
				requires_login: false,
				Fields: [],
			} );


		//---------------------------------------------------------------------
		service.Views.Logout =
			Server.NewOriginDefinition( {
				name: 'Logout',
				title: 'User Logout',
				description: "User logout form.",
				requires_login: true,
				Fields: [],
			} );


		//=====================================================================
		//=====================================================================
		//
		//	Service Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// Signup: Register the User and the Claim
		//---------------------------------------------------------------------

		service.Signup =
			async function Signup( User, UserEmail, Password, UserName )
			{
				// Find user in authentication storage.
				let storage_user = await service.SessionStorage.FindOne( { user_id: UserEmail } );
				if ( storage_user ) { throw new Error( `This user already exists [${UserEmail}].` ); }

				// Add user to authentication storage.
				await service.SessionStorage.CreateOne( {
					user_id: UserEmail,
					user_role: 'user',
					password: Password,
				} );

				// Find/Create the ServerAccount.
				let api_result = await Server.Services.ServerAccounts.FindOrCreateUser( {
					user_id: UserEmail,
					user_role: 'user',
					user_name: UserName,
				} );
				if ( !api_result.ok ) { throw new Error( `Error in ${api_result.origin}: ${api_result.error}` ); }

				// Return the ServerAccount.
				return await service.Login( User, UserEmail, Password );
			};


		//---------------------------------------------------------------------
		// Login: Authenticate Claim and return Token
		//---------------------------------------------------------------------

		service.Login =
			async function Login( User, UserEmail, Password )
			{
				// Find user in authentication storage.
				let authentication_user = await service.SessionStorage.FindOne( { user_id: UserEmail } );
				if ( !authentication_user ) { return false; }

				// Authenticate the user.
				if ( authentication_user.password !== Password ) { return false; }

				// Find/Create the ServerAccount.
				let api_result = await Server.Services.ServerAccounts.FindOrCreateUser( {
					user_id: UserEmail,
					user_role: 'user',
				} );
				if ( !api_result.ok ) { throw new Error( `Error in ${api_result.origin}: ${api_result.error}` ); }
				let server_account = api_result.result;

				// Create a new session for this user on this server.
				let jwt = await new LIB_JOSE.EncryptJWT( {
					User: server_account,
				} );
				await jwt.setProtectedHeader( { alg: 'dir', enc: 'A256GCM' } );
				await jwt.setIssuedAt();
				// jwt.setIssuer( 'urn:example:issuer' )
				// jwt.setAudience( 'urn:example:audience' )
				await jwt.setExpirationTime( service.Settings.Session.session_duration );
				let key_buffer = Buffer.from( service.Settings.Session.session_key, 'utf-8' );
				let session_key = LIB_CRYPTO.createSecretKey( key_buffer );
				let session_token = await jwt.encrypt( session_key );

				// Return the ServerAccount and session token.
				return {
					User: server_account,
					session_token: session_token,
				};
			};


		//---------------------------------------------------------------------
		// Logout: Destroy User's Session
		//---------------------------------------------------------------------

		service.Logout =
			async function Logout( User, UserEmail )
			{
				//TODO:

				// Find the user and remove the session.
				// let authentication_user = service.SessionStorage.find_user( UserEmail, null );
				// if ( !authentication_user ) { return false; }
				// authentication_user.session_token = '';
				// service.SessionStorage.update_user( authentication_user );
				// return true;
				return {
					User: { user_id: UserEmail },
					session_token: '',
				};
			};


		//=====================================================================
		//=====================================================================
		//
		//	Local Service Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// ConnectSession: Load and return a User's Session
		//	- returns user object from a valid session token.
		//	- returns null if invalid session token.
		//	- returns false if session token expired and new login is required.
		//---------------------------------------------------------------------

		service.ConnectSession =
			async function ConnectSession( SessionToken )
			{
				if ( !SessionToken ) { return null; }

				// Find the session.
				// let storage_user = service.SessionStorage.find_user( null, SessionToken );
				// if ( !storage_user ) { return false; }

				// Decrypt the session token.
				let session_info = null;
				try
				{
					let key_buffer = Buffer.from( service.Settings.Session.session_key, 'utf-8' );
					let session_key = LIB_CRYPTO.createSecretKey( key_buffer );
					session_info = await LIB_JOSE.jwtDecrypt( SessionToken, session_key );
				}
				catch ( error )
				{
					if ( error.code === 'ERR_JWT_EXPIRED' )
					{
						return false;
					}
					else
					{
						Server.Log.warn( `jwtDecrypt Error: ${error.message}` );
						return null;
					}
				}

				// Get the user from the session token.
				if ( !session_info ) { return null; }
				if ( !session_info.payload ) { return null; }
				if ( !session_info.payload.User ) { return null; }
				let user = session_info.payload.User;

				// Return the account.
				return user;
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


		service.InitializeModule =
			async function InitializeModule()
			{
				if ( service.Settings.Session.session_key.length < 32 )
				{
					console.error( `Authentication.Session.session_key must be at least 32 bytes long.` );
				}
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Startup Module
		//	Server has been initialized and is now starting up.
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		service.StartupModule =
			async function StartupModule()
			{
				service.SessionStorage = Server.NewStorage( service, service.Settings.SessionStorage );

				if ( await service.SessionStorage.Count() === 0 ) 
				{
					for ( let index = 0; index < Server.Settings.DefaultUsers.length; index++ )
					{
						let user = Server.Settings.DefaultUsers[ index ];
						await service.SessionStorage.CreateOne( user );
						Server.Log.debug( `Added default user [${user.user_id}] to the credentials store.` );
					}
				}

				// Return.
				return;
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Shutdown Module
		//	Server has been running and is now shutting down.
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		service.ShutdownModule =
			async function ShutdownModule()
			{
				service.SessionStorage = null;

				// Return.
				return;
			};


		//---------------------------------------------------------------------
		// Return the Service.
		//---------------------------------------------------------------------


		return service;
	};
