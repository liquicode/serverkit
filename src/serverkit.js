#! /usr/bin/env node
'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

var ServerKit = require( './lib-server-kit.js' );

const PACKAGE_VERSION = require( LIB_PATH.resolve( __dirname, '..', 'package.json' ) ).version;

/*
Server Kit CLI

Offers authentication, service discovery

Session Environment Variables:
- <ApplicationName>_UserEmail
- <ApplicationName>_UserRole
- <ApplicationName>_SessionToken

Commands:
- signup <UserEmail> <Password> <UserName>
	- Signs up a user with the server and estblishes a sesion.
- login <UserEmail> <Password>
	- Logs in a user with the server and estblishes a sesion.
- logout <UserEmail>
	- Logs out a user with the server and destroys the sesion.
- list
	- Lists all services on the server.
- list <ServiceName>
	- Lists all origins in the service.
- list <ServiceName.OriginName>
	- Lists origin definition.
- call <ServiceName.OriginName> <...Fields>
	- Invokes an origin.
*/


//=====================================================================
//=====================================================================
//
//	Initial setup for cli command.
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
// Global Variables
//---------------------------------------------------------------------

let ServerName = '';
let ServerFolder = process.cwd();
let ServerOptionsFilename = '';

let Server = null;
let Parameters = process.argv.slice( 2 );
let ServerOptions = null;
let SessionFilename = '';


//---------------------------------------------------------------------
// Load any environment settings
if ( process.env.SERVERKIT_NAME ) { ServerName = process.env.SERVERKIT_NAME; }
if ( process.env.SERVERKIT_FOLDER ) { ServerFolder = LIB_PATH.resolve( process.env.SERVERKIT_FOLDER ); }
if ( process.env.SERVERKIT_OPTIONS ) { ServerOptionsFilename = process.env.SERVERKIT_OPTIONS; }


//---------------------------------------------------------------------
// Parse command line arguments.
let logging_mode = '';
let is_debugging = false;
while ( Parameters.length )
{
	if ( Parameters[ 0 ].trim().toLowerCase() === '--name' )
	{
		Parameters = Parameters.slice( 1 );
		if ( !Parameters.length ) { throw new Error( `The '--name' option must specify a name.` ); }
		ServerName = Parameters[ 0 ];
		Parameters = Parameters.slice( 1 );
	}
	else if ( Parameters[ 0 ].trim().toLowerCase() === '--folder' )
	{
		Parameters = Parameters.slice( 1 );
		if ( !Parameters.length ) { throw new Error( `The '--folder' option must specify a folder.` ); }
		ServerFolder = Parameters[ 0 ];
		ServerFolder = LIB_PATH.resolve( ServerFolder );
		Parameters = Parameters.slice( 1 );
	}
	else if ( Parameters[ 0 ].trim().toLowerCase() === '--options' )
	{
		Parameters = Parameters.slice( 1 );
		if ( !Parameters.length ) { throw new Error( `The '--options' option must specify a filename.` ); }
		ServerOptionsFilename = Parameters[ 0 ];
		Parameters = Parameters.slice( 1 );
	}
	else if ( Parameters[ 0 ].trim().toLowerCase() === '--log' )
	{
		logging_mode = 'log';
		Parameters = Parameters.slice( 1 );
	}
	else if ( Parameters[ 0 ].trim().toLowerCase() === '--shell' )
	{
		logging_mode = 'shell';
		Parameters = Parameters.slice( 1 );
	}
	else if ( Parameters[ 0 ].trim().toLowerCase() === '--debug' )
	{
		is_debugging = true;
		Parameters = Parameters.slice( 1 );
	}
	else if ( Parameters[ 0 ].trim().toLowerCase() === '--version' )
	{
		console.log( `ServerKit v${PACKAGE_VERSION} (@liquicode/lib-server-kit@${PACKAGE_VERSION})` );
		// Parameters = Parameters.slice( 1 );
		process.exit( 0 );
	}
	else
	{
		break;
	}
}


//---------------------------------------------------------------------
// Get default Server Name.
if ( !ServerName )
{
	ServerName = LIB_PATH.basename( ServerFolder );
}


//---------------------------------------------------------------------
// Read the content of a js/json file.
function read_json_file( Filename )
{
	let json = null;
	let filename = Filename.toLowerCase();
	if ( filename.endsWith( '.js' ) )
	{
		json = require( Filename );
	}
	else if ( filename.endsWith( '.json' ) )
	{
		json = JSON.parse( LIB_FS.readFileSync( Filename, 'utf-8' ) );
	}
	else
	{
		throw new Error( `The options file has an unknown format [${Filename}].` );
	}
	return json;
}


//---------------------------------------------------------------------
// Look for server options file.
if ( ServerOptionsFilename )
{
	// Look for ServerOptionsFilename:
	ServerOptionsFilename = LIB_PATH.resolve( ServerFolder, ServerOptionsFilename );
	if ( LIB_FS.existsSync( ServerOptionsFilename ) && LIB_FS.lstatSync( ServerOptionsFilename ).isFile() )
	{
		ServerOptions = read_json_file( ServerOptionsFilename );
	}
	else
	{
		throw new Error( `The options file does not exist [${ServerOptionsFilename}].` );
	}
}
else
{
	// Look for server options file in server folder.
	let filename = LIB_PATH.join( ServerFolder, `${ServerName}.options.json` );
	if ( LIB_FS.existsSync( filename ) && LIB_FS.lstatSync( filename ).isFile() )
	{
		ServerOptions = read_json_file( filename );
		ServerOptionsFilename = filename;
	}
	else
	{
		filename = LIB_PATH.join( ServerFolder, `${ServerName}.options.js` );
		if ( LIB_FS.existsSync( filename ) && LIB_FS.lstatSync( filename ).isFile() )
		{
			ServerOptions = read_json_file( filename );
			ServerOptionsFilename = filename;
		}
	}
}


// //---------------------------------------------------------------------
// // Sanitize the server options.
// if ( ServerOptions )
// {
// 	// Do not allow settings to be generated.
// 	ServerOptions.settings_filename = '';
// }


//---------------------------------------------------------------------
// Get the session filename.
SessionFilename = LIB_PATH.join( ServerFolder, `.${ServerName}.session.json` );


//---------------------------------------------------------------------
// Finalize ServerOptions.
if ( !ServerOptions ) { ServerOptions = {}; }
if ( !ServerOptions.Settings ) { ServerOptions.Settings = {}; }

// Always enable the Text transport.
if ( !ServerOptions.Settings.Transports ) { ServerOptions.Settings.Transports = {}; }
if ( !ServerOptions.Settings.Transports.Text ) { ServerOptions.Settings.Transports.Text = {}; }
ServerOptions.Settings.Transports.Text.enabled = true;

// Apply logging mode.
if ( !ServerOptions.Settings.Modules ) { ServerOptions.Settings.Modules = {}; }
if ( !ServerOptions.Settings.Modules.Log ) { ServerOptions.Settings.Modules.Log = {}; }
if ( !ServerOptions.Settings.Modules.Log.Console ) { ServerOptions.Settings.Modules.Log.Console = {}; }
if ( !ServerOptions.Settings.Modules.Log.Shell ) { ServerOptions.Settings.Modules.Log.Shell = {}; }
if ( logging_mode === 'log' )
{
	ServerOptions.Settings.Modules.Log.Console.enabled = true;
	ServerOptions.Settings.Modules.Log.Shell.enabled = false;
}
else if ( logging_mode === 'shell' )
{
	ServerOptions.Settings.Modules.Log.Console.enabled = false;
	ServerOptions.Settings.Modules.Log.Shell.enabled = true;
}
else
{
	ServerOptions.Settings.Modules.Log.Console.enabled = false;
	ServerOptions.Settings.Modules.Log.Shell.enabled = false;
}


//---------------------------------------------------------------------
function print_usage()
{
	let command_name = 'serverkit';
	console.log( `
=== ${command_name} ===

    Usage: ${command_name} [options] <command> <command-parameters>

---------------------------------------------------
Use one of the following commands:
---------------------------------------------------
    who                                            | Displays information on the logged in user and current session.
    signup <UserEmail> <Password> [UserName]       | Signs up a user with the server and establishes a session.
    login <UserEmail> <Password>                   | Logs in a user with the server and establishes a session.
    logout <UserEmail>                             | Logs out a user with the server and destroys the session.
    list                                           | Lists all services on the server.
    list <ServiceName>                             | Lists all origins in the service.
    list <ServiceName.OriginName>                  | Lists origin definition.
    call <ServiceName.OriginName> <...Fields>      | Invokes an origin.
---------------------------------------------------
Any command can be preceeded by any of the following options:
---------------------------------------------------
    --name <server-name>              | Name of the server. Defaults to the server folder name.
    --folder <server-folder>          | Root folder for the server. Defaults to the current working directory.
    --options <options-filename>      | Filename of a server options file. Defaults to '<server-folder>/<server-name>.options.json'.
    --log                             | Send server log output to the console.
    --shell                           | Send server log output to the shell (console with styling).
    --debug                           | Output debugging information to the console.
    --version                         | Output the ServerKit library version to the console and exit.
---------------------------------------------------
Examples:
---------------------------------------------------
    > ${command_name} signup user@server "my password" "My Name"
    > ${command_name} --name MyServer login user@server "my password"
    > ${command_name} list
    > ${command_name} --log list ServerAccounts
    > ${command_name} call ServerAccounts.StorageFindOne
` );
	return;
}


//---------------------------------------------------------------------
function print_debug()
{
	console.log( `
=== serverkit debug output ===================
=== ServerKit Version : [${PACKAGE_VERSION}]
=== ServerName        : [${ServerName}]
=== ServerFolder      : [${ServerFolder}]
=== Options File      : [${ServerOptionsFilename}]
=== Parameters        : [${Parameters.join( ' ' )}]
=== CLI Session File  : [${SessionFilename}]
=== Raw Command Line  :`);
	process.argv.forEach( ( val, index ) =>
	{
		console.log( `${index}: ${val}` );
	} );
	console.log( `=== serverkit debug output ===================` );
	return;
}


//=====================================================================
//=====================================================================
//
//	Session Functions
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
function load_session()
{
	if ( !LIB_FS.existsSync( SessionFilename ) ) { return null; }
	let session = JSON.parse( LIB_FS.readFileSync( SessionFilename, 'utf8' ) );
	if ( !session.User ) { return null; }
	if ( !session.session_token ) { return null; }
	return session;
}


//---------------------------------------------------------------------
function save_session( Session )
{
	LIB_FS.mkdirSync( LIB_PATH.dirname( SessionFilename ), { recursive: true } );
	LIB_FS.writeFileSync( SessionFilename, JSON.stringify( Session, null, '    ' ) );
	return;
}


//---------------------------------------------------------------------
function delete_session()
{
	if ( !LIB_FS.existsSync( SessionFilename ) ) { return; }
	LIB_FS.unlinkSync( SessionFilename );
	return;
}


//=====================================================================
//=====================================================================
//
//	Who
//
//=====================================================================
//=====================================================================


async function WhoCommand()
{
	let session = load_session();
	if ( !session )
	{
		console.log( 'Nobody is logged in.' );
		return;
	}
	console.log( `The user [${session.User.user_id}] is logged in with role of [${session.User.user_role}].` );
	return;
}


//=====================================================================
//=====================================================================
//
//	Signup
//
//=====================================================================
//=====================================================================


async function SignupCommand()
{
	// Get parameters.
	if ( Parameters.length < 2 ) { return `Signup requires two parameters: UserEmail, and Password.`; }
	let user_email = Parameters[ 0 ];
	let password = Parameters[ 1 ];
	let user_name = '';
	Parameters = Parameters.slice( 2 );
	if ( Parameters.length ) 
	{
		user_name = Parameters[ 0 ];
		Parameters = Parameters.slice( 2 );
	}

	// Do server login.
	let result = await Server.Services.Authentication.Signup( null, user_email, password, user_name );
	if ( !result ) { return `Login failed.`; }

	// Establish a new session.
	save_session( result );

	// Return.
	return 'Signup OK';
}


//=====================================================================
//=====================================================================
//
//	Login
//
//=====================================================================
//=====================================================================


async function LoginCommand()
{
	// Get parameters.
	if ( Parameters.length < 2 ) { return `Login requires two parameters: UserEmail, and Password.`; }
	let user_email = Parameters[ 0 ];
	let password = Parameters[ 1 ];
	Parameters = Parameters.slice( 2 );

	// Do server login.
	let result = await Server.Services.Authentication.Login( null, user_email, password );
	if ( !result ) { return `Login failed.`; }

	// Establish a new session.
	save_session( result );

	// Return.
	return 'Login OK';
}


//=====================================================================
//=====================================================================
//
//	Logout
//
//=====================================================================
//=====================================================================


async function LogoutCommand()
{
	// Get parameters.
	if ( Parameters.length < 1 ) { return `Login requires one parameter: UserEmail.`; }
	let user_email = Parameters[ 0 ];
	Parameters = Parameters.slice( 1 );

	// Do server login.
	let result = await Server.Services.Authentication.Logout( null, user_email );
	if ( !result ) { return `Logout failed.`; }

	// Destroy the session.
	delete_session();

	// Return.
	return 'Logout OK';
}


//=====================================================================
//=====================================================================
//
//	List
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
function list_services( Server )
{

	let service_keys = Object.keys( Server.Services );
	for ( let service_index = 0; service_index < service_keys.length; service_index++ )
	{
		let service = Server.Services[ service_keys[ service_index ] ];
		console.log( service.Definition.name );
	}
	return;
}


//---------------------------------------------------------------------
function list_origins( ServiceName )
{

	let service_keys = Object.keys( Server.Services );
	for ( let service_index = 0; service_index < service_keys.length; service_index++ )
	{
		let service = Server.Services[ service_keys[ service_index ] ];
		if ( ServiceName && ( ServiceName !== service.Definition.name ) ) { continue; }
		let origin_keys = Object.keys( service.Origins );
		for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
		{
			let origin = service.Origins[ origin_keys[ origin_index ] ];
			console.log( origin.name );
		}
		return;
	}
	if ( ServiceName ) { console.log( `Service [${ServiceName}] was not found.` ); }
	return;
}


//---------------------------------------------------------------------
function list_origin_detail( ServiceName, OriginName )
{

	let service_keys = Object.keys( Server.Services );
	for ( let service_index = 0; service_index < service_keys.length; service_index++ )
	{
		let service = Server.Services[ service_keys[ service_index ] ];
		if ( ServiceName && ( ServiceName !== service.Definition.name ) ) { continue; }
		let origin_keys = Object.keys( service.Origins );
		for ( let origin_index = 0; origin_index < origin_keys.length; origin_index++ )
		{
			let origin = service.Origins[ origin_keys[ origin_index ] ];
			if ( OriginName && ( OriginName !== origin.name ) ) { continue; }
			console.log( `${service.Definition.name}.${origin.name}` );
			// console.log( JSON.stringify( origin, null, '    ' ) );
			console.log( `Description     : ${origin.description}` );
			console.log( `Requires Login  : ${origin.requires_login}` );
			console.log( `Allowed Roles   : ${origin.allowed_roles.join( ', ' )}` );
			console.log( `Verbs           : ${origin.verbs.join( ', ' )}` );
			if ( origin.Fields.length )
			{
				console.log( 'Parameters:' );
				console.table( origin.Fields );
				// for ( let parameter_index = 0; parameter_index < origin.Fields.length; parameter_index++ )
				// {
				// 	let parameter = origin.Fields[ parameter_index ];
				// 	let message = parameter.name;
				// 	console.log();
				// }
			}
			else
			{
				console.log( 'No Parameters.' );
			}
			return;
		}
		if ( OriginName ) { console.log( `Origin [${OriginName}] was not found in service [${ServiceName}].` ); }
		return;
	}
	if ( ServiceName ) { console.log( `Service [${ServiceName}] was not found.` ); }
	return;
}


//---------------------------------------------------------------------
function ListCommand()
{
	// Get the session.
	// let session = load_session();
	// if ( !session ) { return `You must be logged in to perform this command.`; }

	// Get the parameters.
	let service_name = '';
	let origin_name = '';
	if ( Parameters.length ) { service_name = Parameters[ 0 ]; Parameters = Parameters.slice( 1 ); }
	if ( service_name )
	{
		service_name = Server.Utility.replace_all( service_name, '.,/\\', ' ' );
		let ich = service_name.indexOf( ' ' );
		if ( ich >= 0 )
		{
			origin_name = service_name.substring( ich + 1 );
			service_name = service_name.substring( 0, ich );
		}
	}
	if ( !origin_name )
	{
		if ( Parameters.length ) { origin_name = Parameters[ 0 ]; Parameters = Parameters.slice( 1 ); }
	}

	// List
	if ( !service_name && !origin_name )
	{
		list_services( Server );
	}
	else if ( service_name && !origin_name )
	{
		list_origins( service_name );
	}
	else if ( service_name && origin_name )
	{
		list_origin_detail( service_name, origin_name );
	}

	// Return.
	return;
}


//=====================================================================
//=====================================================================
//
//	Call
//
//=====================================================================
//=====================================================================


async function CallCommand()
{
	// Get the session.
	let session_token = null;
	let session = load_session();
	if ( session ) { session_token = session.session_token; }

	try
	{
		let command_line = Parameters.join( ' ' );
		// console.log( command_line );
		let result = await Server.Transports.Text.InvokeCommand( session_token, command_line );
		return result;
	}
	catch ( error )
	{
		console.error( error.message );
		return;
	}
}


//=====================================================================
//=====================================================================
//
//	Server Execution
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
async function ProcessCommandLine()
{
	// Process cli command.
	if ( Parameters.length === 0 ) { return print_usage(); }
	let command = Parameters[ 0 ].trim().toLowerCase();
	Parameters = Parameters.slice( 1 );
	switch ( command )
	{
		case 'who': return await WhoCommand();
		case 'signup': return await SignupCommand();
		case 'login': return await LoginCommand();
		case 'logout': return await LogoutCommand();
		case 'list': return await ListCommand();
		case 'call': return await CallCommand();
		case 'run': return { keep_running: true };
	}
	print_usage();
	return;
}


//---------------------------------------------------------------------
( async () =>
{
	if ( is_debugging ) { print_debug(); }

	Server = ServerKit.NewServer( ServerName, ServerFolder, ServerOptions );

	// Server Initialize.
	await Server.InstallAutoShutdown();
	await Server.Initialize();

	// Server Startup.
	await Server.Startup();

	// Invoke Command.
	let result = await ProcessCommandLine();
	if ( result === undefined )
	{
		// console.log( 'OK' );
	}
	else if ( typeof result === 'object' )
	{
		if ( result.keep_running )
		{
			return;
		}
		console.log( JSON.stringify( result, null, '    ' ) );
	}
	else
	{
		console.log( result );
	}

	// Server Shutdown.
	try
	{
		await Server.Shutdown();
	}
	catch ( error )
	{
		console.error( `ServerKit encountered an error while shutting down.` );
		console.error( `Certain permission errors are expected when running serverkit` );
		console.error( `directly from the npm registry as a non-administrator.` );
		console.error( error.message );
		if ( is_debugging ) { console.dump( error ); }
	}
	return;
} )();


