
const assert = require( 'assert' );
const JSONX = require( '../src/modules/Utility/Jsonx' )();


describe( '021) Jsonx Evaluate Tests', () =>
{


	//---------------------------------------------------------------------
	describe( 'Equality Operator Tests', () =>
	{

		it( 'should match boolean values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: { $eq: true } }, { value: true } ) );
			assert.ok( JSONX.Evaluate( { value: { $eq: false } }, { value: false } ) );
			// $ne
			assert.ok( JSONX.Evaluate( { value: { $ne: true } }, { value: false } ) );
			assert.ok( JSONX.Evaluate( { value: { $ne: false } }, { value: true } ) );
		} );

		it( 'should match number values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: { $eq: 42 } }, { value: 42 } ) );
			assert.ok( JSONX.Evaluate( { value: { $eq: 42 } }, { value: 42.0 } ) );
			assert.ok( JSONX.Evaluate( { value: { $eq: 42.0 } }, { value: 42 } ) );
			// $ne
			assert.ok( JSONX.Evaluate( { value: { $ne: 42.1 } }, { value: 42 } ) );
			assert.ok( JSONX.Evaluate( { value: { $ne: 42 } }, { value: 42.1 } ) );
		} );

		it( 'should match string values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: { $eq: '' } }, { value: '' } ) );
			assert.ok( JSONX.Evaluate( { value: { $eq: 'abc' } }, { value: 'abc' } ) );
			// $ne
			assert.ok( JSONX.Evaluate( { value: { $ne: '' } }, { value: 'abc' } ) );
			assert.ok( JSONX.Evaluate( { value: { $ne: 'ab' } }, { value: 'abc' } ) );
			assert.ok( JSONX.Evaluate( { value: { $ne: 'abcd' } }, { value: 'abc' } ) );
		} );

		it( 'should match null values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: { $eq: null } }, { value: null } ) );
			// *** Strict comparison requires that both terms be of the same type.
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $eq: null } }, { value: false } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $eq: null } }, { value: 0 } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $eq: null } }, { value: '' } ) );
			// $ne
			// *** Strict comparison requires that both terms be of the same type.
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $ne: false } }, { value: null } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $ne: 0 } }, { value: null } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $ne: '' } }, { value: null } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $ne: null } }, { value: false } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $ne: null } }, { value: 0 } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $ne: null } }, { value: '' } ) );
		} );

		it( 'should match object values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: { $eq: { n: 42 } } }, { value: { n: 42 } } ) );
			// $ne
			assert.ok( JSONX.Evaluate( { value: { $ne: { n: 42.1 } } }, { value: { n: 42 } } ) );
			assert.ok( JSONX.Evaluate( { value: { $ne: { n: 42 } } }, { value: { n: 42, s: 'abc' } } ) );
		} );

		it( 'should match array values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: { $eq: [] } }, { value: [] } ) );
			assert.ok( JSONX.Evaluate( { value: { $eq: [ 1 ] } }, { value: [ 1 ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $eq: [ 1, 2, 3 ] } }, { value: [ 1, 2, 3 ] } ) );
			// $ne
			assert.ok( JSONX.Evaluate( { value: { $ne: [] } }, { value: [ 1, 2, 3 ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $ne: [ 1 ] } }, { value: [ 1, 2, 3 ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $ne: [ 1, 2, 3 ] } }, { value: [] } ) );
			assert.ok( JSONX.Evaluate( { value: { $ne: [ 1, 2, 3 ] } }, { value: [ 1 ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $ne: [ 3, 2, 1 ] } }, { value: [ 1, 2, 3 ] } ) );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'Implicit Equality Tests', () =>
	{

		it( 'should match boolean values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: true }, { value: true } ) );
			assert.ok( JSONX.Evaluate( { value: false }, { value: false } ) );
			// $ne
			assert.ok( !JSONX.Evaluate( { value: true }, { value: false } ) );
			assert.ok( !JSONX.Evaluate( { value: false }, { value: true } ) );
		} );

		it( 'should match number values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: 42 }, { value: 42 } ) );
			assert.ok( JSONX.Evaluate( { value: 42 }, { value: 42.0 } ) );
			assert.ok( JSONX.Evaluate( { value: 42.0 }, { value: 42 } ) );
			// $ne
			assert.ok( !JSONX.Evaluate( { value: 42.1 }, { value: 42 } ) );
			assert.ok( !JSONX.Evaluate( { value: 42 }, { value: 42.1 } ) );
		} );

		it( 'should match string values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: '' }, { value: '' } ) );
			assert.ok( JSONX.Evaluate( { value: 'abc' }, { value: 'abc' } ) );
			// $ne
			assert.ok( !JSONX.Evaluate( { value: '' }, { value: 'abc' } ) );
			assert.ok( !JSONX.Evaluate( { value: 'ab' }, { value: 'abc' } ) );
			assert.ok( !JSONX.Evaluate( { value: 'abcd' }, { value: 'abc' } ) );
		} );

		it( 'should match null values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: null }, { value: null } ) );
			// $ne
			// *** Strict comparison requires that both terms be of the same type.
			// assert.ok( !LIB_MONGO_QUERY.Evaluate( { value: '' }, { value: null } ) );
			// assert.ok( !LIB_MONGO_QUERY.Evaluate( { value: null }, { value: '' } ) );
			// assert.ok( !LIB_MONGO_QUERY.Evaluate( { value: 0 }, { value: null } ) );
			// assert.ok( !LIB_MONGO_QUERY.Evaluate( { value: null }, { value: 0 } ) );
			// assert.ok( !LIB_MONGO_QUERY.Evaluate( { value: !null }, { value: null } ) );
		} );

		it( 'should not match object values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: { n: 42 } }, { value: { n: 42 } } ) );
			assert.ok( JSONX.Evaluate( { value: { n: 42 } }, { value: { n: 42, s: 'abc' } } ) );
			// $ne
			assert.ok( !JSONX.Evaluate( { value: { n: 42.1 } }, { value: { n: 42 } } ) );
			assert.ok( !JSONX.Evaluate( { value: { n: 42.1 } }, { value: { n: 42, s: 'abc' } } ) );
		} );

		it( 'should match array values', () => 
		{
			// $eq
			assert.ok( JSONX.Evaluate( { value: [] }, { value: [] } ) );
			assert.ok( JSONX.Evaluate( { value: [ 1 ] }, { value: [ 1 ] } ) );
			assert.ok( JSONX.Evaluate( { value: [ 1, 2, 3 ] }, { value: [ 1, 2, 3 ] } ) );
			// $ne
			assert.ok( !JSONX.Evaluate( { value: [] }, { value: [ 1, 2, 3 ] } ) );
			assert.ok( !JSONX.Evaluate( { value: [ 1 ] }, { value: [ 1, 2, 3 ] } ) );
			assert.ok( !JSONX.Evaluate( { value: [ 1, 2, 3 ] }, { value: [] } ) );
			assert.ok( !JSONX.Evaluate( { value: [ 1, 2, 3 ] }, { value: [ 1 ] } ) );
			assert.ok( !JSONX.Evaluate( { value: [ 3, 2, 1 ] }, { value: [ 1, 2, 3 ] } ) );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'Comparison Operator Tests', () =>
	{

		it( 'should compare boolean values', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $gt: false } }, { value: true } ) );
			assert.ok( JSONX.Evaluate( { value: { $gte: false } }, { value: true } ) );
			assert.ok( JSONX.Evaluate( { value: { $gte: false } }, { value: false } ) );
			assert.ok( JSONX.Evaluate( { value: { $lt: true } }, { value: false } ) );
			assert.ok( JSONX.Evaluate( { value: { $lte: true } }, { value: false } ) );
			assert.ok( JSONX.Evaluate( { value: { $lte: true } }, { value: true } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $gt: false } }, { value: false } ) );
			assert.ok( !JSONX.Evaluate( { value: { $lt: false } }, { value: true } ) );
		} );

		it( 'should match number values', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $gt: 42 } }, { value: 42.1 } ) );
			assert.ok( JSONX.Evaluate( { value: { $gte: 42 } }, { value: 42.0 } ) );
			assert.ok( JSONX.Evaluate( { value: { $lt: 42 } }, { value: 41.99 } ) );
			assert.ok( JSONX.Evaluate( { value: { $lte: 42 } }, { value: 42.0 } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $gt: 42 } }, { value: 42 } ) );
			assert.ok( !JSONX.Evaluate( { value: { $gte: 42 } }, { value: 41.99 } ) );
			assert.ok( !JSONX.Evaluate( { value: { $lt: 42 } }, { value: 42 } ) );
			assert.ok( !JSONX.Evaluate( { value: { $lte: 42 } }, { value: 42.1 } ) );
		} );

		it( 'should match string values', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $gt: 'abc' } }, { value: 'abcd' } ) );
			assert.ok( JSONX.Evaluate( { value: { $gt: '' } }, { value: 'abc' } ) );
			assert.ok( JSONX.Evaluate( { value: { $gte: 'abc' } }, { value: 'abcd' } ) );
			assert.ok( JSONX.Evaluate( { value: { $gte: 'abc' } }, { value: 'abc' } ) );
			assert.ok( JSONX.Evaluate( { value: { $gte: '' } }, { value: 'abc' } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $gt: 'abcd' } }, { value: 'abc' } ) );
			assert.ok( !JSONX.Evaluate( { value: { $gt: 'abc' } }, { value: '' } ) );
			assert.ok( !JSONX.Evaluate( { value: { $gt: 'abc' } }, { value: 'abc' } ) );
			assert.ok( !JSONX.Evaluate( { value: { $gte: 'abcd' } }, { value: 'abc' } ) );
			assert.ok( !JSONX.Evaluate( { value: { $gte: 'abc' } }, { value: '' } ) );
		} );

		it( 'should match null values', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $gte: null } }, { value: null } ) );
			assert.ok( JSONX.Evaluate( { value: { $lte: null } }, { value: null } ) );
			// *** Strict comparison requires that both terms be of the same type.
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $gt: null } }, { value: true } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $gt: null } }, { value: 42 } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $gt: null } }, { value: 'abc' } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $gte: null } }, { value: false } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $gte: null } }, { value: true } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $gte: null } }, { value: 0 } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $gte: null } }, { value: 42 } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $gte: null } }, { value: '' } ) );
			// assert.ok( LIB_MONGO_QUERY.Evaluate( { value: { $gte: null } }, { value: 'abc' } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $gt: null } }, { value: null } ) );
			assert.ok( !JSONX.Evaluate( { value: { $lt: null } }, { value: null } ) );
			// *** Strict comparison requires that both terms be of the same type.
			// assert.ok( !LIB_MONGO_QUERY.Evaluate( { value: { $gt: false } }, { value: null } ) );
			// assert.ok( !LIB_MONGO_QUERY.Evaluate( { value: { $gt: 42 } }, { value: null } ) );
			// assert.ok( !LIB_MONGO_QUERY.Evaluate( { value: { $gt: '' } }, { value: null } ) );
			// assert.ok( !LIB_MONGO_QUERY.Evaluate( { value: { $gte: null } }, { value: null } ) );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'Array Operator Tests', () =>
	{

		it( 'should find a single value in an array', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: null } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: true } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: 'two' } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: 3 } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: false } ) );
			assert.ok( !JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: '' } ) );
			assert.ok( !JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: 0 } ) );
		} );

		it( 'should find multiple values in an array', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ null ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ null, true ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ null, true, 'two' ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ null, true, 'two', 3 ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ true, null ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ 'two', true, null ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ 3, 'two', true, null ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ 3, null ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ null, null ] } ) );
			// fail
			assert.ok( JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ false ] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ false, 'three' ] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $in: [ null, true, 'two', 3 ] } }, { value: [ false, 'three', 4 ] } ) );
		} );

		it( 'should not find a single value in an array', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $nin: [ true, 'two', 3 ] } }, { value: null } ) );
			assert.ok( JSONX.Evaluate( { value: { $nin: [ null, 'two', 3 ] } }, { value: true } ) );
			assert.ok( JSONX.Evaluate( { value: { $nin: [ null, true, 3 ] } }, { value: 'two' } ) );
			assert.ok( JSONX.Evaluate( { value: { $nin: [ null, true, 'two' ] } }, { value: 3 } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: null } ) );
			assert.ok( !JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: true } ) );
			assert.ok( !JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: 'two' } ) );
			assert.ok( !JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: 3 } ) );
		} );

		it( 'should not find multiple values in an array', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: [] } ) );
			assert.ok( JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: [ false ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: [ false, 'three' ] } ) );
			assert.ok( JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: [ false, 'three', 4 ] } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: [ null, true ] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: [ null, true, 'two' ] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $nin: [ null, true, 'two', 3 ] } }, { value: [ null, true, 'two', 3 ] } ) );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'Meta Operators Tests', () =>
	{

		it( 'should match field $exists', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $exists: true } }, { value: 42 } ) );
			assert.ok( JSONX.Evaluate( { value: { $exists: false } }, { foo: 42 } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $exists: true } }, { foo: 42 } ) );
			assert.ok( !JSONX.Evaluate( { value: { $exists: false } }, { value: 42 } ) );
		} );

		it( 'should match field $type', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $type: 'boolean' } }, { value: true } ) );
			assert.ok( JSONX.Evaluate( { value: { $type: 'number' } }, { value: 42 } ) );
			assert.ok( JSONX.Evaluate( { value: { $type: 'string' } }, { value: 'abc' } ) );
			assert.ok( JSONX.Evaluate( { value: { $type: 'object' } }, { value: { foo: 'bar' } } ) );
			assert.ok( JSONX.Evaluate( { value: { $type: 'object' } }, { value: [ 1, 2, 3 ] } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $type: 'boolean' } }, { value: 42 } ) );
			assert.ok( !JSONX.Evaluate( { value: { $type: 'number' } }, { value: true } ) );
			assert.ok( !JSONX.Evaluate( { value: { $type: 'string' } }, { value: [ 1, 2, 3 ] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $type: 'number' } }, { value: [ 1, 2, 3 ] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $type: 'number' } }, { value: { foo: 'bar' } } ) );
		} );

		it( 'should match field $type (short type)', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $type: 'b' } }, { value: true } ) );
			assert.ok( JSONX.Evaluate( { value: { $type: 'n' } }, { value: 42 } ) );
			assert.ok( JSONX.Evaluate( { value: { $type: 's' } }, { value: 'abc' } ) );
			assert.ok( JSONX.Evaluate( { value: { $type: 'l' } }, { value: null } ) );
			assert.ok( JSONX.Evaluate( { value: { $type: 'o' } }, { value: { foo: 'bar' } } ) );
			assert.ok( JSONX.Evaluate( { value: { $type: 'a' } }, { value: [ 1, 2, 3 ] } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $type: 'b' } }, { value: 42 } ) );
			assert.ok( !JSONX.Evaluate( { value: { $type: 'n' } }, { value: true } ) );
			assert.ok( !JSONX.Evaluate( { value: { $type: 's' } }, { value: [ 1, 2, 3 ] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $type: 'l' } }, { value: [ 1, 2, 3 ] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $type: 'o' } }, { value: [ 1, 2, 3 ] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $type: 'a' } }, { value: { foo: 'bar' } } ) );
		} );

		it( 'should match field $size', () => 
		{
			// pass
			assert.ok( JSONX.Evaluate( { value: { $size: 0 } }, { value: [] } ) );
			assert.ok( JSONX.Evaluate( { value: { $size: 3 } }, { value: [ 1, 2, 3 ] } ) );
			// fail
			assert.ok( !JSONX.Evaluate( { value: { $size: 1 } }, { value: [] } ) );
			assert.ok( !JSONX.Evaluate( { value: { $size: 2 } }, { value: [ 1, 2, 3 ] } ) );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'Math Operators Tests', () =>
	{
	} );


	//---------------------------------------------------------------------
	describe( 'Nested Field Tests', () =>
	{

		it( 'should process nested fields', () => 
		{
			assert.ok( JSONX.Evaluate( { user: { name: 'Alice' } }, { user: { name: 'Alice' } } ) );
			assert.ok( JSONX.Evaluate( { user: { name: { $eq: 'Alice' } } }, { user: { name: 'Alice' } } ) );
			assert.ok( JSONX.Evaluate( { user: { name: { $in: [ 'Alice', 'Bob', 'Eve' ] } } }, { user: { name: 'Alice' } } ) );
			assert.ok( JSONX.Evaluate( { user: { name: { $exists: true } } }, { user: { name: 'Alice' } } ) );
		} );

		it( 'should process flattened field paths', () => 
		{
			assert.ok( JSONX.Evaluate( { 'user.name': 'Alice' }, { user: { name: 'Alice' } } ) );
			assert.ok( JSONX.Evaluate( { 'user.name': { $eq: 'Alice' } }, { user: { name: 'Alice' } } ) );
			assert.ok( JSONX.Evaluate( { 'user.name': { $in: [ 'Alice', 'Bob', 'Eve' ] } }, { user: { name: 'Alice' } } ) );
			assert.ok( JSONX.Evaluate( { 'user.name': { $exists: true } }, { user: { name: 'Alice' } } ) );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'Negation Operator Tests', () =>
	{

		it( 'should process $not', () => 
		{
			assert.ok( JSONX.Evaluate( { $not: { user: { name: 'Eve' } } }, { user: { name: 'Alice' } } ) );
			assert.ok( JSONX.Evaluate( { user: { $not: { name: 'Eve' } } }, { user: { name: 'Alice' } } ) );
			assert.ok( JSONX.Evaluate( { user: { name: { $not: { $in: [ 'Bob', 'Eve' ] } } } }, { user: { name: 'Alice' } } ) );
			assert.ok( JSONX.Evaluate( { user: { role: { $not: { $exists: true } } } }, { user: { name: 'Alice' } } ) );
		} );

	} );


	//---------------------------------------------------------------------
	describe( 'Logical Operators Tests', () =>
	{
		let data =
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

		it( 'should process $and', () => 
		{
			assert.ok( JSONX.Evaluate(
				{
					$and:
						[
							{ user: { name: { $eq: 'Alice' } } },
							{ id: { $gte: 1000 } },
							{ tags: { $size: 2 } },
						]
				}
				, data ) );
		} );

		it( 'should process implicit $and when given an array', () => 
		{
			assert.ok( JSONX.Evaluate(
				[
					{ user: { name: { $eq: 'Alice' } } },
					{ id: { $gte: 1000 } },
					{ tags: { $size: 2 } },
				]
				, data ) );
		} );

		it( 'should process all terms of $and', () => 
		{
			assert.ok( !JSONX.Evaluate(
				{
					$and:
						[
							{ user: { name: { $eq: 'Alice' } } },
							{ id: { $eq: null } },
							{ tags: { $size: 2 } },
						]
				}
				, data ) );
		} );

		it( 'should process $and with implicit $eq', () => 
		{
			assert.ok( JSONX.Evaluate(
				{
					$and:
						[
							{ user: { name: 'Alice' } },
							{ id: { $gte: 1000 } },
							{ tags: { $size: 2 } },
						]
				}
				, data ) );
		} );

		it( 'should process $and with flattened path', () => 
		{
			assert.ok( JSONX.Evaluate(
				{
					$and:
						[
							{ 'user.name': 'Alice' },
							{ id: { $gte: 1000 } },
							{ tags: { $size: 2 } },
						]
				}
				, data ) );
		} );

		it( 'should process $or', () => 
		{
			assert.ok( JSONX.Evaluate(
				{
					$or:
						[
							{ user: { name: { $eq: 'Eve' } } },
							{ id: { $eq: null } },
							{ tags: { $size: 2 } },
						]
				}
				, data ) );
		} );

		it( 'should process all terms of $or', () => 
		{
			assert.ok( !JSONX.Evaluate(
				{
					$or:
						[
							{ user: { name: { $eq: 'Eve' } } },
							{ id: { $eq: null } },
							{ tags: { $size: 0 } },
						]
				}
				, data ) );
		} );

		it( 'should process $nor', () => 
		{
			assert.ok( JSONX.Evaluate(
				{
					$nor:
						[
							{ user: { name: { $eq: 'Eve' } } },
							{ id: { $eq: null } },
							{ tags: { $size: 0 } },
						]
				}
				, data ) );
		} );

		it( 'should process all terms of $or', () => 
		{
			assert.ok( !JSONX.Evaluate(
				{
					$nor:
						[
							{ user: { name: { $eq: 'Eve' } } },
							{ id: { $eq: null } },
							{ tags: { $size: 2 } },
						]
				}
				, data ) );
		} );

	} );


} );
