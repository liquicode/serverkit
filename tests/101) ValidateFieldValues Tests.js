'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );

const SRC_TEST_SERVER = require( './test-routines/TestServer.js' );
let Server = null;

//---------------------------------------------------------------------
describe( `101) ValidateFieldValues Tests`,
	function ()
	{
		let FIELDS_NAME_TYPE = [
			{ name: 'boolean', type: 'boolean' },
			{ name: 'integer', type: 'integer' },
			{ name: 'number', type: 'number' },
			{ name: 'string', type: 'string' },
			{ name: 'array', type: 'array' },
			{ name: 'object', type: 'object' },
		];

		let FIELDS_NAME_TYPE_DEFAULT = [
			{ name: 'boolean', type: 'boolean', default: true },
			{ name: 'integer', type: 'integer', default: 0 },
			{ name: 'number', type: 'number', default: 0.0 },
			{ name: 'string', type: 'string', default: '' },
			{ name: 'array', type: 'array', default: [] },
			{ name: 'object', type: 'object', default: {} },
		];

		let FIELDS_NAME_TYPE_REQUIRED = [
			{ name: 'boolean', type: 'boolean', required: true },
			{ name: 'integer', type: 'integer', required: true },
			{ name: 'number', type: 'number', required: true },
			{ name: 'string', type: 'string', required: true },
			{ name: 'array', type: 'array', required: true },
			{ name: 'object', type: 'object', required: true },
		];

		let FIELDS_NAME_TYPE_DEFAULT_REQUIRED = [
			{ name: 'boolean', type: 'boolean', default: true, required: true },
			{ name: 'integer', type: 'integer', default: 0, required: true },
			{ name: 'number', type: 'number', default: 0.0, required: true },
			{ name: 'string', type: 'string', default: '', required: true },
			{ name: 'array', type: 'array', default: [], required: true },
			{ name: 'object', type: 'object', default: {}, required: true },
		];


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
		it( `should be initialized`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( Server.Settings );
				LIB_ASSERT.ok( Server.Settings.AppInfo );
				LIB_ASSERT.ok( Server.Settings.AppInfo.name );
			}
		);


		// //---------------------------------------------------------------------
		// describe( `Validation Tests`,
		// 	function ()
		// 	{


		// 		//---------------------------------------------------------------------
		// 		it( `should validate successfully an empty object with no defaults or required fields`,
		// 			async function ()
		// 			{
		// 				let field_values = {};
		// 				let result = Server.ValidateFieldValues( FIELDS_NAME_TYPE, field_values );
		// 				LIB_ASSERT.ok( result.errors.length === 0 ); // No validation errors.
		// 				LIB_ASSERT.ok( result.fields.boolean === undefined );
		// 				LIB_ASSERT.ok( result.fields.integer === undefined );
		// 				LIB_ASSERT.ok( result.fields.number === undefined );
		// 				LIB_ASSERT.ok( result.fields.string === undefined );
		// 				LIB_ASSERT.ok( result.fields.array === undefined );
		// 				LIB_ASSERT.ok( result.fields.object === undefined );
		// 				return;
		// 			} );


		// 		//---------------------------------------------------------------------
		// 		it( `should generate validation errors for missing fields that are required and do not have defaults`,
		// 			async function ()
		// 			{
		// 				let field_values = {};
		// 				let result = Server.ValidateFieldValues( FIELDS_NAME_TYPE_REQUIRED, field_values );
		// 				LIB_ASSERT.ok( result.errors.length !== 0 ); // Validation errors exist!
		// 				LIB_ASSERT.ok( result.errors.length === 6 );
		// 				LIB_ASSERT.ok( result.errors[ 0 ] === '[boolean] is required' );
		// 				LIB_ASSERT.ok( result.errors[ 1 ] === '[integer] is required' );
		// 				LIB_ASSERT.ok( result.errors[ 2 ] === '[number] is required' );
		// 				LIB_ASSERT.ok( result.errors[ 3 ] === '[string] is required' );
		// 				LIB_ASSERT.ok( result.errors[ 4 ] === '[array] is required' );
		// 				LIB_ASSERT.ok( result.errors[ 5 ] === '[object] is required' );
		// 				return;
		// 			} );


		// 	} );


		//---------------------------------------------------------------------
		describe( `ConvertValues Tests`,
			function ()
			{


				//---------------------------------------------------------------------
				it( `should set nulls for missing fields that have no defaults`,
					async function ()
					{
						let field_values = {};
						let result = Server.ValidateFieldValues( FIELDS_NAME_TYPE, field_values );
						LIB_ASSERT.ok( result.errors.length === 0 ); // No validation errors.
						LIB_ASSERT.ok( result.fields.boolean === null );
						LIB_ASSERT.ok( result.fields.integer === null );
						LIB_ASSERT.ok( result.fields.number === null );
						LIB_ASSERT.ok( result.fields.string === null );
						LIB_ASSERT.ok( result.fields.array === null );
						LIB_ASSERT.ok( result.fields.object === null );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should intialize missing fields with default values`,
					async function ()
					{
						let field_values = {};
						let result = Server.ValidateFieldValues( FIELDS_NAME_TYPE_DEFAULT, field_values );
						LIB_ASSERT.ok( result.errors.length === 0 ); // No validation errors.
						LIB_ASSERT.ok( result.fields.boolean === true );
						LIB_ASSERT.ok( result.fields.integer === 0 );
						LIB_ASSERT.ok( result.fields.number === 0.0 );
						LIB_ASSERT.ok( result.fields.string === '' );
						LIB_ASSERT.ok( Array.isArray( result.fields.array ) );
						LIB_ASSERT.ok( result.fields.array.length === 0 );
						LIB_ASSERT.ok( typeof result.fields.object === 'object' );
						LIB_ASSERT.ok( Object.keys( result.fields.object ).length === 0 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should intialize missing fields with default values when fields are required, but also generate validation errors`,
					async function ()
					{
						let field_values = {};
						let result = Server.ValidateFieldValues( FIELDS_NAME_TYPE_DEFAULT_REQUIRED, field_values );
						LIB_ASSERT.ok( result.errors.length !== 0 ); // Validation errors exist!
						LIB_ASSERT.ok( result.errors.length === 6 );
						LIB_ASSERT.ok( result.errors[ 0 ] === '[boolean] is required' );
						LIB_ASSERT.ok( result.errors[ 1 ] === '[integer] is required' );
						LIB_ASSERT.ok( result.errors[ 2 ] === '[number] is required' );
						LIB_ASSERT.ok( result.errors[ 3 ] === '[string] is required' );
						LIB_ASSERT.ok( result.errors[ 4 ] === '[array] is required' );
						LIB_ASSERT.ok( result.errors[ 5 ] === '[object] is required' );
						LIB_ASSERT.ok( result.fields.boolean === true );
						LIB_ASSERT.ok( result.fields.integer === 0 );
						LIB_ASSERT.ok( result.fields.number === 0.0 );
						LIB_ASSERT.ok( result.fields.string === '' );
						LIB_ASSERT.ok( Array.isArray( result.fields.array ) );
						LIB_ASSERT.ok( result.fields.array.length === 0 );
						LIB_ASSERT.ok( typeof result.fields.object === 'object' );
						LIB_ASSERT.ok( Object.keys( result.fields.object ).length === 0 );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should convert from string values`,
					async function ()
					{
						let field_values = {
							boolean: 'true',
							integer: '0',
							number: '0.0',
							string: 'x',
							array: '[ 3.14 ]',
							object: '{ "foo": "bar" }',
						};
						let result = Server.ValidateFieldValues( FIELDS_NAME_TYPE_DEFAULT_REQUIRED, field_values );
						LIB_ASSERT.ok( result.errors.length === 0 ); // No validation errors.
						LIB_ASSERT.ok( result.fields.boolean === true );
						LIB_ASSERT.ok( result.fields.integer === 0 );
						LIB_ASSERT.ok( result.fields.number === 0.0 );
						LIB_ASSERT.ok( result.fields.string === 'x' );
						LIB_ASSERT.ok( Array.isArray( result.fields.array ) );
						LIB_ASSERT.ok( result.fields.array.length === 1 );
						LIB_ASSERT.ok( result.fields.array[ 0 ] === 3.14 );
						LIB_ASSERT.ok( typeof result.fields.object === 'object' );
						LIB_ASSERT.ok( Object.keys( result.fields.object ).length === 1 );
						LIB_ASSERT.ok( result.fields.object.foo === 'bar' );
						return;
					} );


				//---------------------------------------------------------------------
				it( `should not convert from null values`,
					async function ()
					{
						let field_values = {
							boolean: null,
							integer: null,
							number: null,
							string: null,
							array: null,
							object: null,
						};
						let result = Server.ValidateFieldValues( FIELDS_NAME_TYPE_DEFAULT_REQUIRED, field_values );
						LIB_ASSERT.ok( result.errors.length === 0 ); // No validation errors.
						LIB_ASSERT.ok( result.fields.boolean === null );
						LIB_ASSERT.ok( result.fields.integer === null );
						LIB_ASSERT.ok( result.fields.number === null );
						LIB_ASSERT.ok( result.fields.string === null );
						LIB_ASSERT.ok( result.fields.array === null );
						LIB_ASSERT.ok( result.fields.object === null );
						return;
					} );


			} );


	} );
