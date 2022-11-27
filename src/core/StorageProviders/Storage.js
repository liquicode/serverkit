"use strict";


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const LIB_UUID = require( 'uuid' );


//---------------------------------------------------------------------
exports.ConfigurationDefaults =
	function ConfigurationDefaults()
	{
		let defaults = {
			storage_provider: 'MemoryProvider',
		};

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
	function NewStorage( Server, Service, StorageSettings )
	{
		let storage = {};

		//=====================================================================
		// Storage Provider
		//=====================================================================

		if ( !StorageSettings.storage_provider ) { throw new Error( `Cannot create UserStorage because no storage provider was specified.` ); }
		if ( !StorageSettings[ StorageSettings.storage_provider ] ) { throw new Error( `Cannot create UserStorage because no provider configuration was available for [${Settings.storage_provider}].` ); }

		let factory = require( `./${StorageSettings.storage_provider}.js` );
		storage = factory.NewProvider( Server, Service, StorageSettings[ StorageSettings.storage_provider ] );

		//=====================================================================
		// Return Storage
		//=====================================================================

		return storage;
	};

