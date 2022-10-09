'use strict';


// Load the ServerKit Library.
const LIB_PATH = require( 'path' );
// const ServerKit = require( '@liquicode/serverkit' );
const ServerKit = require( LIB_PATH.resolve( __dirname, '..', '..', 'src', 'lib-server-kit.js' ) );


// Server-Kit Initialization Options.
let timestamp = new Date(); // We are going to add some timestamp data to the server configuration.
let server_options = {
	defaults_filename: '~TestConfig.defaults.json',  // Writes server defaults to a file.
	settings_filename: '~TestConfig.settings.json',  // Writes server settings to a file.
	config_path: 'config',                           // Merge all config files in path.
	services_path: '',                               // Path to the application services folder.
	Settings:                                        // Server settings (overrides config folder).
	{
		AppInfo: {
			timestamp: timestamp.toString(),         // Add some custom fields that get saved to the config.
			timestampz: timestamp.toISOString(),     // Custom fields are available to all services.
		},
	},
};

// Create a new server.
const Server = ServerKit.NewServer( 'TestConfig', __dirname, server_options );

// Run the server.
( async function ()
{
	await Server.Initialize();
	await Server.Startup();
	await Server.Shutdown();
} )();

