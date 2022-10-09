'use strict';


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{

		// Create the storage service.
		let service = Server.NewStorageService(
			{
				name: 'TestService',
				title: 'Test Service',
				description: 'A storage service for test objects.',
				Item: {
					name: 'TestObject',
					title: 'Test Object',
					titles: 'Test Objects',
					description: 'A collection of test objects.',
					shareable: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'operation',
							title: 'Operation',
							description: 'A mathematical operation.',
							type: 'string',
						} ),
						Server.NewFieldDefinition( {
							name: 'operand1',
							title: 'Operand1',
							description: 'The first operand.',
							type: 'number',
						} ),
						Server.NewFieldDefinition( {
							name: 'operand2',
							title: 'Operand2',
							description: 'The second operand.',
							type: 'number',
						} ),
						Server.NewFieldDefinition( {
							name: 'result',
							title: 'Result',
							description: 'The operation result.',
							type: 'number',
						} ),
					],
				},
			},
			{
				/* No Defaults */
			}
		);


		//=====================================================================
		//=====================================================================
		//
		//	Service Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		service.Add =
			async function Add( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A + B );
			};


		//---------------------------------------------------------------------
		service.Subtract =
			async function Add( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A - B );
			};


		//---------------------------------------------------------------------
		service.Multiply =
			async function Add( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A * B );
			};


		//---------------------------------------------------------------------
		service.Divide =
			async function Add( User, A, B )
			{
				A = Number( A );
				B = Number( B );
				return ( A / B );
			};


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Origin Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		service.Origins.Add =
			Server.NewOriginDefinition( {
				name: 'Add',
				description: "Returns the sum of two numbers. (A + B)",
				Fields: [
					Server.NewFieldDefinition( {
						name: 'A',
						title: "A",
						description: "The first value in the operation.",
						type: 'number',
						default: 0,
						example: 3,
						required: true,
					} ),
					Server.NewFieldDefinition( {
						name: 'B',
						title: "B",
						description: "The second value in the operation.",
						type: 'number',
						default: 0,
						example: 4,
						required: true,
					} ),
				],
			},
				service.Add, // ( User, A, B )
			);

		//---------------------------------------------------------------------
		service.Origins.Subtract =
			Server.NewOriginDefinition( {
				name: 'Subtract',
				description: "Returns the difference of two numbers. (A - B)",
				Fields: [
					Server.NewFieldDefinition( {
						name: 'A',
						title: "A",
						description: "The first value in the operation.",
						type: 'number',
						default: 0,
						example: 3,
						required: true,
					} ),
					Server.NewFieldDefinition( {
						name: 'B',
						title: "B",
						description: "The second value in the operation.",
						type: 'number',
						default: 0,
						example: 4,
						required: true,
					} ),
				],
			},
				service.Subtract, // ( User, A, B )
			);

		//---------------------------------------------------------------------
		service.Origins.Multiply =
			Server.NewOriginDefinition( {
				name: 'Multiply',
				description: "Returns the product of two numbers. (A * B)",
				Fields: [
					Server.NewFieldDefinition( {
						name: 'A',
						title: "A",
						description: "The first value in the operation.",
						type: 'number',
						default: 0,
						example: 3,
						required: true,
					} ),
					Server.NewFieldDefinition( {
						name: 'B',
						title: "B",
						description: "The second value in the operation.",
						type: 'number',
						default: 0,
						example: 4,
						required: true,
					} ),
				],
			},
				service.Multiply, // ( User, A, B )
			);

		//---------------------------------------------------------------------
		service.Origins.Divide =
			Server.NewOriginDefinition( {
				name: 'Divide',
				description: "Returns the ratio of two numbers. (A / B)",
				Fields: [
					Server.NewFieldDefinition( {
						name: 'A',
						title: "A",
						description: "The first value in the operation.",
						type: 'number',
						default: 0,
						example: 3,
						required: true,
					} ),
					Server.NewFieldDefinition( {
						name: 'B',
						title: "B",
						description: "The second value in the operation.",
						type: 'number',
						default: 0,
						example: 4,
						required: true,
					} ),
				],
			},
				service.Divide, // ( User, A, B )
			);


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Service Views
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		// None.


		//=====================================================================
		//=====================================================================
		//
		//	Module Control
		//
		//=====================================================================
		//=====================================================================


		// //---------------------------------------------------------------------
		// // Server has loaded and configurations are set.
		// service.InitializeModule =
		// 	function InitializeModule( Server )
		// 	{
		// 		// Return.
		// 		return;
		// 	};


		// //---------------------------------------------------------------------
		// // Server has initialized and is starting up.
		// service.StartupModule =
		// 	function StartupModule( Server )
		// 	{
		// 		// Return.
		// 		return;
		// 	};


		// //---------------------------------------------------------------------
		// // Server has been running and is shutting down.
		// service.ShutdownModule =
		// 	function ShutdownModule( Server )
		// 	{
		// 		// Return.
		// 		return;
		// 	};


		//---------------------------------------------------------------------
		// Return the Service.
		//---------------------------------------------------------------------


		return service;
	};

