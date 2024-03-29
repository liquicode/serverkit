'use strict';


const LIB_ASSERT = require( 'assert' );

require( 'babel-polyfill' ); // Required for json-criteria.
const LIB_JSON_CRITERIA = require( 'json-criteria' );
/*
- `json-criteria` [NPM](https://www.npmjs.com/package/json-criteria) [GIT](https://github.com/mirek/node-json-criteria)
	- This library requires npm `babel-polyfill`.
	- Provides a mongo-like query syntax.
	- Used by StorageProviders.
*/
/*
npm install --save babel-polyfill
npm install --save json-criteria
*/

const JSONX = require( '../src/modules/Utility/Jsonx' )();

function json_test( Data, Query )
{
	// return LIB_JSON_CRITERIA.test( Data, Query );
	return JSONX.Evaluate( Query, Data );
}


//---------------------------------------------------------------------
describe( `022) Json Match Tests`,
	function ()
	{


		//---------------------------------------------------------------------
		it( `Should match {} with everything`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					json_test( { foo: 1 }, {} ),
					true );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should perform a simple match`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					json_test( { foo: 1 }, { foo: 1 } ),
					true );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should perform a similar match`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					json_test( { foo: 1, bar: 1 }, { foo: 1 } ),
					true );
				LIB_ASSERT.strictEqual(
					json_test( { foo: 1, bar: 1 }, { bar: 1 } ),
					true );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should perform a nested match`,
			function ()
			{
				let object = {
					foo: {
						bar: 1,
						baz: 2,
					}
				};
				LIB_ASSERT.strictEqual(
					json_test( object, { foo: { bar: 1 } } ),
					true );
				LIB_ASSERT.strictEqual(
					json_test( object, { foo: { baz: 2 } } ),
					true );
				LIB_ASSERT.strictEqual(
					json_test( object, { foo: { bar: 1, baz: 2 } } ), //TODO: Use implicit $and
					true );
				LIB_ASSERT.strictEqual(
					json_test( object, { 'foo.bar': 1 } ),
					true );
				LIB_ASSERT.strictEqual(
					json_test( object, { 'foo.baz': 2 } ),
					true );
				return;
			} );


		// //---------------------------------------------------------------------
		// it( `Should perform an array match`,
		// 	function ()
		// 	{
		// 		let object = {
		// 			array: [ 'one', 'two', 'three', { four: 4 } ]
		// 		};

		// 		// Should
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $size: 4 } } ),
		// 			true );

		// 		// - Match a single element
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $elemMatch: 'two' } } ),
		// 			true );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $in: 'two' } } ),
		// 			true );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { 'array.1': 'two' } ), //TODO: Determine official array notation in path: 'array.1' or 'array[1]'
		// 			true );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { 'array.3.four': 4 } ),
		// 			true );

		// 		// - Match from an array of elements
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: [ 'one', 'two', 'three', { four: 4 } ] } ),
		// 			true );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $in: [ 'one', 'three' ] } } ),
		// 			true );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $in: [ 'one', 'four' ] } } ),
		// 			true );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $all: [ 'one', 'three' ] } } ),
		// 			true );

		// 		// Shouldn't
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $elemMatch: 'four' } } ),
		// 			false );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $in: 'four' } } ),
		// 			false );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $all: [ 'one', 'four' ] } } ),
		// 			false );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $in: { four: 4 } } } ),
		// 			false );
		// 		LIB_ASSERT.strictEqual(
		// 			json_test( object, { array: { $in: [ { four: 4 } ] } } ),
		// 			false );

		// 		return;
		// 	} );


		return;
	} );


//---------------------------------------------------------------------
describe( `Json Match Tests: Speed Matching`,
	function ()
	{


		//---------------------------------------------------------------------
		it( `Should match ten-thousand times`,
			function ()
			{
				for ( let n = 1; n <= 10000; n++ )
				{
					LIB_ASSERT.strictEqual(
						json_test( { foo: n }, { foo: n } ),
						true );
				}
				return;
			} );


		return;
	} );


//---------------------------------------------------------------------
describe( `Json Match Tests: Not Matching`,
	function ()
	{


		//---------------------------------------------------------------------
		it( `Should not match 'undefined'`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					json_test( { foo: 1 } ),
					false );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should not match 'null'`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					json_test( { foo: 1 }, null ),
					false );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should not match different values`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					json_test( { foo: 1 }, { foo: 2 } ),
					false );
				return;
			} );


		//---------------------------------------------------------------------
		it( `Should not match different objects`,
			function ()
			{
				LIB_ASSERT.strictEqual(
					json_test( { foo: 1 }, { bar: 1 } ),
					false );
				return;
			} );


		return;
	} );


