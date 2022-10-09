'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;

let Admin = { user_id: 'admin', user_role: 'admin', user_name: 'Administrator' };
let Super = { user_id: 'super', user_role: 'super', user_name: 'Supervisor' };
let User = { user_id: 'user', user_role: 'user', user_name: 'User' };


//---------------------------------------------------------------------
describe( `230) ServerAccounts Service Tests`,
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
		it( `should perform storage functions`,
			async function ()
			{
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 0 );
				let user = await Server.Services.ServerAccounts.StorageCreateOne( Admin, Admin );
				LIB_ASSERT.ok( user );
				LIB_ASSERT.ok( user.user_id === Admin.user_id );
				LIB_ASSERT.ok( user.user_role === Admin.user_role );
				LIB_ASSERT.ok( user.user_name === 'Administrator' );
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 1 );
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageDeleteOne( Admin, { user_id: Admin.user_id } ) === 1 );
				// Return.
				return;
			} );


		//---------------------------------------------------------------------
		it( `should create admin-owned users`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Services.ServerAccounts );
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 0 );

				// Create users directly into the storage by calling CreateOne.
				// CreateOne will create the object bu assign ownership to the calling user.

				// Create an Admin user.
				let _admin = await Server.Services.ServerAccounts.StorageCreateOne( Admin, Admin );
				LIB_ASSERT.ok( _admin );										// User was created
				LIB_ASSERT.ok( _admin.user_id === Admin.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _admin.user_role === Admin.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _admin.__.owner_id === Admin.user_id );			// User is owned by the Admin
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 1 );

				// Create a Super user.
				let _super = await Server.Services.ServerAccounts.StorageCreateOne( Admin, Super );
				LIB_ASSERT.ok( _super );										// User was created
				LIB_ASSERT.ok( _super.user_id === Super.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _super.user_role === Super.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _super.__.owner_id === Admin.user_id );			// User is owned by the Admin
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 2 );

				// Create a normal user.
				let _user = await Server.Services.ServerAccounts.StorageCreateOne( Admin, User );
				LIB_ASSERT.ok( _user );											// User was created
				LIB_ASSERT.ok( _user.user_id === User.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _user.user_role === User.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _user.__.owner_id === Admin.user_id );			// User is owned by the Admin
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 3 );

				// Delete all of the users.
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageDeleteMany( Admin ) === 3 );
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 0 );

				return;
			} );


		//---------------------------------------------------------------------
		it( `should create self-owned users`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Services.ServerAccounts );
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 0 );

				// Perform a signup operation by calling FindOrCreateUser.
				// FindOrCreateUser will create a user if it doesnt already exist
				// and will assign ownership to that new user.
				// Note that this function does not take a User object as its first parameter
				// and does not do any permissions checking.
				// As such, this function is only used internally and is not exported as part of a service.

				let api_result = null;

				// Create an Admin user.
				api_result = await Server.Services.ServerAccounts.FindOrCreateUser( Admin );
				LIB_ASSERT.ok( api_result );
				LIB_ASSERT.ok( api_result.ok );
				LIB_ASSERT.ok( !api_result.error );
				let _admin = api_result.result;
				LIB_ASSERT.ok( _admin );										// User was created
				LIB_ASSERT.ok( _admin.user_id === Admin.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _admin.user_role === Admin.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _admin.__.owner_id === Admin.user_id );			// User is owned by the Admin
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 1 );

				// Create a Super user.
				api_result = await Server.Services.ServerAccounts.FindOrCreateUser( Super );
				LIB_ASSERT.ok( api_result );
				LIB_ASSERT.ok( api_result.ok );
				LIB_ASSERT.ok( !api_result.error );
				let _super = api_result.result;
				LIB_ASSERT.ok( _super );										// User was created
				LIB_ASSERT.ok( _super.user_id === Super.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _super.user_role === Super.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _super.__.owner_id === Super.user_id );			// User is owned by the user
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 2 );

				// Create a normal user.
				api_result = await Server.Services.ServerAccounts.FindOrCreateUser( User );
				LIB_ASSERT.ok( api_result );
				LIB_ASSERT.ok( api_result.ok );
				LIB_ASSERT.ok( !api_result.error );
				let _user = api_result.result;
				LIB_ASSERT.ok( _user );											// User was created
				LIB_ASSERT.ok( _user.user_id === User.user_id );				// User has the correct user_id
				LIB_ASSERT.ok( _user.user_role === User.user_role );			// User has the correct user_role
				LIB_ASSERT.ok( _user.__.owner_id === User.user_id );			// User is owned by the user
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 3 );

				// Delete all of the users.
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageDeleteMany( Admin ) === 3 );
				LIB_ASSERT.ok( await Server.Services.ServerAccounts.StorageCount( Admin ) === 0 );

				return;
			} );


	} );
