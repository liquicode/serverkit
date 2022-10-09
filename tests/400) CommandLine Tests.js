'use strict';


const LIB_ASSERT = require( 'assert' );
const LIB_PATH = require( 'path' );
const LIQUICODEJS = require( '@liquicode/liquicodejs' );


//---------------------------------------------------------------------
describe( `400) Command Line Tests`,
	function ()
	{

		const ServerKitCommand = 'node ' + LIB_PATH.resolve( __dirname, '..', 'src', 'server-kit.js' ) + ' --name TestServer ';
		const StartFolder = LIB_PATH.join( __dirname, '~temp' );

		//---------------------------------------------------------------------
		it( `should display the version`,
			async function ()
			{
				let command = `${ServerKitCommand} --version`;
				let result = LIQUICODEJS.System.ExecuteProcess( command, {}, StartFolder );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.ok( result.result );
				LIB_ASSERT.ok( result.result.startsWith( 'ServerKit v' ) );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should list the services`,
			async function ()
			{
				let command = `${ServerKitCommand} list`;
				let result = LIQUICODEJS.System.ExecuteProcess( command, {}, StartFolder );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.ok( result.result );
				let lines = result.result.split( '\n' );
				LIB_ASSERT.ok( lines[ 0 ], 'Authentication' );
				LIB_ASSERT.ok( lines[ 1 ], 'ServerAccounts' );
				LIB_ASSERT.ok( lines[ 2 ], 'ServerManagement' );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should login`,
			async function ()
			{
				let command = `${ServerKitCommand} login admin@server password`;
				let result = LIQUICODEJS.System.ExecuteProcess( command, {}, StartFolder );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.ok( result.result );
				LIB_ASSERT.ok( result.result.startsWith( 'Login OK' ) );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should show admin as logged in`,
			async function ()
			{
				let command = `${ServerKitCommand} who`;
				let result = LIQUICODEJS.System.ExecuteProcess( command, {}, StartFolder );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.ok( result.result );
				LIB_ASSERT.ok( result.result.startsWith( 'The user [admin@server] is logged in with role of [admin].' ) );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should get Server Diagnostics`,
			async function ()
			{
				let command = `${ServerKitCommand} call ServerManagement.Diagnostics`;
				let result = LIQUICODEJS.System.ExecuteProcess( command, {}, StartFolder );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.ok( result.result );
				let info = JSON.parse( result.result );
				LIB_ASSERT.ok( info );
				LIB_ASSERT.ok( info.timestamp );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should find all ServerAccounts`,
			async function ()
			{
				let command = `${ServerKitCommand} call ServerAccounts.StorageFindMany`;
				let result = LIQUICODEJS.System.ExecuteProcess( command, {}, StartFolder );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.ok( result.result );
				let accounts = JSON.parse( result.result );
				LIB_ASSERT.ok( accounts );
				LIB_ASSERT.ok( accounts.length === 3 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should find all admin accounts - syntax 1`,
			async function ()
			{
				let command = `${ServerKitCommand} call ServerAccounts.StorageFindMany --Criteria "{ user_role: 'admin' }"`;
				let result = LIQUICODEJS.System.ExecuteProcess( command, {}, StartFolder );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.ok( result.result );
				let accounts = JSON.parse( result.result );
				LIB_ASSERT.ok( accounts );
				LIB_ASSERT.ok( accounts.length === 1 );
				LIB_ASSERT.ok( accounts[ 0 ].user_role === 'admin' );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should find all admin accounts - syntax 2`,
			async function ()
			{
				let command = `${ServerKitCommand} call ServerAccounts.StorageFindMany "{ Criteria: { user_role: 'admin' } }"`;
				let result = LIQUICODEJS.System.ExecuteProcess( command, {}, StartFolder );
				LIB_ASSERT.ok( result );
				LIB_ASSERT.ok( result.result );
				let accounts = JSON.parse( result.result );
				LIB_ASSERT.ok( accounts );
				LIB_ASSERT.ok( accounts.length === 1 );
				LIB_ASSERT.ok( accounts[ 0 ].user_role === 'admin' );
				return;
			} );


	} );
