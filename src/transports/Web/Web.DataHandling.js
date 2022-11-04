'use strict';


const LIB_EXPRESS_FILEUPLOAD = require( 'express-fileupload' );


//---------------------------------------------------------------------
exports.DataHandling_JsonBodyParser =
	function DataHandling_JsonBodyParser( CTX )
	{
		if ( CTX.Transport.Settings.DataHandling.JsonBodyParser
			&& CTX.Transport.Settings.DataHandling.JsonBodyParser.Settings )
		{
			CTX.Transport.ExpressApp.use(
				CTX.LIB_EXPRESS.json(
					CTX.Transport.Settings.DataHandling.JsonBodyParser.Settings ) );
			CTX.Server.Log.trace( `Web.DataHandling.JsonBodyParser has initialized.` );
		}
	};

//---------------------------------------------------------------------
exports.DataHandling_UrlEncodedParser =
	function DataHandling_UrlEncodedParser( CTX )
	{
		if ( CTX.Transport.Settings.DataHandling.UrlEncodedParser
			&& CTX.Transport.Settings.DataHandling.UrlEncodedParser.Settings )
		{
			CTX.Transport.ExpressApp.use(
				CTX.LIB_EXPRESS.urlencoded(
					CTX.Transport.Settings.DataHandling.UrlEncodedParser.Settings ) );
			CTX.Server.Log.trace( `Web.DataHandling.UrlEncodedParser has initialized.` );
		}
	};

//---------------------------------------------------------------------
exports.DataHandling_FileUpload =
	function DataHandling_FileUpload( CTX )
	{
		if ( CTX.Transport.Settings.DataHandling.FileUpload
			&& CTX.Transport.Settings.DataHandling.FileUpload.Settings )
		{
			CTX.Transport.ExpressApp.use(
				LIB_EXPRESS_FILEUPLOAD(
					CTX.Transport.Settings.DataHandling.FileUpload.Settings ) );
			CTX.Server.Log.trace( `Web.DataHandling.FileUpload has initialized.` );
		}
	};


