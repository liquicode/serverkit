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
				CTX.Server.Log.trace( `Web.ClientSupport.ViewCore generated [${CTX.Transport.Settings.ClientSupport.view_core}] (${file_count} files) into [${CTX.Transport.Settings.ClientSupport.public_folder}].` );
			}

			// Copy the View files.
			{
				let server_path = LIB_PATH.join( view_core_path, 'views' );
				let client_path = CTX.Server.ResolveApplicationPath( CTX.Transport.Settings.ClientSupport.view_folder );
				let file_count = CTX.Server.Utility.copy_folder_recurse( server_path, client_path, overwrite_files );
				CTX.Server.Log.trace( `Web.ClientSupport.ViewCore generated [${CTX.Transport.Settings.ClientSupport.view_core}] (${file_count} files) into [${CTX.Transport.Settings.ClientSupport.view_folder}].` );
			}

			// Copy any Service Web files.
			{
				// let server_public_path = LIB_PATH.join( view_core_path, 'public' );
				// let server_views_path = LIB_PATH.join( view_core_path, 'views' );

				// CTX.Server.VisitViewsSync(
				// 	function process_view( Service, Origin )
				// 	{
				// 		if ( !Service.Settings.enabled ) { return; }
				// 		if ( !Origin ) { return; }

				// 		let src_web_path = CTX.Server.ResolveApplicationPath( LIB_PATH.join( 'Services', Service.Definition.name, 'web' ) );
				// 		if ( !LIB_FS.existsSync( src_web_path ) ) { return; }

				// 		let src_web_public_path = LIB_PATH.join( src_web_path, 'public' );
				// 		let src_web_views_path = LIB_PATH.join( src_web_path, 'views' );
				// 		if ( LIB_FS.existsSync( src_web_public_path ) ) 
				// 		{
				// 			let dest_path = LIB_PATH.join( CTX.Transport.Settings.ClientSupport.public_folder, 'Services', Service.Definition.name );
				// 			dest_path = CTX.Server.ResolveApplicationPath( dest_path );
				// 			let file_count = CTX.Server.Utility.copy_folder_recurse( src_web_public_path, dest_path, overwrite_files );
				// 			CTX.Server.Log.trace( `Web.ClientSupport.ViewCore copied ${file_count} files from the service [${Service.Definition.name}] to the web/public folder.` );
				// 		}
				// 		if ( LIB_FS.existsSync( src_web_views_path ) ) 
				// 		{
				// 			let dest_path = LIB_PATH.join( CTX.Transport.Settings.ClientSupport.view_folder, 'Services', Service.Definition.name );
				// 			dest_path = CTX.Server.ResolveApplicationPath( dest_path );
				// 			let file_count = CTX.Server.Utility.copy_folder_recurse( src_web_views_path, dest_path, overwrite_files );
				// 			CTX.Server.Log.trace( `Web.ClientSupport.ViewCore copied ${file_count} files from the service [${Service.Definition.name}] to the web/views folder.` );
				// 		}

				// 		return;
				// 	}
				// );

				let service_keys = Object.keys( CTX.Server.Services );
				for ( let index = 0; index < service_keys.length; index++ )
				{
					let service_key = service_keys[ index ];
					let service = CTX.Server.Services[ service_key ];
					if ( !service.Settings.enabled ) { continue; }

					let src_web_path = CTX.Server.ResolveApplicationPath( LIB_PATH.join( 'Services', service.Definition.name, 'web' ) );
					if ( !LIB_FS.existsSync( src_web_path ) ) { continue; }

					let src_web_public_path = LIB_PATH.join( src_web_path, 'public' );
					let src_web_views_path = LIB_PATH.join( src_web_path, 'views' );
					if ( LIB_FS.existsSync( src_web_public_path ) ) 
					{
						let dest_path = LIB_PATH.join( CTX.Transport.Settings.ClientSupport.public_folder, 'Services', service.Definition.name );
						dest_path = CTX.Server.ResolveApplicationPath( dest_path );
						let file_count = CTX.Server.Utility.copy_folder_recurse( src_web_public_path, dest_path, overwrite_files );
						CTX.Server.Log.trace( `Web.ClientSupport.ViewCore copied ${file_count} files from the service [${service.Definition.name}] to the web/public folder.` );
					}
					if ( LIB_FS.existsSync( src_web_views_path ) ) 
					{
						let dest_path = LIB_PATH.join( CTX.Transport.Settings.ClientSupport.view_folder, 'Services', service.Definition.name );
						dest_path = CTX.Server.ResolveApplicationPath( dest_path );
						let file_count = CTX.Server.Utility.copy_folder_recurse( src_web_views_path, dest_path, overwrite_files );
						CTX.Server.Log.trace( `Web.ClientSupport.ViewCore copied ${file_count} files from the service [${service.Definition.name}] to the web/views folder.` );
					}
				}

			}

			//---------------------------------------------------------------------
			CTX.Server.Log.trace( `Web.ClientSupport.ViewCore has initialized.` );
			return;
		}
	};
