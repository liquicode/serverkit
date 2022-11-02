'use strict';


const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;

let Admin = { user_id: 'admin', user_role: 'admin', user_name: 'Administrator' };


//---------------------------------------------------------------------
describe( `240) Authentication Service Tests`,
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
		it( `should support Authentication flow`,
			async function ()
			{
				// Do a signup
				let result = await Server.Services.Authentication.Signup( null, Admin.user_id, 'secret', Admin.user_name );
				LIB_ASSERT.ok( result );
				let user = result.User;
				let session_token = result.session_token;
				// Do a connect.
				result = await Server.Services.Authentication.ConnectSession( session_token );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.deepStrictEqual( result, user );
				// Do a login.
				result = await Server.Services.Authentication.Login( null, Admin.user_id, 'secret' );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.deepStrictEqual( result.User, user );
				// LIB_ASSERT.strictEqual( result.session_token, session_token );
				// Do a logout.
				result = await Server.Services.Authentication.Logout( null, Admin.user_id );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.ok( result.User );
				LIB_ASSERT.ok( result.User.user_id === Admin.user_id );
				// // Do an invalid connect.
				// result = await Server.Services.Authentication.ConnectSession( session_token );
				// LIB_ASSERT.ok( result === false );
				// Return.
				return;
			} );


	} );
