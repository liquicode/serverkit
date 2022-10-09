'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

// const LIQUICODEJS = require( LIB_PATH.resolve( __dirname, '..', '..', '..', 'liquicodejs.git', 'src', 'liquicode-node.js' ) );
const LIQUICODEJS = require( '@liquicode/liquicodejs' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '..', '..', 'src', 'lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = LIB_PATH.resolve( __dirname, '..', '~temp' );

exports.CreateTestServer =
	async function CreateTestServer( Settings )
	{
		if ( Settings === undefined ) { Settings = {}; }

		// Disable logging for testing.
		// if ( Settings.Modules === undefined ) { Settings.Modules = {}; }
		// if ( Settings.Modules.Log === undefined ) { Settings.Modules.Log = {}; }
		// if ( Settings.Modules.Log.Console === undefined ) { Settings.Modules.Log.Console = {}; }
		// if ( Settings.Modules.Log.Shell === undefined ) { Settings.Modules.Log.Shell = {}; }
		// Settings.Modules.Log.Console.enabled = false;
		// // Settings.Log.Shell.enabled = false;
		// Settings.Modules.Log.Shell.enabled = true;

		Settings = LIQUICODEJS.Object.Merge(
			Settings,
			{
				Modules: {
					Log: {
						Console: { enabled: false },
						Shell: { enabled: false },
						// Shell: { enabled: true },
					}
				}
			}
		);

		// Reset the test environment.
		LIQUICODEJS.System.EmptyFolder( application_path );

		// Create the server.
		let server = LIB_SERVER_KIT.NewServer( application_name, application_path, {
			defaults_filename: 'defaults.json',
			settings_filename: 'settings.json',
			services_path: LIB_PATH.resolve( __dirname, 'test-services' ),
			Settings: Settings,
		} );

		// Initialize the server.
		await server.Initialize();

		// Startup the server.
		await server.Startup();

		// Return the server.
		return server;
	};


exports.CleanupTestServer =
	async function CleanupTestServer( Server )
	{
		// Shutdown the server.
		await Server.Shutdown();

		return;
	};

