'use strict';

// Load the ServerKit Library and Options.
const ServerKit = require( '@liquicode/lib-server-kit' );
const ServerOptions = require( './Scrapesheet.options.js' );

// Create a new server in this folder.
const Server = ServerKit.NewServer( 'Scrapesheet', __dirname, ServerOptions );

// Run the server.
( async function ()
{
	Server.InstallAutoShutdown();
	await Server.Initialize();
	await Server.Startup();
} )();

