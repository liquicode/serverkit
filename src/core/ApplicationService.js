'use strict';


const LIB_PATH = require( 'path' );

const SRC_SERVER_MODULE = require( LIB_PATH.join( __dirname, 'ServerModule.js' ) );


//---------------------------------------------------------------------
exports.NewApplicationService =
	function NewApplicationService( Server, Definition, Defaults )
	{

		//---------------------------------------------------------------------
		// The Service object.
		let service = SRC_SERVER_MODULE.NewServerModule( Server, 'service', Definition, Defaults );
		service.Server = Server;


		//=====================================================================
		//=====================================================================
		//
		//	Module Configuration
		//
		//=====================================================================
		//=====================================================================


		// None.


		//=====================================================================
		//=====================================================================
		//
		//	Module Definition
		//
		//=====================================================================
		//=====================================================================


		service.Definition = Server.Liquicode.Object.Merge( {
			name: 'UnnamedService',
			title: "Unnamed Application Service",
			description: "Application Service Base Class",
		}, service.Definition );


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Origin Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		service.Origins = {};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	View Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		service.Views = {};


		//=====================================================================
		//=====================================================================
		//
		//	Service Functions
		//
		//=====================================================================
		//=====================================================================


		// None.


		//=====================================================================
		//=====================================================================
		//
		//	Module Control
		//
		//=====================================================================
		//=====================================================================


		// None.


		//---------------------------------------------------------------------
		// Return the Application Service.
		//---------------------------------------------------------------------


		return service;
	};

