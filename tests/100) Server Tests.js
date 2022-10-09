'use strict';


const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;


//---------------------------------------------------------------------
describe( `100) Server Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				Server = await SRC_TEST_SERVER.CreateTestServer();
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
		it( `should load configuration`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Settings );
				LIB_ASSERT.ok( Server.Settings.AppInfo );
				LIB_ASSERT.ok( Server.Settings.AppInfo.name );
				LIB_ASSERT.ok( Server.Settings.AppInfo.name === 'TestServer' );
				return;
			} );


	} );
