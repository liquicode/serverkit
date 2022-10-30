'use strict';

const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;

//---------------------------------------------------------------------
describe( `130) TaskManager Tests`,
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
		it( `should be able to schedule a task`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.TaskManager );

				let task = Server.TaskManager.ScheduleTask( 'Test', '*/1 * * * * *',
					function ()
					{
						console.log( `Hello World from the Test task.` );
					}
				);

				await Server.Utility.sleep( 2 * 1000 );

				return;
			} );


	} );
