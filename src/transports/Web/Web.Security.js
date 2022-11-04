'use strict';


const LIB_CORS = require( 'cors' );
const LIB_HELMET = require( 'helmet' );


//---------------------------------------------------------------------
exports.Security_Cors =
	function Security_Cors( CTX )
	{
		if ( CTX.Transport.Settings.Security.Cors
			&& CTX.Transport.Settings.Security.Cors.enabled )
		{
			// - Enable CORS (see: https://medium.com/@alexishevia/using-cors-in-express-cac7e29b005b)
			// WebServer.Express.App.use( LIB_CORS( { origin: '*' } ) );
			CTX.Transport.ExpressApp.use(
				LIB_CORS(
					CTX.Transport.Settings.Security.Cors.Settings ) );
			CTX.Server.Log.trace( `Web.Security.Cors has initialized.` );
		}
	};


//---------------------------------------------------------------------
exports.Security_Helmet =
	function Security_Helmet( CTX )
	{
		if ( CTX.Transport.Settings.Security.Helmet
			&& CTX.Transport.Settings.Security.Helmet.enabled )
		{
			CTX.Transport.ExpressApp.use(
				LIB_HELMET(
					CTX.Transport.Settings.Security.Helmet.Settings ) );
			CTX.Server.Log.trace( `Web.Security.Helmet has initialized.` );
		}
	};

