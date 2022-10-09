'use strict';


const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;

let Bob = { user_id: 'bob', user_role: 'user' };


//---------------------------------------------------------------------
describe( `300) TestService Tests`,
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
		it( `should add two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Services.TestService.Add( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, 7 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should subtract two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Services.TestService.Subtract( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, -1 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should multiply two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Services.TestService.Multiply( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, 12 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should divide two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Services.TestService.Divide( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, 0.75 );
				return;
			} );


	} );
