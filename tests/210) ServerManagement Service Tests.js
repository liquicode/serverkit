'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;

let Admin = { user_id: 'admin', user_role: 'admin', user_name: 'Administrator' };
let Super = { user_id: 'super', user_role: 'super', user_name: 'Supervisor' };
let User = { user_id: 'user', user_role: 'user', user_name: 'User' };


//---------------------------------------------------------------------
describe( `210) ServerManagement Service Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				Server = await SRC_TEST_SERVER.CreateTestServer();
				Server.Services.ServerAccounts.StorageDeleteMany( Admin );
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
		it( `should read the diagnostics`,
			async function ()
			{
				let diagnostics = await Server.Services.ServerManagement.Diagnostics( Admin );
				LIB_ASSERT.ok( diagnostics );
				LIB_ASSERT.ok( diagnostics.timestamp );
				LIB_ASSERT.ok( diagnostics.cpu_architecture );
				LIB_ASSERT.ok( diagnostics.cpu_count );
				LIB_ASSERT.ok( diagnostics.os_platform );
				LIB_ASSERT.ok( diagnostics.os_type );
				LIB_ASSERT.ok( diagnostics.os_version );
				LIB_ASSERT.ok( diagnostics.os_release );
				LIB_ASSERT.ok( diagnostics.uptime_seconds );
				LIB_ASSERT.ok( diagnostics.total_memory_bytes );
				LIB_ASSERT.ok( diagnostics.free_memory_bytes );
				LIB_ASSERT.ok( diagnostics.free_memory_ratio );
				// Return.
				return;
			} );


		//---------------------------------------------------------------------
		it( `should list the running tasks`,
			async function ()
			{
				let tasks = await Server.Services.ServerManagement.ListTasks( Admin );
				LIB_ASSERT.ok( tasks );
				// Return.
				return;
			} );


		//---------------------------------------------------------------------
		it( `should read the configuration`,
			async function ()
			{
				let configuration = await Server.Services.ServerManagement.ReadConfiguration( Admin );
				LIB_ASSERT.ok( configuration );
				// Return.
				return;
			} );


		//---------------------------------------------------------------------
		it( `should update the configuration`,
			async function ()
			{
				let configuration = await Server.Services.ServerManagement.ReadConfiguration( Admin );
				LIB_ASSERT.ok( configuration );
				// configuration.option = 1;
				let api_result = await Server.Services.ServerManagement.WriteConfiguration( Admin, configuration );
				LIB_ASSERT.ok( api_result );
				// Return.
				return;
			} );


	} );
