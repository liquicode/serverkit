'use strict';


const LIB_ASSERT = require( 'assert' );

// Make some fake users.
let Alice = { user_id: 'alice@server', user_role: 'admin' };
let Bob = { user_id: 'bob@server', user_role: 'user' };
let Eve = { user_id: 'eve@server', user_role: 'user' };


exports.CreateTestObjects = CreateTestObjects;
// exports.TestUserReadAccess = TestUserReadAccess;
// exports.TestUserWriteAccess = TestUserWriteAccess;

exports.TestAccessForAlice = TestAccessForAlice;
exports.TestAccessForBob = TestAccessForBob;
exports.TestAccessForEve = TestAccessForEve;

exports.TestReadAccessForPublicObjects = TestReadAccessForPublicObjects;
exports.TestWriteAccessForPublicObjects = TestWriteAccessForPublicObjects;
exports.TestReadOnlyAccess = TestReadOnlyAccess;


//---------------------------------------------------------------------
async function CreateTestObjects( UserStorage )
{

	let doc = null;
	await UserStorage.DeleteMany( Alice );

	// Create some documents for Alice.
	doc = await UserStorage.CreateOne( Alice, { name: 'Public Document', text: 'This is a public document.' } );
	await UserStorage.Share( Alice, doc, null, null, true ); // Share this doc with everyone.

	doc = await UserStorage.CreateOne( Alice, { name: 'Internal Document', text: 'This is an internal document.' } );
	await UserStorage.Share( Alice, doc, null, Bob.user_id ); // Give read and write access to Bob.
	await UserStorage.Share( Alice, doc, Eve.user_id ); // Give read-only access to Eve.

	doc = await UserStorage.CreateOne( Alice, { name: 'Secret Document', text: 'This is a secret document.' } );
	await UserStorage.Share( Alice, doc, Bob.user_id ); // Give read-only access to Bob.

	// Create some documents for Bob.
	doc = await UserStorage.CreateOne( Bob, { name: 'My Document', text: 'This is my document.' } );
	doc = await UserStorage.CreateOne( Bob, { name: 'My Document 2', text: 'This is my other document.' } );

	// Create a document for Eve.
	doc = await UserStorage.CreateOne( Eve, { name: 'Evil Plans', text: 'Step 1: Take over the world.' } );

	return;
};


//---------------------------------------------------------------------
async function TestUserReadAccess( UserStorage, User, DocumentNames )
{
	// Test the number of objects accessible.
	{
		let count = await UserStorage.Count( User );
		LIB_ASSERT.strictEqual( count, DocumentNames.length );
	}

	// Test the results of FindOne.
	{
		for ( let index = 0; index < DocumentNames.length; index++ )
		{
			let document_name = DocumentNames[ index ];
			let doc = await UserStorage.FindOne( User, { name: document_name } );
			LIB_ASSERT.ok( doc !== null );
			LIB_ASSERT.strictEqual( doc.name, document_name );
		}
	}

	// Test the results of FindMany.
	{
		let objects = await UserStorage.FindMany( User );
		LIB_ASSERT.strictEqual( objects.length, DocumentNames.length );
		for ( let index = 0; index < objects.length; index++ )
		{
			let object = objects[ index ];
			LIB_ASSERT.ok( DocumentNames.includes( object.name ) );
		}
	}

	return;
};


//---------------------------------------------------------------------
async function TestUserWriteAccess( UserStorage, User, DocumentNames )
{
	// Test the results of WriteOne.
	{
		for ( let index = 0; index < DocumentNames.length; index++ )
		{
			let document_name = DocumentNames[ index ];
			let doc = await UserStorage.FindOne( User, { name: document_name } );
			LIB_ASSERT.ok( doc !== null );
			LIB_ASSERT.strictEqual( doc.name, document_name );
			doc.text = "I overwrote your message.";
			let count = await UserStorage.WriteOne( User, doc );
			LIB_ASSERT.ok( count === 1 );
		}
	}
	return;
};


//---------------------------------------------------------------------
async function TestAccessForAlice( UserStorage )
{
	// Alice should read all documents and write all documents
	await TestUserReadAccess( UserStorage,
		Alice,
		[
			'Public Document',
			'Internal Document',
			'Secret Document',
			'My Document',
			'My Document 2',
			'Evil Plans',
		] );
	await TestUserWriteAccess( UserStorage,
		Alice,
		[
			'Public Document',
			'Internal Document',
			'Secret Document',
			'My Document',
			'My Document 2',
			'Evil Plans',
		] );
	return;
};


//---------------------------------------------------------------------
async function TestAccessForBob( UserStorage )
{
	// Bob should read some documents and write some documents
	await TestUserReadAccess( UserStorage,
		Bob,
		[
			'Public Document',
			'Internal Document',
			'Secret Document',
			'My Document',
			'My Document 2',
			// 'Evil Plans',
		] );
	await TestUserWriteAccess( UserStorage,
		Bob,
		[
			// 'Public Document',
			'Internal Document',
			// 'Secret Document',
			'My Document',
			'My Document 2',
			// 'Evil Plans',
		] );
	return;
};


//---------------------------------------------------------------------
async function TestAccessForEve( UserStorage )
{
	// Eve should read some documents and write some documents
	await TestUserReadAccess( UserStorage,
		Eve,
		[
			'Public Document',
			'Internal Document',
			// 'Secret Document',
			// 'My Document',
			// 'My Document 2',
			'Evil Plans',
		] );
	await TestUserWriteAccess( UserStorage,
		Eve,
		[
			// 'Public Document',
			// 'Internal Document',
			// 'Secret Document',
			// 'My Document',
			// 'My Document 2',
			'Evil Plans',
		] );
	return;
};


//---------------------------------------------------------------------
async function TestReadAccessForPublicObjects( UserStorage )
{
	// Public objects should be readable by everyone
	let doc = null;

	doc = await UserStorage.FindOne( Alice, { name: 'Public Document' } );
	LIB_ASSERT.ok( doc );
	LIB_ASSERT.strictEqual( doc.name, 'Public Document' );

	doc = await UserStorage.FindOne( Bob, { name: 'Public Document' } );
	LIB_ASSERT.ok( doc );
	LIB_ASSERT.strictEqual( doc.name, 'Public Document' );

	doc = await UserStorage.FindOne( Eve, { name: 'Public Document' } );
	LIB_ASSERT.ok( doc );
	LIB_ASSERT.strictEqual( doc.name, 'Public Document' );

	return;
};


//---------------------------------------------------------------------
async function TestWriteAccessForPublicObjects( UserStorage )
{
	// Public objects should only be writable by the owner
	let original_doc = await UserStorage.FindOne( Alice, { name: 'Public Document' } );
	LIB_ASSERT.ok( original_doc );

	// Bob cannot update the public document.
	{
		// Get the document.
		let doc = await UserStorage.FindOne( Bob, { name: 'Public Document' } );
		// Edit the document.
		doc.text = "I have overwritten your message.";
		// Attempt to save the document.
		let count = await UserStorage.WriteOne( Bob, doc );
		LIB_ASSERT.strictEqual( count, 0 ); // Write failed.
		// Read thew document again.
		doc = await UserStorage.FindOne( Bob, { name: 'Public Document' } );
		LIB_ASSERT.deepStrictEqual( original_doc, doc );
	}

	// Eve cannot update the public document.
	{
		// Get the document.
		let doc = await UserStorage.FindOne( Eve, { name: 'Public Document' } );
		// Edit the document.
		doc.text = "I have overwritten your message.";
		// Attempt to save the document.
		let count = await UserStorage.WriteOne( Eve, doc );
		LIB_ASSERT.strictEqual( count, 0 ); // Write failed.
		// Read thew document again.
		doc = await UserStorage.FindOne( Eve, { name: 'Public Document' } );
		LIB_ASSERT.deepStrictEqual( original_doc, doc );
	}

	return;
};


//---------------------------------------------------------------------
async function TestReadOnlyAccess( UserStorage )
{
	// Should not allow readers to update documents

	// Bob can read, but not update, the document 'Secret Document'.
	{
		let original_doc = await UserStorage.FindOne( Alice, { name: 'Secret Document' } );
		LIB_ASSERT.ok( original_doc );
		// Get the document.
		let doc = await UserStorage.FindOne( Bob, { name: 'Secret Document' } );
		// Edit the document.
		doc.text = "I have overwritten your message.";
		// Attempt to save the document.
		let count = await UserStorage.WriteOne( Bob, doc );
		LIB_ASSERT.strictEqual( count, 0 ); // Write failed.
		// Read thew document again.
		doc = await UserStorage.FindOne( Bob, { name: 'Secret Document' } );
		LIB_ASSERT.deepStrictEqual( original_doc, doc );
	}

	// Eve can read, but not update, the document 'Internal Document'.
	{
		let original_doc = await UserStorage.FindOne( Alice, { name: 'Internal Document' } );
		LIB_ASSERT.ok( original_doc );
		// Get the document.
		let doc = await UserStorage.FindOne( Eve, { name: 'Internal Document' } );
		// Edit the document.
		doc.text = "I have overwritten your message.";
		// Attempt to save the document.
		let count = await UserStorage.WriteOne( Eve, doc );
		LIB_ASSERT.strictEqual( count, 0 ); // Write failed.
		// Read thew document again.
		doc = await UserStorage.FindOne( Eve, { name: 'Internal Document' } );
		LIB_ASSERT.deepStrictEqual( original_doc, doc );
	}

	return;
};


