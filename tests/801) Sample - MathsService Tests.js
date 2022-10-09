'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const ServerKit = require( '@liquicode/lib-server-kit' );
var ServerName = 'TestServer';
var ServerFolder = LIB_PATH.resolve( __dirname, '..', 'samples', 'MathsServer' );
var ServerOptions = require( LIB_PATH.join( ServerFolder, 'MathsServer.options.js' ) );


//---------------------------------------------------------------------
describe( `201) MathsService Tests`,
	function ()
	{


		let Server = null;
		let Bob = { user_id: 'bob', user_role: 'user' };


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				let server_options = {
					services_path: 'services',
				};
				Server = ServerKit.NewServer( ServerName, ServerFolder, ServerOptions );
				await Server.Initialize();
				return;
			}
		);


		//---------------------------------------------------------------------
		after(
			async function ()
			{
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should add two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Services.Maths.Origins.Add.invoke( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, 7 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should subtract two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Services.Maths.Origins.Subtract.invoke( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, -1 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should multiply two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Services.Maths.Origins.Multiply.invoke( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, 12 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should divide two numbers`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let result = await Server.Services.Maths.Origins.Divide.invoke( Bob, 3, 4 );
				LIB_ASSERT.strictEqual( result, 0.75 );
				return;
			} );


	} );
