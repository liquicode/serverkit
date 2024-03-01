"use strict";


//=====================================================================
//=====================================================================
//
//		lib-utility
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_HTTP = require( 'http' );
const LIB_HTTPS = require( 'https' );

const LIB_JSON = require( '@liquicode/lib-json' );
const LIB_TEXT = require( './Utility/Text' );
const LIB_JSONX = require( './Utility/Jsonx' );

require( 'babel-polyfill' );
const LIB_JSON_CRITERIA = require( 'json-criteria' );
const LIB_AXIOS = require( 'axios' );

const SRC_SERVER_MODULE = require( LIB_PATH.resolve( __dirname, '..', 'core', 'ServerModule.js' ) );


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{
		let server_module = SRC_SERVER_MODULE.NewServerModule(
			Server, 'module',
			{
				name: 'Utility',
			},
			{
			},
		);

		server_module.clone = clone;
		server_module.sleep = sleep;
		server_module.random = random;
		server_module.unique_id = unique_id;

		server_module.read_json_file = read_json_file;
		server_module.write_json_file = write_json_file;
		server_module.json_parse = json_parse;
		server_module.json_stringify = json_stringify;
		server_module.json_test = json_test;

		server_module.replace_all = replace_all;

		server_module.is_undefined = is_undefined;
		server_module.assign_if_defined = assign_if_defined;
		server_module.value_missing_null_empty = value_missing_null_empty;
		server_module.value_exists = value_exists;
		server_module.has_value = has_value;
		server_module.missing_parameter_error = missing_parameter_error;

		server_module.merge_objects = merge_objects;
		server_module.map_to_value_array = map_to_value_array;

		server_module.format_timestamp = format_timestamp;
		server_module.string_compare = string_compare;
		server_module.zulu_timestamp = zulu_timestamp;

		server_module.async_request = async_request;
		server_module.async_make_get_request = async_make_get_request;
		server_module.async_download_file = async_download_file;

		server_module.get_safe_filename = get_safe_filename;
		server_module.invalid_parameter_value_message = invalid_parameter_value_message;

		server_module.get_first_word = get_first_word;
		server_module.get_after_first_word = get_after_first_word;
		server_module.get_last_word = get_last_word;
		server_module.get_before_last_word = get_before_last_word;

		server_module.copy_folder_recurse = copy_folder_recurse;
		server_module.delete_folder_recurse = delete_folder_recurse;
		server_module.count_files_recurse = count_files_recurse;

		return server_module;
	};


//=====================================================================
//=====================================================================
//
//		Module Exports
//
//=====================================================================
//=====================================================================


//---------------------------------------------------------------------
// exports.clone = clone;
// exports.sleep = sleep;
// exports.random = random;
// exports.unique_id = unique_id;

// exports.read_json_file = read_json_file;
// exports.write_json_file = write_json_file;
// exports.json_parse = json_parse;
// exports.json_stringify = json_stringify;

// exports.replace_all = replace_all;

// exports.is_undefined = is_undefined;
// exports.assign_if_defined = assign_if_defined;
// exports.value_missing_null_empty = value_missing_null_empty;
// exports.value_exists = value_exists;
// exports.has_value = has_value;
// exports.missing_parameter_error = missing_parameter_error;

// exports.merge_objects = merge_objects;
// exports.map_to_value_array = map_to_value_array;

// exports.format_timestamp = format_timestamp;
// exports.string_compare = string_compare;
// exports.zulu_timestamp = zulu_timestamp;

// exports.async_request = async_request;
// exports.async_make_get_request = async_make_get_request;
// exports.async_download_file = async_download_file;

// exports.get_safe_filename = get_safe_filename;
// exports.invalid_parameter_value_message = invalid_parameter_value_message;

// exports.get_first_word = get_first_word;
// exports.get_after_first_word = get_after_first_word;
// exports.get_last_word = get_last_word;
// exports.get_before_last_word = get_before_last_word;

// exports.copy_folder_recurse = copy_folder_recurse;
// exports.delete_folder_recurse = delete_folder_recurse;
// exports.count_files_recurse = count_files_recurse;


//---------------------------------------------------------------------
function clone( Value )
{
	return JSON.parse( JSON.stringify( Value ) );
};


//---------------------------------------------------------------------
async function sleep( Milliseconds )
{
	return new Promise( resolve => setTimeout( resolve, Milliseconds ) );
};


//---------------------------------------------------------------------
function random( Min, Max )
{
	let range = ( Max - Min ) + 1;
	return Math.floor( ( Math.random() * range ) + Min );
};


//---------------------------------------------------------------------
function unique_id( Size = 12 )
{
	let alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890';
	let alphabet_1st = 'abcdefghijklmnopqrstuvwxyz';
	let result = '';
	for ( let index = 0; index < Size; index++ )
	{
		// ALERT: LIB_CRYPTO.randomInt requires Node v14.10.0, v12.19.0
		if ( index === 0 )
		{
			// Make sure the 1st character of the ID is non-numeric.
			result += alphabet_1st[ LIB_CRYPTO.randomInt( 0, alphabet_1st.length - 1 ) ];
		}
		else
		{
			// Use the entire alphabet for the rest of the ID.
			result += alphabet[ LIB_CRYPTO.randomInt( 0, alphabet.length - 1 ) ];
		}
	}
	return result;
};


//---------------------------------------------------------------------
function read_json_file( Filename )
{
	let json = LIB_FS.readFileSync( Filename, 'utf8' );
	let value = LIB_JSON.Parse( json );
	return value;
};


//---------------------------------------------------------------------
function write_json_file( Filename, Json )
{
	let value = JSON.stringify( Json );
	LIB_FS.mkdirSync( LIB_PATH.dirname( Filename ), { recursive: true } );
	let json = LIB_FS.writeFileSync( Filename, value );
	return;
};


//---------------------------------------------------------------------
function json_parse( StringValue )
{
	//TODO: Use LIB_FS_EXTRA.readJsonSync from a temp file instead.
	// let value = JSON.parse( StringValue );
	let value = LIB_JSON.Parse( StringValue );
	return value;
};


//---------------------------------------------------------------------
function json_stringify( JsonValue, PrettyPrint = 0 )
{
	let text = '';
	if ( PrettyPrint === 0 )
	{
		text = JSON.stringify( JsonValue );
	}
	else if ( PrettyPrint === 1 )
	{
		text = JSON.stringify( JsonValue, null, '  ' );
	}
	else if ( PrettyPrint === 2 )
	{
		text = LIB_JSON.Stringify( JsonValue, LIB_JSON.StringifyOptionsStandard() );
	}
	else if ( PrettyPrint === 3 )
	{
		text = LIB_JSON.Stringify( JsonValue, LIB_JSON.StringifyOptionsVeryPretty() );
	}
	else if ( PrettyPrint === 4 )
	{
		text = LIB_JSON.Tablify( JsonValue );
	}
	return text;
};


//---------------------------------------------------------------------
// let jsonx = LIB_JSONX();
function json_test( Data, Query )
{
	return LIB_JSON_CRITERIA.test( Data, Query );
	// return jsonx.Evaluate( Query, Data );
};


//---------------------------------------------------------------------
function replace_all( Text, Search, Replace )
{
	let new_text = '';
	for ( let index = 0; index < Text.length; index++ )
	{
		let char = Text[ index ];
		if ( Search.indexOf( char ) >= 0 )
		{
			char = Replace;
		}
		new_text += char;
	}
	return new_text;
};


//---------------------------------------------------------------------
function is_undefined( Value )
{
	return ( typeof Value === 'undefined' );
};


//---------------------------------------------------------------------
function assign_if_defined( Value, Default )
{
	if ( typeof Value === 'undefined' ) { return Default; }
	return Value;
};


//---------------------------------------------------------------------
function value_missing_null_empty( Value )
{
	if ( Value === null ) { return true; }
	switch ( typeof Value )
	{
		case 'undefined':
			return true;
		case 'string':
			if ( Value.length === 0 ) { return true; }
		case 'object':
			if ( Value === null ) { return true; }
			if ( Object.keys( Value ).length === 0 ) { return true; }
			break;
	}
	return false;
};


//---------------------------------------------------------------------
function value_exists( Value )
{
	return !value_missing_null_empty( Value );
};


//---------------------------------------------------------------------
function has_value( Value )
{
	if ( Value === undefined ) { return false; }
	if ( Value === null ) { return false; }
	if ( ( typeof Value === 'string' ) && ( Value.length === 0 ) ) { return false; }
	if ( ( typeof Value === 'object' ) && ( Object.keys( Value ).length === 0 ) ) { return false; }
	return true;
}


//---------------------------------------------------------------------
function missing_parameter_error( Name )
{
	return new Error( `Required parameter is missing: ${Name}` );
};


//---------------------------------------------------------------------
function merge_objects( ObjectA, ObjectB )
{
	let C = JSON.parse( JSON.stringify( ObjectA ) );

	function update_children( ParentA, ParentB )
	{
		Object.keys( ParentB ).forEach(
			key =>
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

	update_children( C, ObjectB );
	return C;
};


//---------------------------------------------------------------------
function map_to_value_array( Map )
{
	// Convert from a map to an array of values.
	let values = [];

	// let keys = Object.keys( Map );
	// for ( let index = 0; index < keys.length; index++ )
	// {
	// 	let key = keys[ index ];
	// 	values.push( Command.Fields[ key ] );
	// }

	// values = Map.map( ( key ) => Map[ key ] );

	if ( Array.isArray( Map ) )
	{
		values = JSON.parse( JSON.stringify( Map ) );
	}
	else if ( Map && typeof Map === 'object' )
	{
		// Convert from a map to an array.
		let keys = Object.keys( Map );
		for ( let index = 0; index < keys.length; index++ )
		{
			let key = keys[ index ];
			values.push( Map[ key ] );
		}
		// values = Map.map( ( key ) => JSON.parse( JSON.stringify( Map[ key ] ) ) );
	}

	return values;
}


//---------------------------------------------------------------------
function format_timestamp( timestamp )
{
	try
	{
		let d = new Date( timestamp );
		if ( d.toString() === 'Invalid Date' ) { return ''; }
		let options =
		{
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour12: true,
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'America/New_York',
			timeZoneName: 'short',
		};
		let s = d.toLocaleString( 'en-US', options );
		return s;
	}
	catch ( error ) 
	{
		console.error( error.message, error );
	}
	return '';
};


//---------------------------------------------------------------------
function string_compare( a, b, case_sensitive = true )
{
	try
	{
		if ( typeof a !== 'string' ) { return -1; }
		if ( typeof b !== 'string' ) { return 1; }
		if ( !case_sensitive )
		{
			a = a.toLowerCase();
			b = b.toLowerCase();
		}
		return a.localeCompare( b );
	}
	catch ( error ) 
	{
		console.error( error.message, error );
		return null;
	}
};


//---------------------------------------------------------------------
function zulu_timestamp()
{
	return ( new Date() ).toISOString();
};


//---------------------------------------------------------------------
async function async_request( method, url, data )
{
	return new Promise(
		( resolve, reject ) =>
		{
			LIB_AXIOS( {
				method: method,
				url: url,
				data: data,
				withCredentials: true,
			} )
				.then( function ( response ) { resolve( response ); } )
				.catch( function ( error ) { reject( error ); } );
		} );
}


//---------------------------------------------------------------------
async function async_make_get_request( url )
{
	let http_engine = null;
	if ( url.toLowerCase().startsWith( 'http:' ) ) { http_engine = LIB_HTTP; }
	else if ( url.toLowerCase().startsWith( 'https:' ) ) { http_engine = LIB_HTTPS; }
	else { throw new Error( `Unsupported protocol. Must be http or https.` ); }

	return new Promise(
		( resolve, reject ) =>
		{
			try
			{
				http_engine.get(
					url,
					function ( response ) 
					{
						response.on( 'data', data =>
						{
							resolve( data );
						} );
					} );
			}
			catch ( error )
			{
				reject( error );
			}
		} );
}


//---------------------------------------------------------------------
async function async_download_file( url, filename )
{
	let http_engine = null;
	if ( url.toLowerCase().startsWith( 'http:' ) ) { http_engine = LIB_HTTP; }
	else if ( url.toLowerCase().startsWith( 'https:' ) ) { http_engine = LIB_HTTPS; }
	else { throw new Error( `Unsupported protocol. Must be http or https.` ); }

	return new Promise(
		( resolve, reject ) =>
		{
			try
			{
				http_engine.get(
					url,
					function ( response ) 
					{
						const file_stream = LIB_FS.createWriteStream( filename );
						response.pipe( file_stream );
						file_stream.on(
							'finish',
							function ()
							{
								file_stream.close();
								resolve( true );
							} );
					} );
			}
			catch ( error )
			{
				reject( error );
			}
		} );
}


//---------------------------------------------------------------------
function get_safe_filename( filename, fill_char = '-' )
{
	// System characters.
	filename = filename.replace( '.', fill_char );
	filename = filename.replace( '\\', fill_char );
	filename = filename.replace( '/', fill_char );
	filename = filename.replace( ':', fill_char );
	// Shift + number
	filename = filename.replace( '!', fill_char );
	filename = filename.replace( '@', fill_char );
	filename = filename.replace( '#', fill_char );
	filename = filename.replace( '$', fill_char );
	filename = filename.replace( '%', fill_char );
	filename = filename.replace( '^', fill_char );
	filename = filename.replace( '&', fill_char );
	filename = filename.replace( '*', fill_char );
	// Other restricted characters.
	filename = filename.replace( '+', fill_char );
	filename = filename.replace( '{', fill_char );
	filename = filename.replace( '}', fill_char );
	filename = filename.replace( '<', fill_char );
	filename = filename.replace( '>', fill_char );
	filename = filename.replace( '?', fill_char );
	filename = filename.replace( "'", fill_char );
	filename = filename.replace( '`', fill_char );
	filename = filename.replace( '|', fill_char );
	filename = filename.replace( '=', fill_char );
	// Return the sanitized filename.
	return filename;
}


//---------------------------------------------------------------------
function invalid_parameter_value_message( ParameterName, ParameterValue, Description = '' )
{
	let message = `Invalid value [${ParameterValue}] for parameter '${ParameterName}'.`;
	if ( Description ) { message += ' ' + Description; }
	return message;
}


//---------------------------------------------------------------------
function get_first_word( Phrase, Delimiters )
{
	Delimiters = Delimiters || ' ';
	for ( let index = 0; index < Phrase.length; index++ )
	{
		let ch = Phrase.substr( index, 1 );
		if ( Delimiters.indexOf( ch ) >= 0 )
		{
			return Phrase.substr( 0, index );
		}
	}
	return Phrase;
}


//---------------------------------------------------------------------
function get_after_first_word( Phrase, Delimiters )
{
	Delimiters = Delimiters || ' ';
	for ( let index = 0; index < Phrase.length; index++ )
	{
		let ch = Phrase.substr( index, 1 );
		if ( Delimiters.indexOf( ch ) >= 0 )
		{
			while ( Delimiters.indexOf( ch ) >= 0 )
			{
				index++;
				if ( index >= Phrase.length ) { break; }
				ch = Phrase.substr( index, 1 );
			}
			return Phrase.substr( index );
		}
	}
	return '';
}


//---------------------------------------------------------------------
function get_last_word( Phrase, Delimiters )
{
	Delimiters = Delimiters || ' ';
	for ( let index = Phrase.length - 1; index >= 0; index-- )
	{
		let ch = Phrase.substr( index, 1 );
		if ( Delimiters.indexOf( ch ) >= 0 )
		{
			return Phrase.substr( index + 1 );
		}
	}
	return Phrase;
}


//---------------------------------------------------------------------
function get_before_last_word( Phrase, Delimiters )
{
	Delimiters = Delimiters || ' ';
	for ( let index = Phrase.length - 1; index >= 0; index-- )
	{
		let ch = Phrase.substr( index, 1 );
		if ( Delimiters.indexOf( ch ) >= 0 )
		{
			return Phrase.substr( 0, index );
		}
	}
	return '';
}


//---------------------------------------------------------------------
function count_files_recurse( Folder ) 
{
	if ( !LIB_FS.existsSync( Folder ) ) { return 0; }
	let count = 0;
	let elements = LIB_FS.readdirSync( Folder );
	for ( let element_index = 0; element_index < elements.length; element_index++ )
	{
		let element = elements[ element_index ];
		let from_path = LIB_PATH.join( Folder, element );
		if ( LIB_FS.lstatSync( from_path ).isFile() )
		{
			count++;
		}
		else if ( LIB_FS.lstatSync( from_path ).isDirectory() )
		{
			count += count_files_recurse( from_path );
		}
	}
	return count;
}


//---------------------------------------------------------------------
function copy_folder_recurse( FromFolder, ToFolder, Overwrite ) 
{
	if ( !LIB_FS.existsSync( FromFolder ) ) { return 0; }
	LIB_FS.mkdirSync( ToFolder, { recursive: true } );
	let count = 0;
	let elements = LIB_FS.readdirSync( FromFolder );
	for ( let element_index = 0; element_index < elements.length; element_index++ )
	{
		let element = elements[ element_index ];
		let from_path = LIB_PATH.join( FromFolder, element );
		let to_path = LIB_PATH.join( ToFolder, element );
		if ( LIB_FS.lstatSync( from_path ).isFile() )
		{
			if ( !LIB_FS.existsSync( to_path ) || Overwrite ) 
			{
				LIB_FS.copyFileSync( from_path, to_path );
				count++;
			}
		}
		else if ( LIB_FS.lstatSync( from_path ).isDirectory() )
		{
			count += copy_folder_recurse( from_path, to_path, Overwrite );
		}
	}
	return count;
}


//---------------------------------------------------------------------
function delete_folder_recurse( Folder ) 
{
	if ( !LIB_FS.existsSync( Folder ) ) { return 0; }
	let count = 0;
	let elements = LIB_FS.readdirSync( Folder );
	for ( let element_index = 0; element_index < elements.length; element_index++ )
	{
		let element = elements[ element_index ];
		let from_path = LIB_PATH.join( Folder, element );
		if ( LIB_FS.lstatSync( from_path ).isFile() )
		{
			LIB_FS.unlinkSync( from_path );
			count++;
		}
		else if ( LIB_FS.lstatSync( from_path ).isDirectory() )
		{
			count += delete_folder_recurse( from_path );
		}
	}
	LIB_FS.rmdirSync( Folder );
	return count;
}


