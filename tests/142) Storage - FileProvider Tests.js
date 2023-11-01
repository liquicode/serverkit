'use strict';


const LIB_ASSERT = require( 'assert' );
const LIB_UUID = require( 'uuid' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
const SRC_STORAGE_PROVIDER_TESTS = require( './test-routines/StorageProvider Tests.js' );
const SRC_USER_STORAGE_TESTS = require( './test-routines/UserStorage Tests.js' );
const SRC_USER_STORAGE_SHARING_TESTS = require( './test-routines/UserStorage Sharing Tests.js' );

// Make some fake users.
let Alice = { user_id: 'alice@server', user_role: 'admin' };


var SERVER_SETTINGS = {
	Services: {
		TestService: {
			UserStorage: {
				storage_provider: 'FileProvider',
				FileProvider: {
					path: '~server-data/TestService',		// Path to the data files.
					filename: 'TestService',				// Name of the data files: {filename}.{id}.json
					use_lock_file: false,					// If true, uses lock files to synchronize file access.
				},
			},
		}
	}
};


//---------------------------------------------------------------------
describe( `142) Storage - FileProvider Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		describe( `FileProvider Tests (100 Objects)`,
			function ()
			{


				//---------------------------------------------------------------------
				let session_id = LIB_UUID.v4();
				let test_object_count = 100;
				let Server = null;
				let StorageService = null;


				//---------------------------------------------------------------------
				before(
					async function ()
					{
						Server = await SRC_TEST_SERVER.CreateTestServer( SERVER_SETTINGS );
						StorageService = Server.Services.TestService;
						LIB_ASSERT.ok( StorageService, 'Failed to create StorageService.' );
						LIB_ASSERT.ok( StorageService.UserStorage, 'Failed to create UserStorage.' );
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
				it( `Should create test objects`,
					async function ()
					{
						await SRC_STORAGE_PROVIDER_TESTS.CreateTestObjects( StorageService.UserStorage.Provider, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should read and write test objects`,
					async function ()
					{
						await SRC_STORAGE_PROVIDER_TESTS.ReadAndWriteTestObjects( StorageService.UserStorage.Provider, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should find all test objects`,
					async function ()
					{
						await SRC_STORAGE_PROVIDER_TESTS.FindAllTestObjects( StorageService.UserStorage.Provider, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should delete all test objects`,
					async function ()
					{
						await SRC_STORAGE_PROVIDER_TESTS.DeleteAllTestObjects( StorageService.UserStorage.Provider, session_id, test_object_count );
						return;
					} );


				return;
			} );


		//---------------------------------------------------------------------
		describe( `UserStorage on FileProvider Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				let session_id = LIB_UUID.v4();
				let test_object_count = 100;
				let Server = null;
				let StorageService = null;


				//---------------------------------------------------------------------
				before(
					async function ()
					{
						Server = await SRC_TEST_SERVER.CreateTestServer( SERVER_SETTINGS );
						StorageService = Server.Services.TestService;
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
				it( `Should create test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_TESTS.CreateTestObjects( StorageService.UserStorage, Alice, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should count all objects`,
					async function ()
					{
						let object_count = await StorageService.UserStorage.Count( Alice, {} );
						LIB_ASSERT.ok( object_count > 0 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should read and write test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_TESTS.ReadAndWriteTestObjects( StorageService.UserStorage, Alice, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should find all test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_TESTS.FindAllTestObjects( StorageService.UserStorage, Alice, session_id, test_object_count );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should delete all test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_TESTS.DeleteAllTestObjects( StorageService.UserStorage, Alice, session_id, test_object_count );
						return;
					} );


				return;
			} );


		//---------------------------------------------------------------------
		describe( `UserStorage Sharing on FileProvider Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				let Server = null;
				let StorageService = null;


				//---------------------------------------------------------------------
				before(
					async function ()
					{
						Server = await SRC_TEST_SERVER.CreateTestServer( SERVER_SETTINGS );
						StorageService = Server.Services.TestService;
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
				it( `Should create test objects`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.CreateTestObjects( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Alice should read all documents and write all documents`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestAccessForAlice( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Bob should read some documents and write some documents`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestAccessForBob( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Eve should read some documents and write some documents`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestAccessForEve( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Public objects should be readable by everyone`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestReadAccessForPublicObjects( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Public objects should only be writable by the owner`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestWriteAccessForPublicObjects( StorageService.UserStorage );
						return;
					} );


				//---------------------------------------------------------------------
				it( `Should not allow readers to update documents`,
					async function ()
					{
						await SRC_USER_STORAGE_SHARING_TESTS.TestReadOnlyAccess( StorageService.UserStorage );
						return;
					} );


				return;
			} );


		return;
	} );

