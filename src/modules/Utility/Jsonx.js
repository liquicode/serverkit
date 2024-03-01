'use strict';

const LIB_TEXT = require( './Text' );

let StandardOperators =
{
	$not: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( expression_type !== 'o' ) { throw new Error( `$not must be followed by an object expression at [${Path}].` ); }
		// Compare
		return !JSONX.Evaluate( Expression, Data, Path );
	},
	$and: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( expression_type !== 'a' ) { throw new Error( `$not must be followed by an array of expressions at [${Path}].` ); }
		// Compare
		for ( let index = 0; index < Expression.length; index++ )
		{
			if ( !JSONX.Evaluate( Expression[ index ], Data, Path ) ) { return false; }
		}
		return true;
	},
	$or: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( expression_type !== 'a' ) { throw new Error( `$or must be followed by an array of expressions at [${Path}].` ); }
		// Compare
		for ( let index = 0; index < Expression.length; index++ )
		{
			if ( JSONX.Evaluate( Expression[ index ], Data, Path ) ) { return true; }
		}
		return false;
	},
	$nor: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( expression_type !== 'a' ) { throw new Error( `$nor must be followed by an array of expressions at [${Path}].` ); }
		// Compare
		for ( let index = 0; index < Expression.length; index++ )
		{
			if ( JSONX.Evaluate( Expression[ index ], Data, Path ) ) { return false; }
		}
		return true;
	},
	$eq: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( 'fu'.includes( expression_type ) ) { throw new Error( `$eq cannot compare with type [${expression_type}] at [${Path}].` ); }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Compare
		return JSONX.DeepEquals( data_value, Expression );
	},
	$ne: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( 'fu'.includes( expression_type ) ) { throw new Error( `$ne cannot compare with type [${expression_type}] at [${Path}].` ); }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Compare
		return !JSONX.DeepEquals( data_value, Expression );
	},
	$gt: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( 'oafu'.includes( expression_type ) ) { throw new Error( `$gt cannot compare with type [${expression_type}] at [${Path}].` ); }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Validate Data Value
		let data_value_type = JSONX.ShortType( data_value );
		if ( typeof Expression !== typeof data_value ) { return false; }
		// Compare
		return ( data_value > Expression );
	},
	$gte: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( 'oafu'.includes( expression_type ) ) { throw new Error( `$gte cannot compare with type [${expression_type}] at [${Path}].` ); }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Validate Data Value
		if ( typeof Expression !== typeof data_value ) { return false; }
		// Compare
		return ( data_value >= Expression );
	},
	$lt: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( 'oafu'.includes( expression_type ) ) { throw new Error( `$lt cannot compare with type [${expression_type}] at [${Path}].` ); }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Validate Data Value
		if ( typeof Expression !== typeof data_value ) { return false; }
		// Compare
		return ( data_value < Expression );
	},
	$lte: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( 'oafu'.includes( expression_type ) ) { throw new Error( `$lte cannot compare with type [${expression_type}] at [${Path}].` ); }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Validate Data Value
		if ( typeof Expression !== typeof data_value ) { return false; }
		// Compare
		return ( data_value <= Expression );
	},
	$in: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( 'ofu'.includes( expression_type ) ) { throw new Error( `$in cannot compare with type [${expression_type}] at [${Path}].` ); }
		if ( expression_type !== 'a' ) { Expression = [ Expression ]; }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Validate Data Value
		let data_value_type = JSONX.ShortType( data_value );
		if ( 'ofu'.includes( data_value_type ) ) { return false; }
		if ( data_value_type !== 'a' ) { data_value = [ data_value ]; }
		// Compare
		for ( let index = 0; index < data_value.length; index++ )
		{
			if ( !Expression.includes( data_value[ index ] ) ) { return false; }
		}
		return true;
	},
	$nin: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( 'ofu'.includes( expression_type ) ) { throw new Error( `$in cannot compare with type [${expression_type}] at [${Path}].` ); }
		if ( expression_type !== 'a' ) { Expression = [ Expression ]; }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Validate Data Value
		let data_value_type = JSONX.ShortType( data_value );
		if ( 'ofu'.includes( data_value_type ) ) { return false; }
		if ( data_value_type !== 'a' ) { data_value = [ data_value ]; }
		// Compare
		for ( let index = 0; index < data_value.length; index++ )
		{
			if ( Expression.includes( data_value[ index ] ) ) { return false; }
		}
		return true;
	},
	$exists: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( expression_type !== 'b' ) { throw new Error( `$exists cannot compare with type [${expression_type}] at [${Path}].` ); }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Compare
		if ( typeof data_value !== 'undefined' )
		{
			return ( Expression === true );
		}
		else
		{
			return ( Expression === false );
		}
	},
	$type: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( expression_type !== 's' ) { throw new Error( `$size cannot compare with type [${expression_type}] at [${Path}].` ); }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Compare
		if ( Expression.length === 1 )
		{
			return ( JSONX.ShortType( data_value ) === Expression );
		}
		else
		{
			return ( typeof data_value === Expression );
		}
	},
	$size: function ( JSONX, Expression, Data, Path )
	{
		// Validate Expression
		let expression_type = JSONX.ShortType( Expression );
		if ( expression_type !== 'n' ) { throw new Error( `$size cannot compare with type [${expression_type}] at [${Path}].` ); }
		// Get Data Value
		let data_value = JSONX.GetObjectValue( Data, Path );
		// Validate Data Value
		let data_value_type = JSONX.ShortType( data_value );
		if ( data_value_type !== 'a' ) { return false; }
		// Compare
		return ( data_value.length === Expression );
	},
};


module.exports = function ( UseOperators )
{
	if ( typeof UseOperators !== 'object' ) { UseOperators = StandardOperators; }
	let jsonx =
	{


		//---------------------------------------------------------------------
		Operators: UseOperators,


		//---------------------------------------------------------------------
		Evaluate: function ( Expression, Data, Path = '$' )
		{
			let expression_type = this.ShortType( Expression );
			if ( expression_type === 'a' )
			{
				// Perform implicit $and.
				return this.Evaluate( { $and: Expression }, Data, Path );
			}
			if ( expression_type === 'o' )
			{
				for ( let key in Expression )
				{
					if ( typeof this.Operators[ key ] === 'function' )
					{
						// Evaluate operator.
						let value = this.Operators[ key ]( this, Expression[ key ], Data, Path );
						if ( value === false ) { return false; }
					}
					else
					{
						// Check for flattened namespace.
						let key_path = Path;
						let key_parts = key.split( '.' );
						for ( let index = 0; index < key_parts.length; index++ )
						{
							if ( key_parts[ index ] === '' ) { continue; }
							key_path = `${key_path}.${key_parts[ index ]}`;
						}
						// Evaluate.
						let term_type = this.ShortType( Expression[ key ] );
						if ( term_type === 'o' )
						{
							// Recursive evaluation.
							let value = this.Evaluate( Expression[ key ], Data, key_path );
							if ( value === false ) { return false; }
						}
						else
						{
							// Perform implicit $eq.
							let value = this.Operators.$eq( this, Expression[ key ], Data, key_path );
							if ( value === false ) { return false; }
						}
					}
				}
				return true;
			}
			return false;
		},


		//---------------------------------------------------------------------
		MergeObjects: function ( ObjectA, ObjectB )
		{
			let merged_object = JSON.parse( JSON.stringify( ObjectA ) );

			function update_children( ParentA, ParentB )
			{
				Object.keys( ParentB ).forEach( key =>
				{
					let value = ParentB[ key ];
					if ( ParentA[ key ] === undefined )
					{
						ParentA[ key ] = JSON.parse( JSON.stringify( value ) );
					}
					else
					{
						if ( typeof value === 'object' )
						{
							// Merge objects.
							if ( ( ParentA[ key ] === null ) && ( value === null ) )
							{
								// Do nothing.
							}
							else if ( ( ParentA[ key ] !== null ) && ( value === null ) )
							{
								ParentA[ key ] = null;
							}
							else if ( ( ParentA[ key ] === null ) && ( value !== null ) )
							{
								ParentA[ key ] = {};
								update_children( ParentA[ key ], value );
							}
							else if ( ( ParentA[ key ] !== null ) && ( value !== null ) )
							{
								update_children( ParentA[ key ], value );
							}
						}
						else
						{
							// Overwrite values.
							ParentA[ key ] = JSON.parse( JSON.stringify( value ) );
						}
					}
				} );
			}

			update_children( merged_object, ObjectB );
			return merged_object;
		},


		//---------------------------------------------------------------------
		ShortType: function ( Data ) // bnsloafu
		{
			if ( typeof Data === 'boolean' ) { return 'b'; }
			if ( typeof Data === 'number' ) { return 'n'; }
			if ( typeof Data === 'string' ) { return 's'; }
			if ( typeof Data === 'object' ) 
			{
				if ( Data === null ) { return 'l'; }
				if ( !Array.isArray( Data ) ) { return 'o'; }
				else { return 'a'; }
			}
			if ( typeof Data === 'function' ) { return 'f'; }
			if ( typeof Data === 'undefined' ) { return 'u'; }
			throw new Error( `Unsupported field type [${typeof Data}].` );
		},


		//---------------------------------------------------------------------
		GetObjectValue: function ( Data, Path )
		{
			if ( ( typeof Path === 'undefined' ) || ( Path === null ) || !Path.length ) { return Data; }
			let data_type = this.ShortType( Data );
			if ( 'lu'.includes( data_type ) ) { return; }

			// Get the current name.
			let name = LIB_TEXT.FindBetween( Path, null, '.' );
			if ( name === null ) { name = Path; }
			Path = LIB_TEXT.FindBetween( Path, '.', null );

			// Check for an array reference.
			let array_index = LIB_TEXT.FindBetween( name, '[', ']' );
			if ( array_index !== null ) 
			{
				array_index = Number( array_index );
				if ( array_index === NaN ) { return; }
				name = LIB_TEXT.FindBetween( name, null, '[' );
			}

			// Get sub-object if not at root.
			if ( name !== '$' )
			{
				if ( data_type !== 'o' ) { return; }
				Data = Data[ name ];
			}

			// Get the element of the array.
			if ( array_index !== null ) 
			{
				if ( this.ShortType( Data ) !== 'a' ) { return; }
				Data = Data[ array_index ];
			}

			// Return the next object in the path.
			return this.GetObjectValue( Data, Path );
		},


		//---------------------------------------------------------------------
		SetObjectValue: function ( Data, Path, Value )
		{
			let path_elements = Path.split( '.' );
			if ( path_elements.length && ( path_elements[ 0 ] === '$' ) ) { path_elements.splice( 0, 1 ); }
			let current_path = '$';
			let node = Data;
			for ( let index = 0; index < path_elements.length; index++ )
			{
				let name = path_elements[ index ];
				if ( name === '' ) { continue; }

				// Check for an array reference.
				let array_index = LIB_TEXT.FindBetween( name, '[', ']' );
				if ( array_index !== null ) 
				{
					array_index = Number( array_index );
					if ( array_index === NaN ) { return; }
					name = LIB_TEXT.FindBetween( name, null, '[' );
				}

				// if ( this.ShortType( node ) !== 'o' ) { throw new Error( `SetObjectValue: The path [${current_path}] already exists but is not an object.` ); }
				if ( index === ( path_elements.length - 1 ) )
				{
					if ( array_index !== null ) 
					{
						if ( this.ShortType( node[ name ] ) !== 'a' ) { return false; }
						node[ name ][ array_index ] = JSON.parse( JSON.stringify( Value ) );
					}
					else
					{
						node[ name ] = JSON.parse( JSON.stringify( Value ) );
					}
					return true;
				}

				// Get the sub object.
				if ( typeof node[ name ] === 'undefined' ) { node[ name ] = {}; }
				node = node[ name ];

				// Get the element of the array.
				if ( array_index !== null ) 
				{
					if ( this.ShortType( node ) !== 'a' ) { return false; }
					node = node[ array_index ];
				}
			}
			return false;
		},


		//---------------------------------------------------------------------
		DeepEquals: function ( A, B )
		{
			let type = typeof A;
			if ( type !== typeof B ) { return false; }
			if ( type === 'boolean' ) { return A === B; }
			if ( type === 'number' ) { return A === B; }
			if ( type === 'string' ) { return A === B; }
			if ( type === 'object' )
			{
				if ( A === null ) { return B === null; }
				if ( Array.isArray( A ) )
				{
					if ( !Array.isArray( B ) ) { return false; }
					if ( A.length !== B.length ) { return false; }
					for ( let index = 0; index < A.length; index++ )
					{
						if ( !this.DeepEquals( A[ index ], B[ index ] ) ) { return false; }
					}
					return true;
				}
				else
				{
					if ( Object.keys( A ).length !== Object.keys( B ).length ) { return false; }
					for ( let key in A )
					{
						if ( typeof B[ key ] === 'undefined' ) { return false; }
						if ( !this.DeepEquals( A[ key ], B[ key ] ) ) { return false; }
					}
					return true;
				}
			}
			else throw new Error( `Unsupported evaluation type [${type}].` );
		},


	};
	return jsonx;
};
