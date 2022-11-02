'use strict';


const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;


//---------------------------------------------------------------------
describe( `320) Web Transport Tests`,
	function ()
	{

		let server_address = null;
		let service_address = null;
		let login_url = null;

		//---------------------------------------------------------------------
		before(
			async function ()
			{
				Server = await SRC_TEST_SERVER.CreateTestServer( {
					Transports: {
						Web: {
							enabled: true,
							ClientSupport: { enabled: true, }, // Should this really be required?
						},
					},
				} );
				server_address = Server.Transports.Web.ServerAddress();
				service_address = server_address + Server.Transports.Web.ServicesPath();
				login_url = `${service_address}Authentication/Login`;
				return;
			}
		);


		//---------------------------------------------------------------------
		after(
			async function ()
			{
				await SRC_TEST_SERVER.CleanupTestServer( Server );
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should have loaded`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Services.TestService );
				LIB_ASSERT.ok( Server.Transports.Web );
				return;
			}
		);


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Authentication Tests
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		describe( `Authentication Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				it( `should not authenticate invalid credentials (bad username)`,
					async function ()
					{
						LIB_ASSERT.ok( Server );
						try
						{
							let response = await Server.Utility.async_request(
								'post', login_url,
								{
									UserEmail: 'admin@wrong-server',
									Password: 'password',
								} );
							LIB_ASSERT.fail( `it authenticated invalid credentials` );
						}
						catch ( error )
						{
							LIB_ASSERT.ok( error );
							LIB_ASSERT.ok( error.response );
							LIB_ASSERT.ok( error.response.status === 401 );
							LIB_ASSERT.ok( error.response.statusText === 'Unauthorized' );
						}
						return;
					} );


				//---------------------------------------------------------------------
				it( `should not authenticate invalid credentials (bad password)`,
					async function ()
					{
						LIB_ASSERT.ok( Server );
						try
						{
							let response = await Server.Utility.async_request(
								'post', login_url,
								{
									UserEmail: 'admin@server',
									Password: 'wrong-password',
								} );
							LIB_ASSERT.fail( `it authenticated invalid credentials` );
						}
						catch ( error )
						{
							LIB_ASSERT.ok( error );
							LIB_ASSERT.ok( error.response );
							LIB_ASSERT.ok( error.response.status === 401 );
							LIB_ASSERT.ok( error.response.statusText === 'Unauthorized' );
						}
						return;
					} );


				//---------------------------------------------------------------------
				it( `should authenticate valid credentials`,
					async function ()
					{
						LIB_ASSERT.ok( Server );
						try
						{
							let response = await Server.Utility.async_request(
								'post', login_url,
								{
									UserEmail: 'admin@server',
									Password: 'password',
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
					} );


				return;
			} ); // Authentication Tests


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	TestService Tests
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		describe( `TestService Tests`,
			function ()
			{


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
									UserEmail: 'admin@server',
									Password: 'password',
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
						let response = await Server.Utility.async_request( 'get', `${service_address}TestService/Add`, { A: 3, B: 4 } );
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
						let response = await Server.Utility.async_request( 'get', `${service_address}TestService/Subtract`, { A: 3, B: 4 } );
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
						let response = await Server.Utility.async_request( 'get', `${service_address}TestService/Multiply`, { A: 3, B: 4 } );
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
						let response = await Server.Utility.async_request( 'get', `${service_address}TestService/Divide`, { A: 3, B: 4 } );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.ok( response.data );
						LIB_ASSERT.ok( response.data.ok );
						LIB_ASSERT.strictEqual( response.data.result, 0.75 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should not matter what order the parameters are in`,
					async function ()
					{
						let response = await Server.Utility.async_request( 'get', `${service_address}TestService/Divide`, { B: 4, A: 3 } );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.ok( response.data );
						LIB_ASSERT.ok( response.data.ok );
						LIB_ASSERT.strictEqual( response.data.result, 0.75 );
						return;
					} );


			}
		); // TestService Tests


	} );
