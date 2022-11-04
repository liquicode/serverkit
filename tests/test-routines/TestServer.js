'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

const LIQUICODEJS = require( '@liquicode/liquicodejs' );

const LIB_SERVER_KIT = require( LIB_PATH.resolve( __dirname, '..', '..', 'src', 'lib-server-kit.js' ) );
let application_name = 'TestServer';
let application_path = LIB_PATH.resolve( __dirname, '..', '~temp' );

exports.CreateTestServer =
	async function CreateTestServer( Settings )
	{
		if ( Settings === undefined ) { Settings = {}; }

		// Disable logging for testing.
		Settings = LIQUICODEJS.Object.Merge(
			Settings,
			{
				Modules: {
					Log: {
						Console: { enabled: false },
						// Console: { enabled: true, ShellColorTheme: 'ShellDark' },
					}
				}
			}
		);

		// Reset the test environment.
		try
		{
			LIQUICODEJS.System.EmptyFolder( application_path );
		} catch ( error )
		{
			console.log( `Error when trying to reset the environment: ${error.message}` );
		}

		// Create the server.
		let server = LIB_SERVER_KIT.NewServer( application_name, application_path, {
			defaults_filename: 'defaults.json',
			settings_filename: 'settings.json',
			services_path: LIB_PATH.resolve( __dirname, 'test-services' ),
			// services_path: 'test-services',
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

