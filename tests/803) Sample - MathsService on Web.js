'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const ServerKit = require( '@liquicode/lib-server-kit' );
var ServerName = 'TestServer';
var ServerFolder = LIB_PATH.resolve( __dirname, '..', 'samples', 'MathsServer' );
var ServerOptions = require( LIB_PATH.join( ServerFolder, 'MathsServer.options.js' ) );


//---------------------------------------------------------------------
describe( `203) Maths Web Tests`,
	function ()
	{


		let Server = null;
		let server_address = null;
		let service_address = null;
		let login_url = null;


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				let server_options = {
					services_path: 'services',
					Settings: {
						Transports: {
							Web: {
								enabled: true,
								// report_routes: true,
								ClientSupport: {
									enabled: true,
									public_folder: LIB_PATH.join( __dirname, '~temp', 'web', 'public' ),
									view_folder: LIB_PATH.join( __dirname, '~temp', 'web', 'views' ),
								},
							},
						},
					},
				};
				Server = ServerKit.NewServer( ServerName, ServerFolder, ServerOptions );
				let file_count = Server.Utility.delete_folder_recurse( LIB_PATH.join( __dirname, '~temp' ) );
				await Server.Initialize();
				await Server.Startup();
				server_address = Server.Transports.Web.ServerAddress();
				service_address = server_address + Server.Transports.Web.ServicesPath();
				login_url = `${service_address}${Server.Settings.Transports.Web.ClientSupport.Views.login_url}`;
				return;
			}
		);


		//---------------------------------------------------------------------
		after(
			async function ()
			{
				if ( !Server ) { return; }
				await Server.Shutdown();
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should have loaded`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Services.Maths );
				LIB_ASSERT.ok( Server.Transports.Web );
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should login`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				try
				{
					let response = await Server.Utility.async_request(
						'post', login_url,
						{
							username: 'admin@server',
							password: 'password',
						} );
					LIB_ASSERT.ok( response );
					LIB_ASSERT.ok( response.status === 200 );
					LIB_ASSERT.ok( response.statusText === 'OK' );
				}
				catch ( error )
				{
					LIB_ASSERT.fail( error.message );
				}
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should add two numbers`,
			async function ()
			{
				let response = await Server.Utility.async_request( 'get', `${service_address}Maths/Add`, { A: 3, B: 4 } );
				LIB_ASSERT.ok( response );
				LIB_ASSERT.ok( response.data );
				LIB_ASSERT.ok( response.data.ok );
				LIB_ASSERT.strictEqual( response.data.result, 7 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should subtract two numbers`,
			async function ()
			{
				let response = await Server.Utility.async_request( 'get', `${service_address}Maths/Subtract`, { A: 3, B: 4 } );
				LIB_ASSERT.ok( response );
				LIB_ASSERT.ok( response.data );
				LIB_ASSERT.ok( response.data.ok );
				LIB_ASSERT.strictEqual( response.data.result, -1 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should multiply two numbers`,
			async function ()
			{
				let response = await Server.Utility.async_request( 'get', `${service_address}Maths/Multiply`, { A: 3, B: 4 } );
				LIB_ASSERT.ok( response );
				LIB_ASSERT.ok( response.data );
				LIB_ASSERT.ok( response.data.ok );
				LIB_ASSERT.strictEqual( response.data.result, 12 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should divide two numbers`,
			async function ()
			{
				let response = await Server.Utility.async_request( 'get', `${service_address}Maths/Divide`, { A: 3, B: 4 } );
				LIB_ASSERT.ok( response );
				LIB_ASSERT.ok( response.data );
				LIB_ASSERT.ok( response.data.ok );
				LIB_ASSERT.strictEqual( response.data.result, 0.75 );
				return;
			} );


	} );
