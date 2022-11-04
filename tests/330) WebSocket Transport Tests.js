'use strict';


const LIB_ASSERT = require( 'assert' );


const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;


//---------------------------------------------------------------------
describe( `330) WebSocket Transport Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				try
				{
					Server = await SRC_TEST_SERVER.CreateTestServer( {
						Transports: {
							WebSocket: {
								enabled: true,
							},
						},
					} );
				} catch ( error )
				{
					console.error( error );
				}
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
				LIB_ASSERT.ok( Server.Services.Authentication );
				LIB_ASSERT.ok( Server.Services.ServerAccounts );
				LIB_ASSERT.ok( Server.Transports.WebSocket );
				return;
			}
		);


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Connectivity Tests
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		describe( `Connectivity Tests`,
			function ()
			{

				let session_user = null;
				let session_token = null;

				//---------------------------------------------------------------------
				it( `should connect to socket server`,
					async function ()
					{
						// Establish a new session.
						// let socket = await LIB_WEBSOCKET_CLIENT.NewWebSocketClient( Server, 'admin@server', 'password' );
						let transport_client = await Server.Transports.WebSocket.NewWebSocketClient( 'admin@server', 'password' );
						LIB_ASSERT.ok( transport_client );
						LIB_ASSERT.ok( transport_client.Socket );
						LIB_ASSERT.ok( transport_client.Socket.connected );
						LIB_ASSERT.ok( transport_client.User );
						LIB_ASSERT.ok( transport_client.User.user_id === 'admin@server' );
						LIB_ASSERT.ok( transport_client.User.user_role === 'admin' );
						LIB_ASSERT.ok( transport_client.session_token );

						// Store the session information.
						session_user = transport_client.User;
						session_token = transport_client.session_token;

						// let result = await SocketRpc( transport_client, 'Maths.Add', { A: 3, B: 4 } );
						// LIB_ASSERT.ok( result === 7 );

						// Close the socket.
						await transport_client.Close();
						return;
					} );


				//---------------------------------------------------------------------
				return;
			} ); // Connectivity Tests


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Authentication Tests
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		describe( `Authentication Tests`,
			function ()
			{

				let session_user = null;
				let session_token = null;

				//---------------------------------------------------------------------
				it( `should Login as admin`,
					async function ()
					{
						// let transport_client = await LIB_WEBSOCKET_CLIENT.NewWebSocketClient( Server, 'admin@server', 'password' );
						let transport_client = await Server.Transports.WebSocket.NewWebSocketClient( 'admin@server', 'password' );
						LIB_ASSERT.ok( transport_client );
						LIB_ASSERT.ok( transport_client.User );
						LIB_ASSERT.ok( transport_client.User.user_id === 'admin@server' );
						LIB_ASSERT.ok( transport_client.User.user_role === 'admin' );
						LIB_ASSERT.ok( transport_client.session_token );
						session_user = transport_client.User;
						session_token = transport_client.session_token;
						await transport_client.Close();
						return;
					} );


				//---------------------------------------------------------------------
				it( `should have admin access`,
					async function ()
					{
						// let transport_client = await LIB_WEBSOCKET_CLIENT.NewWebSocketClient( Server, session_token );
						let transport_client = await Server.Transports.WebSocket.NewWebSocketClient( session_token );
						// Search for user.
						let result = await transport_client.Call( 'ServerAccounts.StorageFindMany', {
							Criteria: { user_role: 'user' }
						} );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( Array.isArray( result ) );
						LIB_ASSERT.ok( result.length === 1 );
						// Search for super.
						result = await transport_client.Call( 'ServerAccounts.StorageFindMany', {
							Criteria: { user_role: 'super' }
						} );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( Array.isArray( result ) );
						LIB_ASSERT.ok( result.length === 1 );
						// Search for admin.
						result = await transport_client.Call( 'ServerAccounts.StorageFindMany', {
							Criteria: { user_role: 'admin' }
						} );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( Array.isArray( result ) );
						LIB_ASSERT.ok( result.length === 1 );
						// Search for all.
						result = await transport_client.Call( 'ServerAccounts.StorageFindMany', {
							Criteria: {}
						} );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( Array.isArray( result ) );
						LIB_ASSERT.ok( result.length === 3 );
						await transport_client.Close();
						return;
					} );


				//---------------------------------------------------------------------
				it( `should Logout as admin`,
					async function ()
					{
						// let transport_client = await LIB_WEBSOCKET_CLIENT.NewWebSocketClient( Server, session_token );
						let transport_client = await Server.Transports.WebSocket.NewWebSocketClient( session_token );
						let result = await transport_client.Call( 'Authentication.Logout', {
							UserEmail: session_user.user_id
						} );
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( result.User );
						LIB_ASSERT.ok( result.User.user_id === 'admin@server' );
						LIB_ASSERT.ok( !result.session_token );
						session_user = null;
						session_token = null;
						await transport_client.Close();
						return;
					} );


				//---------------------------------------------------------------------
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


				let transport_client = null;

				//---------------------------------------------------------------------
				before(
					async function ()
					{
						transport_client = await Server.Transports.WebSocket.NewWebSocketClient( 'user@server', 'password' );
						return;
					}
				);


				//---------------------------------------------------------------------
				after(
					async function ()
					{
						await transport_client.Close();
						return;
					}
				);


				//---------------------------------------------------------------------
				it( `should add two numbers`,
					async function ()
					{
						let result = await transport_client.Call( 'TestService.Add', { A: 3, B: 4 } );
						LIB_ASSERT.strictEqual( result, 7 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should subtract two numbers`,
					async function ()
					{
						let result = await transport_client.Call( 'TestService.Subtract', { A: 3, B: 4 } );
						LIB_ASSERT.strictEqual( result, -1 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should multiply two numbers`,
					async function ()
					{
						let result = await transport_client.Call( 'TestService.Multiply', { A: 3, B: 4 } );
						LIB_ASSERT.strictEqual( result, 12 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should divide two numbers`,
					async function ()
					{
						let result = await transport_client.Call( 'TestService.Divide', { A: 3, B: 4 } );
						LIB_ASSERT.strictEqual( result, 0.75 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should not matter what order the parameters are in`,
					async function ()
					{
						let result = await transport_client.Call( 'TestService.Divide', { B: 4, A: 3 } );
						LIB_ASSERT.strictEqual( result, 0.75 );
						return;
					} );


			}
		); // TestService Tests


	} );
