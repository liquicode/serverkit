'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


//---------------------------------------------------------------------
exports.ClientSupport_GenerateViewCore =
	function ClientSupport_GenerateViewCore( CTX )
	{
		if ( CTX.Transport.Settings.ClientSupport
			&& CTX.Transport.Settings.ClientSupport.enabled
			&& CTX.Transport.Settings.ClientSupport.view_core )
		{
			// Get the view core.
			let view_core_path = LIB_PATH.join( __dirname, 'ViewCores', CTX.Transport.Settings.ClientSupport.view_core );
			if ( !LIB_FS.existsSync( view_core_path ) ) 
			{
				let message = `The Web view core [${CTX.Transport.Settings.ClientSupport.view_core}] does not exist!`;
				// console.error( message );
				CTX.Server.Log.error( message );
				return;
			}

			let overwrite_files = CTX.Transport.Settings.ClientSupport.view_core_overwrite;

			// Copy the Public files.
			{
				let server_path = LIB_PATH.join( view_core_path, 'public' );
				let client_path = CTX.Server.ResolveApplicationPath( CTX.Transport.Settings.ClientSupport.public_folder );
				let file_count = CTX.Server.Utility.copy_folder_recurse( server_path, client_path, overwrite_files );
				CTX.Server.Log.trace( `Web.ClientSupport.ViewCore generated [${CTX.Transport.Settings.ClientSupport.view_core}] (${file_count} files) to [${CTX.Transport.Settings.ClientSupport.public_folder}].` );
			}

			// Copy the View files.
			{
				let server_path = LIB_PATH.join( view_core_path, 'views' );
				let client_path = CTX.Server.ResolveApplicationPath( CTX.Transport.Settings.ClientSupport.view_folder );
				let file_count = CTX.Server.Utility.copy_folder_recurse( server_path, client_path, overwrite_files );
				CTX.Server.Log.trace( `Web.ClientSupport.ViewCore generated [${CTX.Transport.Settings.ClientSupport.view_core}] (${file_count} files) to [${CTX.Transport.Settings.ClientSupport.view_folder}].` );
			}

			//---------------------------------------------------------------------
			CTX.Server.Log.trace( `Web.ClientSupport.ViewCore is initialized.` );
			return;
		}
	};
