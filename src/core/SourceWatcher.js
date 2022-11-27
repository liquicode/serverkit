'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


exports.NewSourceWatcher =
	function NewSourceWatcher( Server )
	{
		let watcher = {

			Watches: {},
			interval_handle: null,
			is_running: false,
			is_shutting_down: false,

			Startup:
				function ()
				{
					if ( watcher.interval_handle ) { return; }
					if ( !Server.Settings.Server.source_watcher_ms ) { return; }
					Server.Log.trace( `Source Watcher is starting.` );
					watcher.interval_handle = setInterval( watcher.CheckWatch, Server.Settings.Server.source_watcher_ms );
					watcher.is_running = true;
					return;
				},

			Shutdown:
				function ()
				{
					if ( !watcher.interval_handle ) { return; }
					watcher.is_shutting_down = true;
					clearInterval( watcher.interval_handle );
					watcher.interval_handle = null;
					watcher.Watches = {};
					watcher.is_running = false;
					Server.Log.trace( `Source Watcher has stopped.` );
					return;
				},

			RegisterSource:
				function ( SourcePath )
				{
					let stats = LIB_FS.statSync( SourcePath );
					if ( stats.isFile() )
					{
						watcher.Watches[ SourcePath ] = stats;
						Server.Log.info( `Registered file with Source Watcher [${SourcePath}].` );
					}
					else if ( stats.isDirectory() )
					{
						let filenames = LIB_FS.readdirSync( SourcePath );
						for ( let index = 0; index < filenames.length; index++ )
						{
							let filename = LIB_PATH.join( SourcePath, filenames[ index ] );
							watcher.RegisterSource( filename );
						}
					}
					return;
				},

			CheckWatch:
				async function ()
				{
					let t0 = new Date();
					let server_restart = false;
					let keys = Object.keys( watcher.Watches );
					for ( let index = 0; index < keys.length; index++ )
					{
						let filename = keys[ index ];
						let stats = LIB_FS.statSync( filename );
						if ( stats === undefined )
						{
							Server.Log.info( `Server is restarting because a source file was deleted [${filename}].` );
							server_restart = true;
							break;
						}
						if ( stats.mtimeMs > watcher.Watches[ filename ].mtimeMs )
						{
							Server.Log.info( `Server is restarting because a source file was changed [${filename}].` );
							server_restart = true;
							break;
						}
						if ( watcher.is_shutting_down ) { return; }
					}
					let t1 = new Date();
					if ( ( t1 - t0 ) > 100 )
					{
						Server.Log.warn( `Source scan completed in ${t1 - t0} ms.` );
					}
					if ( server_restart && !watcher.is_shutting_down )
					{
						watcher.Shutdown();
						await Server.Shutdown();
						await Server.Startup();
					}
					return;
				},

		};

		return watcher;
	};


