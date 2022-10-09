'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;
let Admin = { user_id: 'admin', user_role: 'admin', user_name: 'Administrator' };


//---------------------------------------------------------------------
describe( `200) Services Tests`,
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
		it( `should load services`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Services );
				LIB_ASSERT.ok( Object.keys( Server.Services ).length );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should have loaded the ServerManagement service`,
			async function ()
			{
				LIB_ASSERT.ok( Server.Services.ServerManagement );
				LIB_ASSERT.ok( Server.Services.ServerManagement.Definition );
				LIB_ASSERT.ok( Server.Services.ServerManagement.Definition.name === 'ServerManagement' );
				LIB_ASSERT.ok( Server.Services.ServerManagement.Origins );
				LIB_ASSERT.ok( Server.Services.ServerManagement.Views );
				LIB_ASSERT.ok( !Server.Services.ServerManagement.Definition.Item );
				return;
			} );


		// //---------------------------------------------------------------------
		// it( `should have loaded the ServerDiagnostics service`,
		// 	async function ()
		// 	{
		// 		LIB_ASSERT.ok( Server.Services.ServerDiagnostics );
		// 		LIB_ASSERT.ok( Server.Services.ServerDiagnostics.Definition );
		// 		LIB_ASSERT.ok( Server.Services.ServerDiagnostics.Definition.name === 'ServerDiagnostics' );
		// 		LIB_ASSERT.ok( Server.Services.ServerDiagnostics.Origins );
		// 		LIB_ASSERT.ok( Server.Services.ServerDiagnostics.Views );
		// 		LIB_ASSERT.ok( !Server.Services.ServerDiagnostics.Definition.Item );
		// 		return;
		// 	} );


		//---------------------------------------------------------------------
		it( `should have loaded the ServerAccounts service`,
			async function ()
			{
				LIB_ASSERT.ok( Server.Services.ServerAccounts );
				LIB_ASSERT.ok( Server.Services.ServerAccounts.Definition );
				LIB_ASSERT.ok( Server.Services.ServerAccounts.Definition.name === 'ServerAccounts' );
				LIB_ASSERT.ok( Server.Services.ServerAccounts.Origins );
				LIB_ASSERT.ok( Server.Services.ServerAccounts.Views );
				LIB_ASSERT.ok( Server.Services.ServerAccounts.Definition.Item );
				LIB_ASSERT.ok( Server.Services.ServerAccounts.Definition.Item.name === 'ServerAccount' );
				LIB_ASSERT.ok( Server.Services.ServerAccounts.Definition.Item.Fields );
				// Return.
				return;
			} );


		//---------------------------------------------------------------------
		it( `should have loaded the Authentication service`,
			async function ()
			{
				LIB_ASSERT.ok( Server.Services.Authentication );
				LIB_ASSERT.ok( Server.Services.Authentication.Definition );
				LIB_ASSERT.ok( Server.Services.Authentication.Definition.name === 'Authentication' );
				LIB_ASSERT.ok( Server.Services.Authentication.Origins );
				LIB_ASSERT.ok( Server.Services.Authentication.Views );
				LIB_ASSERT.ok( !Server.Services.Authentication.Definition.Item );
				// Return.
				return;
			} );


		//---------------------------------------------------------------------
		it( `should have loaded the TestService service`,
			async function ()
			{
				LIB_ASSERT.ok( Server.Services.TestService );
				LIB_ASSERT.ok( Server.Services.TestService.Definition );
				LIB_ASSERT.ok( Server.Services.TestService.Definition.name === 'TestService' );
				LIB_ASSERT.ok( Server.Services.TestService.Origins );
				LIB_ASSERT.ok( Server.Services.TestService.Views );
				LIB_ASSERT.ok( Server.Services.TestService.Definition.Item );
				return;
			} );


	} );
