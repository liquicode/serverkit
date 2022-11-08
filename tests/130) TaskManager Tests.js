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
		it( `should be able to run a task once`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.TaskManager );

				let task = Server.TaskManager.AddTask(
					'Test',
					{
						run_once: true
					},
					function ()
					{
						console.log( `Hello World from a scheduled task.` );
					}
				);

				Server.TaskManager.EnableTask( 'Test', true );
				await Server.Utility.sleep( 2 * 1000 );

				LIB_ASSERT.ok( task );
				LIB_ASSERT.ok( task.enabled === false );
				LIB_ASSERT.ok( task.run_count === 1 );

				Server.TaskManager.RemoveTask( 'Test' );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should be able to run a task twice`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.TaskManager );

				let task = Server.TaskManager.AddTask(
					'Test',
					{
						run_count: 2
					},
					function ()
					{
						console.log( `Hello World from a scheduled task.` );
					}
				);

				Server.TaskManager.EnableTask( 'Test', true );
				await Server.Utility.sleep( 5 * 1000 );

				LIB_ASSERT.ok( task );
				LIB_ASSERT.ok( task.enabled === false );
				LIB_ASSERT.ok( task.run_count === 2 );

				Server.TaskManager.RemoveTask( 'Test' );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should be able to schedule a recurring task`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.TaskManager );

				let task = Server.TaskManager.AddTask(
					'Test',
					{
						crontab: '*/1 * * * * *',
					},
					function ()
					{
						console.log( `Hello World from a scheduled task.` );
					}
				);

				Server.TaskManager.EnableTask( 'Test', true );
				await Server.Utility.sleep( 3.5 * 1000 );
				Server.TaskManager.EnableTask( 'Test', false );

				LIB_ASSERT.ok( task );
				LIB_ASSERT.ok( task.enabled === false );
				LIB_ASSERT.ok( task.run_count === 3 );

				Server.TaskManager.RemoveTask( 'Test' );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should be able to schedule a task in the future`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.TaskManager );

				let task = Server.TaskManager.AddTask(
					'Test',
					{
						crontab: '*/2 * * * * *',
						run_once: true,
					},
					function ()
					{
						console.log( `Hello World from a scheduled task.` );
					}
				);

				Server.TaskManager.EnableTask( 'Test', true );

				LIB_ASSERT.ok( task );
				LIB_ASSERT.ok( task.enabled === true );
				LIB_ASSERT.ok( task.run_count === 0 );

				await Server.Utility.sleep( 3 * 1000 );

				LIB_ASSERT.ok( task );
				LIB_ASSERT.ok( task.enabled === false );
				LIB_ASSERT.ok( task.run_count === 1 );

				Server.TaskManager.RemoveTask( 'Test' );
				return;
			} );


		// //---------------------------------------------------------------------
		// // NOTE: NODE-CRON does not shut down properly if a task throws an error.
		// it( `should disable task after an error`,
		// 	async function ()
		// 	{
		// 		LIB_ASSERT.ok( Server );
		// 		LIB_ASSERT.ok( Server.TaskManager );

		// 		let task = Server.TaskManager.AddTask(
		// 			'Test',
		// 			{
		// 				crontab: '*/1 * * * * *',
		// 			},
		// 			function ()
		// 			{
		// 				throw new Error( `Error thrown from a scheduled task.` );
		// 			}
		// 		);

		// 		Server.TaskManager.EnableTask( 'Test', true );
		// 		await Server.Utility.sleep( 3 * 1000 );

		// 		LIB_ASSERT.ok( task );
		// 		LIB_ASSERT.ok( task.enabled === false );
		// 		LIB_ASSERT.ok( task.run_count === 1 );
		// 		LIB_ASSERT.ok( task.last_error === 'Error thrown from a scheduled task.' );

		// 		Server.TaskManager.RemoveTask( 'Test' );
		// 		return;
		// 	} );


	} );
