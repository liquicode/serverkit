'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const ServerKit = require( '@liquicode/lib-server-kit' );
var ServerName = 'TestServer';
var ServerFolder = LIB_PATH.resolve( __dirname, '..', 'samples', 'MathsServer' );
var ServerOptions = require( LIB_PATH.join( ServerFolder, 'MathsServer.options.js' ) );


//---------------------------------------------------------------------
describe( `202) Maths on Text Tests`,
	function ()
	{


		let Server = null;
		let session_user = null;
		let session_token = null;


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				let server_options = {
					services_path: 'services',
					Settings: {
						Transports: {
							Text: {
								enabled: true,
							},
						},
					},
				};
				Server = ServerKit.NewServer( ServerName, ServerFolder, ServerOptions );
				let file_count = Server.Utility.delete_folder_recurse( LIB_PATH.join( __dirname, '~temp' ) );
				await Server.Initialize();
				await Server.Startup();
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
				LIB_ASSERT.ok( Server.Transports.Text );
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
				it( `should Login as admin`,
					async function ()
					{
						let command = `Authentication.Login --UserEmail "admin@server" --Password "password"`;
						let result = await Server.Transports.Text.InvokeCommand( null, command );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( result.User );
						LIB_ASSERT.ok( result.User.user_id === 'admin@server' );
						LIB_ASSERT.ok( result.User.user_role === 'admin' );
						LIB_ASSERT.ok( result.session_token );
						session_user = result.User;
						session_token = result.session_token;
						return;
					} );


				//---------------------------------------------------------------------
				it( `should have admin access`,
					async function ()
					{
						// Search for user.
						let command = `ServerAccounts.StorageFindMany --Criteria { user_role: 'user' }`;
						let result = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( Array.isArray( result ) );
						LIB_ASSERT.ok( result.length === 1 );
						// Search for super.
						command = `ServerAccounts.StorageFindMany --Criteria { user_role: 'super' }`;
						result = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( Array.isArray( result ) );
						LIB_ASSERT.ok( result.length === 1 );
						// Search for admin.
						command = `ServerAccounts.StorageFindMany --Criteria { user_role: 'admin' }`;
						result = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( Array.isArray( result ) );
						LIB_ASSERT.ok( result.length === 1 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should Logout as admin`,
					async function ()
					{
						let command = `Authentication.Logout --UserEmail "admin@server"`;
						let result = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( result === true );
						session_user = null;
						session_token = null;
						return;
					} );


				return;
			}
		); // Authentication Tests


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Maths Tests
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		describe( `Maths Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				it( `should Login as user`,
					async function ()
					{
						let command = `Authentication.Login --UserEmail "user@server" --Password "password"`;
						let result = await Server.Transports.Text.InvokeCommand( null, command );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( result.User );
						LIB_ASSERT.ok( result.User.user_id === 'user@server' );
						LIB_ASSERT.ok( result.User.user_role === 'user' );
						LIB_ASSERT.ok( result.session_token );
						session_user = result.User;
						session_token = result.session_token;
						return;
					} );


				//---------------------------------------------------------------------
				it( `should add two numbers`,
					async function ()
					{
						let command = `Maths.Add --A 3 --B 4`;
						let response = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.strictEqual( response, 7 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should subtract two numbers`,
					async function ()
					{
						let command = `Maths.Subtract --A 3 --B 4`;
						let response = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.strictEqual( response, -1 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should multiply two numbers`,
					async function ()
					{
						let command = `Maths.Multiply --A 3 --B 4`;
						let response = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.strictEqual( response, 12 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should divide two numbers`,
					async function ()
					{
						let command = `Maths.Divide --A 3 --B 4`;
						let response = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.strictEqual( response, 0.75 );
						return;
					} );


			}
		); // Maths Tests


	} );
