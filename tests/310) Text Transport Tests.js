'use strict';


const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;


//---------------------------------------------------------------------
describe( `310) Text Transport Tests`,
	function ()
	{

		let session_user = null;
		let session_token = null;


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				Server = await SRC_TEST_SERVER.CreateTestServer( {
					Transports: {
						Text: { enabled: true },
					},
				} );
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
				LIB_ASSERT.ok( Server.Services.TestService );
				LIB_ASSERT.ok( Server.Transports.Text );
				return;
			}
		);


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	ParseCommand Tests
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		describe( `ParseCommand Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				it( `should parse key-value parameters, space ' ' separated`,
					async function ()
					{
						let command = `Service.Origin --Param1 "Value1" --Param2 3.14 --Param3 false --Param4 { field1: 1, field2: 'two' } --Param5 [ 1, 2, 3 ]`;
						let parse_result = await Server.Transports.Text.ParseCommandString( command );
						LIB_ASSERT.ok( parse_result );
						LIB_ASSERT.ok( parse_result.service_name === 'Service' );
						LIB_ASSERT.ok( parse_result.origin_name === 'Origin' );
						LIB_ASSERT.ok( parse_result.Fields.Param1 === 'Value1' );
						LIB_ASSERT.ok( parse_result.Fields.Param2 === 3.14 );
						LIB_ASSERT.ok( parse_result.Fields.Param3 === false );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param4, { field1: 1, field2: 'two' } );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param5, [ 1, 2, 3 ] );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should parse key-value parameters, equals '=' separated`,
					async function ()
					{
						LIB_ASSERT.ok( Server );
						let command = `Service.Origin --Param1="Value1" --Param2= 3.14 --Param3= false --Param4={ field1: 1, field2: 'two' } --Param5= [ 1, 2, 3 ]`;
						let parse_result = await Server.Transports.Text.ParseCommandString( command );
						LIB_ASSERT.ok( parse_result );
						LIB_ASSERT.ok( parse_result.service_name === 'Service' );
						LIB_ASSERT.ok( parse_result.origin_name === 'Origin' );
						LIB_ASSERT.ok( parse_result.Fields.Param1 === 'Value1' );
						LIB_ASSERT.ok( parse_result.Fields.Param2 === 3.14 );
						LIB_ASSERT.ok( parse_result.Fields.Param3 === false );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param4, { field1: 1, field2: 'two' } );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param5, [ 1, 2, 3 ] );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should parse key-value parameters, colon ':' separated`,
					async function ()
					{
						LIB_ASSERT.ok( Server );
						let command = `Service.Origin --Param1:"Value1" --Param2: 3.14 --Param3: false --Param4:{ field1: 1, field2: 'two' } --Param5: [ 1, 2, 3 ]`;
						let parse_result = await Server.Transports.Text.ParseCommandString( command );
						LIB_ASSERT.ok( parse_result );
						LIB_ASSERT.ok( parse_result.service_name === 'Service' );
						LIB_ASSERT.ok( parse_result.origin_name === 'Origin' );
						LIB_ASSERT.ok( parse_result.Fields.Param1 === 'Value1' );
						LIB_ASSERT.ok( parse_result.Fields.Param2 === 3.14 );
						LIB_ASSERT.ok( parse_result.Fields.Param3 === false );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param4, { field1: 1, field2: 'two' } );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param5, [ 1, 2, 3 ] );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should parse key-value parameters, mixed separators`,
					async function ()
					{
						LIB_ASSERT.ok( Server );
						let command = `Service.Origin --Param1 "Value1" --Param2 3.14 --Param3: false --Param4={ field1: 1, field2: 'two' } --Param5 [ 1, 2, 3 ]`;
						let parse_result = await Server.Transports.Text.ParseCommandString( command );
						LIB_ASSERT.ok( parse_result );
						LIB_ASSERT.ok( parse_result.service_name === 'Service' );
						LIB_ASSERT.ok( parse_result.origin_name === 'Origin' );
						LIB_ASSERT.ok( parse_result.Fields.Param1 === 'Value1' );
						LIB_ASSERT.ok( parse_result.Fields.Param2 === 3.14 );
						LIB_ASSERT.ok( parse_result.Fields.Param3 === false );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param4, { field1: 1, field2: 'two' } );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param5, [ 1, 2, 3 ] );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should parse positional parameters`,
					async function ()
					{
						LIB_ASSERT.ok( Server );
						let command = `Service.Origin "Value1" 3.14 false "{ field1: 1, field2: 'two' }" "[ 1, 2, 3 ]"`;
						let parse_result = await Server.Transports.Text.ParseCommandString( command );
						LIB_ASSERT.ok( parse_result );
						LIB_ASSERT.ok( parse_result.service_name === 'Service' );
						LIB_ASSERT.ok( parse_result.origin_name === 'Origin' );
						LIB_ASSERT.ok( parse_result.Fields[ 0 ] === 'Value1' );
						LIB_ASSERT.ok( parse_result.Fields[ 1 ] === 3.14 );
						LIB_ASSERT.ok( parse_result.Fields[ 2 ] === false );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields[ 3 ], { field1: 1, field2: 'two' } );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields[ 4 ], [ 1, 2, 3 ] );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should parse json parameters`,
					async function ()
					{
						LIB_ASSERT.ok( Server );
						let command = `Service.Origin { Param1: 'Value1', "Param2": 3.14, 'Param3': false, Param4: { field1: 1, field2: 'two' }, Param5: [ 1, 2, 3 ] }`;
						let parse_result = await Server.Transports.Text.ParseCommandString( command );
						LIB_ASSERT.ok( parse_result );
						LIB_ASSERT.ok( parse_result.service_name === 'Service' );
						LIB_ASSERT.ok( parse_result.origin_name === 'Origin' );
						LIB_ASSERT.ok( parse_result.Fields.Param1 === 'Value1' );
						LIB_ASSERT.ok( parse_result.Fields.Param2 === 3.14 );
						LIB_ASSERT.ok( parse_result.Fields.Param3 === false );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param4, { field1: 1, field2: 'two' } );
						LIB_ASSERT.deepStrictEqual( parse_result.Fields.Param5, [ 1, 2, 3 ] );
						return;
					} );


				return;
			} ); // ParseCommand Tests


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
						LIB_ASSERT.ok( result );
						LIB_ASSERT.ok( result.User );
						LIB_ASSERT.ok( result.User.user_id === 'admin@server' );
						session_user = null;
						session_token = null;
						return;
					} );


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
						let command = `TestService.Add --A 3 --B 4`;
						let response = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.strictEqual( response, 7 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should subtract two numbers`,
					async function ()
					{
						let command = `TestService.Subtract --A 3 --B 4`;
						let response = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.strictEqual( response, -1 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should multiply two numbers`,
					async function ()
					{
						let command = `TestService.Multiply --A 3 --B 4`;
						let response = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.strictEqual( response, 12 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should divide two numbers`,
					async function ()
					{
						let command = `TestService.Divide --A 3 --B 4`;
						let response = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.strictEqual( response, 0.75 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should not matter what order the parameters are in`,
					async function ()
					{
						let command = `TestService.Divide --B 4 --A 3`;
						let response = await Server.Transports.Text.InvokeCommand( session_token, command );
						LIB_ASSERT.ok( response );
						LIB_ASSERT.strictEqual( response, 0.75 );
						return;
					} );


			}
		); // TestService Tests


	} );
