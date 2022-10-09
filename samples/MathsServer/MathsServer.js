'use strict';

// Load the ServerKit Library and Options.
// const ServerKit = require( '@liquicode/serverkit' );
const ServerKit = require( LIB_PATH.resolve( __dirname, '..', '..', 'src', 'lib-server-kit.js' ) );
const ServerOptions = require( './MathsServer.options.js' );

// Create a new server in this folder.
const Server = ServerKit.NewServer( 'MathsServer', __dirname, ServerOptions );

// Run the server.
( async function ()
{
	Server.InstallAutoShutdown();
	await Server.Initialize();
	await Server.Startup();
} )();

