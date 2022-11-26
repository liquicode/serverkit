"use strict";


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_UUID = require( 'uuid' );


//---------------------------------------------------------------------
exports.GetProviderDefaults =
	function GetProviderDefaults()
	{
		let defaults = {};

		let files = LIB_FS.readdirSync( LIB_PATH.join( __dirname ) );
		for ( let index = 0; index < files.length; index++ )
		{
			let filename = files[ index ];
			if ( !filename.endsWith( 'Provider.js' ) ) { continue; }
			try
			{
				let factory = require( LIB_PATH.join( __dirname, filename ) );
				let provider_name = filename.substring( 0, filename.length - 3 );
				defaults[ provider_name ] = factory.ConfigurationDefaults();
			}
			catch ( error )
			{
				console.error( `Error loading storage provider [${filename}]: ${error.message}` );
			}
		}
		return defaults;
	};


//---------------------------------------------------------------------
exports.NewStorage =
	function NewStorage( Server, ProviderName, ProviderSettings )
	{
		let storage = {};

		//=====================================================================
		// Storage Provider
		//=====================================================================

		if ( !ProviderName.endsWith( 'Provider' ) ) { throw new Error( `Invalid storage provider name [${ProviderName}].` ); }
		let filename = LIB_PATH( __dirname, 'core', 'StorageProviders', ProviderName + '.js' );
		if ( !LIB_FS.existsSync( filename ) ) { throw new Error( `Storage provider does not exist [${ProviderName}].` ); }
		let factory = require( filename );
		storage = factory.NewProvider( server, ProviderSettings );

		//=====================================================================
		// Return Storage
		//=====================================================================

		return storage;
	};

