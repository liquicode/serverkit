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
				Storage: {
					storage_engine: 'Memory',
					MemoryStorage: {
						/* No Settings */
					},
					FileStorage: {
						file_path: '~server-data/Authentication.user-session.json',
					},
					DatabaseStorage: {
						file_path: '~server-data/Authentication.user-session.sqlite3',
					},
				},
			}
		);


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


		// None.


		//=====================================================================
		//=====================================================================
		//
		//	Storage Functions
		//
		//=====================================================================
		//=====================================================================



		//---------------------------------------------------------------------
		service.Storage = {
			initialize: function initialize() { console.error( `Authentication storage engine [${service.Settings.Storage.storage_engine}] is not implemented.` ); },
			find_user: function find_user( user_id, session_token ) { console.error( `Authentication storage engine [${service.Settings.Storage.storage_engine}] is not implemented.` ); },
			update_user: function update_user( updated_user ) { console.error( `Authentication storage engine [${service.Settings.Storage.storage_engine}] is not implemented.` ); },
		};


		//---------------------------------------------------------------------
		// service.DatabaseStorage = {

		// 	Database: null,
		// 	Procedures: {
		// 		select_by_user_id: null,
		// 		select_by_session_token: null,
		// 		insert: null,
		// 		update_by_user_id: null,
		// 		delete_by_user_id: null,
		// 		// delete_all: null,
		// 	},

		// 	//---------------------------------------------------------------------
		// 	initialize:
		// 		function initialize()
		// 		{
		// 			// Create the database.
		// 			let database_path = Server.ResolveApplicationPath( service.Settings.Storage.DatabaseStorage.file_path );
		// 			let database_options = {};
		// 			LIB_FS.mkdirSync( LIB_PATH.dirname( database_path ), { recursive: true } );
		// 			service.DatabaseStorage.Database = LIB_BETTER_SQLITE3( database_path, database_options );

		// 			// Initialization Sql
		// 			// let init_sql = `
		// 			// 	CREATE TABLE IF NOT EXISTS UserSession (
		// 			// 	user_id TEXT PRIMARY KEY,
		// 			// 	user_role TEXT,
		// 			// 	user_name TEXT,
		// 			// 	password TEXT,
		// 			// 	session_token TEXT );
		// 			// `;
		// 			let init_sql = `
		// 				CREATE TABLE IF NOT EXISTS UserSession (
		// 				user_id TEXT PRIMARY KEY,
		// 				password TEXT,
		// 				session_token TEXT );
		// 			`;

		// 			// Initialize the database.
		// 			let create_table_info = service.DatabaseStorage.Database.exec( init_sql );

		// 			// Prepare sql statements.
		// 			service.DatabaseStorage.Procedures.select_by_user_id =
		// 				service.DatabaseStorage.Database.prepare( 'SELECT * FROM UserSession WHERE (user_id = @user_id)' );
		// 			service.DatabaseStorage.Procedures.select_by_session_token =
		// 				service.DatabaseStorage.Database.prepare( 'SELECT * FROM UserSession WHERE (session_token = @session_token)' );
		// 			service.DatabaseStorage.Procedures.insert =
		// 				// service.DatabaseStorage.Database.prepare( 'INSERT INTO UserSession VALUES ( @user_id, @user_role, @user_name, @password, @session_token )' );
		// 				service.DatabaseStorage.Database.prepare( 'INSERT INTO UserSession VALUES ( @user_id, @password, @session_token )' );
		// 			service.DatabaseStorage.Procedures.update_by_user_id =
		// 				// service.DatabaseStorage.Database.prepare( 'UPDATE UserSession SET user_role = @user_role, user_name = @user_name, password = @password, session_token = @session_token WHERE (user_id = @user_id)' );
		// 				service.DatabaseStorage.Database.prepare( 'UPDATE UserSession SET password = @password, session_token = @session_token WHERE (user_id = @user_id)' );
		// 			service.DatabaseStorage.Procedures.delete_by_user_id =
		// 				service.DatabaseStorage.Database.prepare( 'DELETE FROM UserSession WHERE (user_id = @user_id)' );

		// 			// Initial Users
		// 			let procedure_rowcount = service.DatabaseStorage.Database.prepare( 'SELECT COUNT( * ) AS RowCount FROM UserSession' );
		// 			let rowcount = procedure_rowcount.get();
		// 			if ( rowcount.RowCount === 0 )
		// 			{
		// 				for ( let index = 0; index < service.Settings.Storage.InitialUsers.length; index++ )
		// 				{
		// 					let user = JSON.parse( JSON.stringify( service.Settings.Storage.InitialUsers[ index ] ) );
		// 					user.session_token = '';
		// 					let insert_info = service.DatabaseStorage.Procedures.insert.run( user );
		// 					Server.Log.debug( `Added user [${user.user_id}] to the credentials store.` );
		// 				}
		// 			}

		// 			// Return.
		// 			return;
		// 		},

		// 	//---------------------------------------------------------------------
		// 	find_user:
		// 		function find_user( user_id, session_token )
		// 		{
		// 			let storage_user = null;
		// 			if ( user_id )
		// 			{
		// 				storage_user = service.DatabaseStorage.Procedures.select_by_user_id.get( {
		// 					user_id: user_id
		// 				} );
		// 			}
		// 			else if ( session_token )
		// 			{
		// 				storage_user = service.DatabaseStorage.Procedures.select_by_session_token.get( {
		// 					session_token: session_token
		// 				} );
		// 			}
		// 			return storage_user;
		// 		},

		// 	//---------------------------------------------------------------------
		// 	update_user:
		// 		function update_user( updated_user )
		// 		{
		// 			let update_info = service.DatabaseStorage.Procedures.update_by_user_id.run( updated_user );
		// 			if ( !update_info.changes )
		// 			{
		// 				let insert_info = service.DatabaseStorage.Procedures.insert.run( updated_user );
		// 				if ( !insert_info.changes ) { throw new Error( `Error saving user session in database.` ); }
		// 			}
		// 			return;
		// 		},

		// };


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
				let storage_user = service.Storage.find_user( UserEmail, null );
				if ( storage_user ) { throw new Error( `This user already exists [${UserEmail}].` ); }

				// Add user to authentication storage.
				service.Storage.update_user( {
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
				let authentication_user = service.Storage.find_user( UserEmail, null );
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
				// Find the user and remove the session.
				// let authentication_user = service.Storage.find_user( UserEmail, null );
				// if ( !authentication_user ) { return false; }
				// authentication_user.session_token = '';
				// service.Storage.update_user( authentication_user );
				return true;
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
				// let storage_user = service.Storage.find_user( null, SessionToken );
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
			function InitializeModule()
			{
				if ( service.Settings.Session.session_key.length < 32 )
				{
					console.error( `Authentication.Session.session_key must be at least 32 bytes long.` );
				}

				// Initialize storage.
				switch ( service.Settings.Storage.storage_engine.trim().toLowerCase() )
				{
					case 'memory':
						// service.Storage = service.MemoryStorage;
						service.Storage = require( './Authentication/MemorySessionStore.js' ).Construct( Server );
						break;
					// case 'File':
					// 	service.Storage = service.FileStorage;
					// 	break;
					case 'database':
						// service.Storage = service.DatabaseStorage;
						service.Storage = require( './Authentication/Sqlite3SessionStore.js' ).Construct( Server );
						break;
					default:
						// service.Storage = service.UnsupportedStorage;
						break;
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
			function StartupModule()
			{
				if ( service.Storage )
				{
					service.Storage.initialize();
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
			function ShutdownModule()
			{
				if ( service.Storage )
				{
					service.Storage.destroy();
				}
				// Return.
				return;
			};


		//---------------------------------------------------------------------
		// Return the Service.
		//---------------------------------------------------------------------


		return service;
	};
