'use strict';


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{
		// Create the application service.
		let service = Server.NewApplicationService(
			// Service Definition
			{
				name: 'Maths',
				title: 'Maths Service',
				description: 'Does maths.',
			},
			// Configuration Defaults
			{
				enabled: true,
			} );


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	Origin Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		//---------------------------------------------------------------------
		// All of our functions take two parameters: A and B
		// We can create these field definitions once and use it in each function definition.
		let operand_A =
			Server.NewFieldDefinition( {
				name: 'A',
				title: "A",
				description: "The first value in the operation.",
				type: 'number',
				default: 0,
				example: 3,
				required: true,
			} );

		let operand_B =
			Server.NewFieldDefinition( {
				name: 'B',
				title: "B",
				description: "The second value in the operation.",
				type: 'number',
				default: 0,
				example: 4,
				required: true,
			} );


		//---------------------------------------------------------------------
		service.Origins.Add =
			Server.NewOriginDefinition(
				// Origin Definition
				{
					name: 'Add',
					description: "Returns the sum of two numbers. (A + B)",
					requires_login: false,
					allowed_roles: [ '*' ],
					Fields: [ operand_A, operand_B ],
				},
				// Origin Function
				function Add( User, A, B )
				{ return ( A + B ); },
			);


		//---------------------------------------------------------------------
		service.Origins.Subtract =
			Server.NewOriginDefinition(
				// Origin Definition
				{
					name: 'Subtract',
					description: "Returns the difference of two numbers. (A - B)",
					requires_login: false,
					allowed_roles: [ '*' ],
					Fields: [ operand_A, operand_B ],
				},
				// Origin Function
				function Subtract( User, A, B )
				{ return ( A - B ); },
			);


		//---------------------------------------------------------------------
		service.Origins.Multiply =
			Server.NewOriginDefinition(
				// Origin Definition
				{
					name: 'Multiply',
					description: "Returns the product of two numbers. (A * B)",
					requires_login: false,
					allowed_roles: [ '*' ],
					Fields: [ operand_A, operand_B ],
				},
				// Origin Function
				function Multiply( User, A, B )
				{ return ( A * B ); },
			);


		//---------------------------------------------------------------------
		service.Origins.Divide =
			Server.NewOriginDefinition(
				// Origin Definition
				{
					name: 'Divide',
					description: "Returns the ratio of two numbers. (A / B)",
					requires_login: false,
					allowed_roles: [ '*' ],
					Fields: [ operand_A, operand_B ],
				},
				// Origin Function
				function Divide( User, A, B )
				{ return ( A / B ); },
			);


		//---------------------------------------------------------------------
		// Return the Service.
		//---------------------------------------------------------------------


		return service;
	};

