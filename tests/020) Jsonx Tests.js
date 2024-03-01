
const assert = require( 'assert' );
const JSONX = require( '../src/modules/Utility/Jsonx' )();


describe( '020) Jsonx Tests', () =>
{


	let test_user_record =
	{
		id: 1001,
		user:
		{
			name: 'Alice',
			location: 'East',
		},
		profile:
		{
			login: 'alice',
			role: 'admin',
		},
		tags: [ 'Staff', 'Dept. A' ],
	};


	//---------------------------------------------------------------------
	describe( 'ShortType Tests', () =>
	{

		it( 'should find short type', () => 
		{
			assert.ok( JSONX.ShortType( true ) === 'b' );
			assert.ok( JSONX.ShortType( 42 ) === 'n' );
			assert.ok( JSONX.ShortType( 'abc' ) === 's' );
			assert.ok( JSONX.ShortType( null ) === 'l' );
			assert.ok( JSONX.ShortType( {} ) === 'o' );
			assert.ok( JSONX.ShortType( [] ) === 'a' );
			assert.ok( JSONX.ShortType( function () { } ) === 'f' );
			assert.ok( JSONX.ShortType() === 'u' );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'GetObjectValue Tests', () =>
	{

		it( 'should return the given object if path is not provided', () => 
		{
			assert.ok( JSONX.GetObjectValue( 'abc' ) === 'abc' );
			assert.ok( JSONX.GetObjectValue( 'abc', null ) === 'abc' );
			assert.ok( JSONX.GetObjectValue( 'abc', '' ) === 'abc' );
		} );

		it( 'should return an indexed element', () => 
		{
			assert.ok( JSONX.GetObjectValue( [ 1, 2, 3 ], '$[1]' ) === 2 );
			assert.ok( typeof JSONX.GetObjectValue( [ 1, 2, 3 ], '[1]' ) === 'undefined' );
			assert.ok( JSONX.GetObjectValue( { value: [ 1, 2, 3 ] }, '$.value[1]' ) === 2 );
			assert.ok( JSONX.GetObjectValue( { value: [ 1, 2, 3 ] }, 'value[1]' ) === 2 );
		} );

		it( 'should get object value', () => 
		{
			assert.ok( JSONX.ShortType( JSONX.GetObjectValue( test_user_record, '$' ) ) === 'o' );
			assert.ok( JSONX.GetObjectValue( test_user_record, '$.id' ) === 1001 );
			assert.ok( JSONX.GetObjectValue( test_user_record, 'id' ) === 1001 );
			assert.ok( JSONX.GetObjectValue( test_user_record, '$.user.name' ) === 'Alice' );
			assert.ok( JSONX.GetObjectValue( test_user_record, 'user.name' ) === 'Alice' );
			assert.ok( typeof JSONX.GetObjectValue( test_user_record, '$.foo' ) === 'undefined' );
			assert.ok( JSONX.ShortType( JSONX.GetObjectValue( test_user_record, '$.tags' ) ) === 'a' );
			assert.ok( JSONX.GetObjectValue( test_user_record, '$.tags[0]' ) === 'Staff' );
			assert.ok( JSONX.GetObjectValue( test_user_record, '$.tags[]' ) === 'Staff' );
			assert.ok( typeof JSONX.GetObjectValue( test_user_record, '$.tags[3]' ) === 'undefined' );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'SetObjectValue Tests', () =>
	{
		let data = null;

		it( 'should not set the root value', () => 
		{
			data = {};
			assert.ok( JSONX.SetObjectValue( data, '$', { user: { name: 'Alice' } } ) === false );
		} );

		it( 'should set a value at the top level', () => 
		{
			data = {};
			assert.ok( JSONX.SetObjectValue( data, '$.user', { name: 'Alice' } ) );
			assert.ok( data.user.name === 'Alice' );
		} );

		it( 'should set a value in a nested object', () => 
		{
			data = {};
			assert.ok( JSONX.SetObjectValue( data, '$.user.name', 'Alice' ) );
			assert.ok( data.user.name === 'Alice' );
		} );

		it( 'should set a value in an array', () => 
		{
			data = { role: [ 'user' ] };
			assert.ok( JSONX.SetObjectValue( data, '$.role[0]', 'admin' ) );
			assert.ok( data.role[ 0 ] === 'admin' );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'DeepEquals Tests', () =>
	{

		it( 'should matach literal values', () => 
		{
			assert.ok( JSONX.DeepEquals( true, true ) );
			assert.ok( JSONX.DeepEquals( true, false ) === false );
			assert.ok( JSONX.DeepEquals( 42, 42 ) );
			assert.ok( JSONX.DeepEquals( 42, 3.14 ) === false );
			assert.ok( JSONX.DeepEquals( 'abc', 'abc' ) );
			assert.ok( JSONX.DeepEquals( 'abc', 'abcd' ) === false );
			assert.ok( JSONX.DeepEquals( null, null ) );
			assert.ok( JSONX.DeepEquals( null, 'abcd' ) === false );
			assert.ok( JSONX.DeepEquals( test_user_record, test_user_record ) );
			assert.ok( JSONX.DeepEquals( test_user_record, { user: {} } ) === false );
		} );

	} );


} );
