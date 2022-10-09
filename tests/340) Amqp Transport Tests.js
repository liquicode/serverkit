'use strict';


const LIB_ASSERT = require( 'assert' );
const LIB_PATH = require( 'path' );

// const LIQUICODEJS = require( LIB_PATH.resolve( __dirname, '..', '..', 'liquicodejs.git', 'src', 'liquicode-node.js' ) );
const LIQUICODEJS = require( '@liquicode/liquicodejs' );


const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;


var SERVER_SETTINGS = {
	Transports: {
		Amqp:
		{
			enabled: true,
		},
	}
};


const RABBITMQ_IMAGE_NAME = 'rabbitmq:3-management';
const RABBITMQ_CONTAINER_NAME = 'serverkit-rabbitmq-test';


//---------------------------------------------------------------------
describe( `340) Amqp Transport Tests`,
	function ()
	{

		let container_status = null;

		//---------------------------------------------------------------------
		before(
			async function ()
			{
				container_status = LIQUICODEJS.System.ContainerStatus( RABBITMQ_CONTAINER_NAME );
				if ( !container_status )
				{
					console.log( `Running ${RABBITMQ_CONTAINER_NAME} + 10 seconds.` );
					LIQUICODEJS.System.RunContainer( RABBITMQ_IMAGE_NAME, {
						name: RABBITMQ_CONTAINER_NAME,
						ports: [
							{ container: 5672, localhost: 5672, },
							{ container: 15672, localhost: 15672, },
						]
					} );
					// container_status = LIQUICODEJS.System.ContainerStatus( RABBITMQ_CONTAINER_NAME );
					await LIQUICODEJS.System.AsyncSleep( 10 * 1000 );
				}
				else if ( !container_status.State.Running )
				{
					// Start the container.
					console.log( `Starting ${RABBITMQ_CONTAINER_NAME}.` );
					LIQUICODEJS.System.StartContainer( RABBITMQ_CONTAINER_NAME );
				}
				Server = await SRC_TEST_SERVER.CreateTestServer( SERVER_SETTINGS );
				return;
			}
		);


		//---------------------------------------------------------------------
		after(
			async function ()
			{
				await SRC_TEST_SERVER.CleanupTestServer( Server );
				if ( !container_status )
				{
					console.log( `Killing ${RABBITMQ_CONTAINER_NAME}.` );
					LIQUICODEJS.System.KillContainer( RABBITMQ_CONTAINER_NAME );
				}
				else if ( !container_status.State.Running )
				{
					console.log( `Stopping ${RABBITMQ_CONTAINER_NAME}.` );
					LIQUICODEJS.System.StopContainer( RABBITMQ_CONTAINER_NAME );
				}
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
				LIB_ASSERT.ok( Server.Transports.Amqp );
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
						let transport_client = await Server.Transports.Amqp.NewAmqpClient( 'admin@server', 'password' );
						LIB_ASSERT.ok( transport_client );
						LIB_ASSERT.ok( transport_client.User );
						LIB_ASSERT.ok( transport_client.User.user_id === 'admin@server' );
						LIB_ASSERT.ok( transport_client.User.user_role === 'admin' );
						LIB_ASSERT.ok( transport_client.session_token );

						// Store the session information.
						session_user = transport_client.User;
						session_token = transport_client.session_token;

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
						let transport_client = await Server.Transports.Amqp.NewAmqpClient( 'admin@server', 'password' );

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
						let transport_client = await Server.Transports.Amqp.NewAmqpClient( 'admin@server', 'password' );

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
						let transport_client = await Server.Transports.Amqp.NewAmqpClient( 'admin@server', 'password' );

						let result = await transport_client.Call( 'Authentication.Logout', {
							UserEmail: session_user.user_id
						} );
						LIB_ASSERT.ok( result === true );
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
						transport_client = await Server.Transports.Amqp.NewAmqpClient( 'user@server', 'password' );
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
