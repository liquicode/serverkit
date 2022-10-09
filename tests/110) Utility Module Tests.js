'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;

//---------------------------------------------------------------------
describe( `110) Utility Module Tests`,
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
		it( `should replace all instances of a single character within a string`,
			async function ()
			{
				let original_text = 'This is a test string.';
				let replaced_text = Server.Utility.replace_all( original_text, ' ', '_' );
				LIB_ASSERT.ok( replaced_text === 'This_is_a_test_string.' );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should replace all instances of a multiple characters within a string`,
			async function ()
			{
				let original_text = 'This is a test string.';
				let replaced_text = Server.Utility.replace_all( original_text, ' .', '_' );
				LIB_ASSERT.ok( replaced_text === 'This_is_a_test_string_' );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should count all files within a single folder`,
			async function ()
			{
				let test_folders_path = LIB_PATH.join( __dirname, 'test-data', 'folders' );
				// folder-1
				let folder_path = LIB_PATH.join( test_folders_path, 'folder-1' );
				let file_count = Server.Utility.count_files_recurse( folder_path );
				LIB_ASSERT.strictEqual( file_count, 1 );
				// folder-2
				folder_path = LIB_PATH.join( test_folders_path, 'folder-2' );
				file_count = Server.Utility.count_files_recurse( folder_path );
				LIB_ASSERT.strictEqual( file_count, 2 );
				// folder-3
				folder_path = LIB_PATH.join( test_folders_path, 'folder-3' );
				file_count = Server.Utility.count_files_recurse( folder_path );
				LIB_ASSERT.strictEqual( file_count, 3 );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should recursively count all files within multiple folders`,
			async function ()
			{
				let test_folders_path = LIB_PATH.join( __dirname, 'test-data', 'folders' );
				let file_count = Server.Utility.count_files_recurse( test_folders_path );
				LIB_ASSERT.strictEqual( file_count, 6 );
				return;
			} );


	} );

