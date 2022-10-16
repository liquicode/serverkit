'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );
const SRC_CLIENT_SUPPORT_CLIENT_API = require( './ClientSupport/Web.ClientSupport.ClientApiFile.js' );
const SRC_CLIENT_SUPPORT_OPEN_API = require( './ClientSupport/Web.ClientSupport.OpenApiFile.js' );
const SRC_CLIENT_SUPPORT_AUTHENTICATOR = require( './ClientSupport/Web.ClientSupport.Authenticator.js' );
const SRC_CLIENT_SUPPORT_VIEW_CORE = require( './ClientSupport/Web.ClientSupport.ViewCore.js' );


//---------------------------------------------------------------------
exports.ClientSupport_ViewEngine =
	function ClientSupport_ViewEngine( CTX )
	{
		if ( CTX.Transport.Settings.ClientSupport
			&& CTX.Transport.Settings.ClientSupport.enabled
			&& CTX.Transport.Settings.ClientSupport.view_engine )
		{
			let engine = CTX.Transport.Settings.ClientSupport.view_engine;
			let path = CTX.Server.ResolveApplicationPath( CTX.Transport.Settings.ClientSupport.view_folder );
			LIB_FS.mkdirSync( path, { recursive: true } );
			CTX.Transport.ExpressApp.set( 'view engine', engine );
			CTX.Transport.ExpressApp.set( 'views', path );
			CTX.Server.Log.trace( `Web.ClientSupport is using '${engine}' views from folder [${CTX.Transport.Settings.ClientSupport.view_folder}].` );
		}
	};

//---------------------------------------------------------------------
exports.ClientSupport_GenerateClientApiFile =
	function ClientSupport_GenerateClientApiFile( CTX )
	{
		if ( CTX.Transport.Settings.ClientSupport
			&& CTX.Transport.Settings.ClientSupport.enabled
			&& CTX.Transport.Settings.ClientSupport.client_api_file )
		{
			let code = SRC_CLIENT_SUPPORT_CLIENT_API.Generate( CTX.Server, CTX.Transport );
			// let public_folder = CTX.Server.ResolveApplicationPath( CTX.Transport.Settings.ClientSupport.public_folder );
			// LIB_FS.mkdirSync( public_folder, { recursive: true } );
			// let filename = LIB_PATH.join( public_folder, CTX.Transport.Settings.ClientSupport.client_api_file );
			let filename = CTX.Server.ResolveApplicationPath( CTX.Transport.Settings.ClientSupport.client_api_file );
			LIB_FS.mkdirSync( LIB_PATH.dirname( filename ), { recursive: true } );
			LIB_FS.writeFileSync( filename, code );
			CTX.Server.Log.trace( `Web.ClientSupport generated client file [${CTX.Transport.Settings.ClientSupport.client_api_file}].` );
		}
	};

//---------------------------------------------------------------------
exports.ClientSupport_GenerateOpenApiFile =
	function ClientSupport_GenerateOpenApiFile( CTX )
	{
		if ( CTX.Transport.Settings.ClientSupport
			&& CTX.Transport.Settings.ClientSupport.enabled
			&& CTX.Transport.Settings.ClientSupport.open_api_file )
		{
			let code = SRC_CLIENT_SUPPORT_OPEN_API.Generate( CTX.Server, CTX.Transport );
			// let public_folder = CTX.Server.ResolveApplicationPath( CTX.Transport.Settings.ClientSupport.public_folder );
			// LIB_FS.mkdirSync( public_folder, { recursive: true } );
			// let filename = LIB_PATH.join( public_folder, CTX.Transport.Settings.ClientSupport.open_api_file );
			let filename = CTX.Server.ResolveApplicationPath( CTX.Transport.Settings.ClientSupport.open_api_file );
			LIB_FS.mkdirSync( LIB_PATH.dirname( filename ), { recursive: true } );
			LIB_FS.writeFileSync( filename, JSON.stringify( code ) );
			CTX.Server.Log.trace( `Web.ClientSupport generated open api file [${CTX.Transport.Settings.ClientSupport.open_api_file}].` );
		}
	};

//---------------------------------------------------------------------
exports.ClientSupport_MountPublicFolder =
	function ClientSupport_MountPublicFolder( CTX )
	{
		if ( CTX.Transport.Settings.ClientSupport
			&& CTX.Transport.Settings.ClientSupport.enabled
			&& CTX.Transport.Settings.ClientSupport.public_folder )
		{
			let public_url = CTX.Transport.ServerPath() + CTX.Transport.Settings.ClientSupport.public_url_path;
			let public_folder = CTX.Server.ResolveApplicationPath( CTX.Transport.Settings.ClientSupport.public_folder );
			LIB_FS.mkdirSync( public_folder, { recursive: true } );
			CTX.Transport.ExpressApp.use( public_url, CTX.LIB_EXPRESS.static( public_folder ) );
			CTX.Server.Log.trace( `Web.ClientSupport mounted route [${public_url}] for public folder [${CTX.Transport.Settings.ClientSupport.public_folder}].` );
		}
	};

//---------------------------------------------------------------------
let root_origin = {
	name: 'root',
	requires_login: false,
	allowed_roles: [ '*' ],
};

exports.ClientSupport_MountRootRoute =
	function ClientSupport_MountRootRoute( CTX )
	{
		if ( CTX.Transport.Settings.ClientSupport
			&& CTX.Transport.Settings.ClientSupport.enabled
			&& CTX.Transport.Settings.ClientSupport.Views.root_view )
		{
			let root_url = CTX.Transport.ServerPath();
			let root_view = CTX.Transport.Settings.ClientSupport.Views.root_view;
			CTX.Transport.ExpressApp.get( root_url,
				// CTX.Transport.AuthenticationGate( false ),
				// CTX.Transport.AuthorizationGate( [ '*' ] ),
				CTX.Transport.AuthenticationGate( root_origin ),
				CTX.Transport.AuthorizationGate( root_origin ),
				CTX.Transport.InvocationGate( null, '/',
					async function ( request, response, next )
					{
						response.render( root_view, { Server: CTX.Server, User: request.user } );
						return "OK";
					}
				),
			);
			CTX.Server.Log.trace( `Web.ClientSupport mounted route [${root_url}] for view [${root_view}].` );
		}
	};

//---------------------------------------------------------------------
exports.ClientSupport_MountAuthenticatorRoutes = SRC_CLIENT_SUPPORT_AUTHENTICATOR.ClientSupport_MountAuthenticatorRoutes;
exports.ClientSupport_GenerateViewCore = SRC_CLIENT_SUPPORT_VIEW_CORE.ClientSupport_GenerateViewCore;

