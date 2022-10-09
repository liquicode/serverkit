'use strict';


const Liquicode = require( '@liquicode/liquicodejs' );
const LIB_UID_SAFE = require( 'uid-safe' );
const LIB_CHEERIO = require( 'cheerio' );


//---------------------------------------------------------------------
exports.Construct =
	function Construct( Server )
	{
		// Create the storage service.
		let service = Server.NewStorageService(
			{
				name: 'Sheets',
				title: 'Sheets Service',
				description: 'Manages user sheets.',
				Item: {
					name: 'Sheet',
					title: 'Sheet',
					titles: 'Sheets',
					description: 'A user sheet.',
					shareable: true,
					Fields: [
						Server.NewFieldDefinition( {
							name: 'sheet_id',
							title: "Sheet ID",
							description: "Unique ID for this sheet.",
							type: 'string',
							readonly: true,
						} ),
						Server.NewFieldDefinition( {
							name: 'sheet_name',
							title: "Sheet Name",
							description: "The name of this sheet.",
							type: 'string',
						} ),
						Server.NewFieldDefinition( {
							name: 'page_url',
							title: "Page Url",
							description: "The url of the page containing the table.",
							type: 'string',
						} ),
						Server.NewFieldDefinition( {
							name: 'table_selector',
							title: "Table Selector",
							description: "The css selector of the table to scrape.",
							type: 'string',
						} ),
						Server.NewFieldDefinition( {
							name: 'skip_rows',
							title: "Skip Rows",
							description: "Number of rows to skip before scraping data.",
							type: 'integer',
							default: 0,
						} ),
						Server.NewFieldDefinition( {
							name: 'include_header',
							title: "Include Header",
							description: "Include the table header <thead> in the first row of scraped data.",
							type: 'boolean',
							default: true,
						} ),
						Server.NewFieldDefinition( {
							name: 'table_data',
							title: "Table Data",
							description: "The data values scraped from the table, an array of arrays.",
							type: 'object',
						} ),
						Server.NewFieldDefinition( {
							name: 'scraped_at',
							title: "Scraped At",
							description: "Timestamp of when this sheet was last scraped.",
							type: 'string',
							readonly: true,
						} ),
					],
				},
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
		// Remove the Storage Origins.


		//---------------------------------------------------------------------
		service.Origins.NewSheet =
			Server.NewOriginDefinition(
				// Origin Definition
				{
					name: 'NewSheet',
					description: "Create a new sheet.",
					requires_login: true,
					allowed_roles: [ '*' ],
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Values',
							title: "Values",
							description: "An object containing data values.",
							type: 'object',
							required: false,
						} ),
					],
				},
				// Origin Function
				async function ( User, Values )
				{ return service.NewSheet( User, Values ); },
			);


		//---------------------------------------------------------------------
		service.Origins.LoadSheet =
			Server.NewOriginDefinition(
				// Origin Definition
				{
					name: 'LoadSheet',
					description: "Scrape and store the sheet.",
					requires_login: true,
					allowed_roles: [ '*' ],
					Fields: [
						Server.NewFieldDefinition( {
							name: 'SheetID',
							title: "SheetID",
							description: "ID of the sheet to load.",
							type: 'string',
							example: 'b88d6048-725f-4f21-a8b0-e6de2de262e0',
							required: true,
						} ),
					],
				},
				// Origin Function
				async function ( User, SheetID )
				{ return service.LoadSheet( User, SheetID ); },
			);


		//---------------------------------------------------------------------
		service.Origins.SaveSheet =
			Server.NewOriginDefinition(
				// Origin Definition
				{
					name: 'SaveSheet',
					description: "Update the sheet.",
					requires_login: true,
					allowed_roles: [ '*' ],
					Fields: [
						Server.NewFieldDefinition( {
							name: 'Sheet',
							title: "Sheet",
							description: "A sheet object.",
							type: 'object',
							required: true,
						} ),
					],
				},
				// Origin Function
				async function ( User, Sheet )
				{ return service.SaveSheet( User, Sheet ); },
			);


		//---------------------------------------------------------------------
		service.Origins.DeleteSheet =
			Server.NewOriginDefinition(
				// Origin Definition
				{
					name: 'DeleteSheet',
					description: "Delete the sheet.",
					requires_login: true,
					allowed_roles: [ '*' ],
					Fields: [
						Server.NewFieldDefinition( {
							name: 'SheetID',
							title: "SheetID",
							description: "ID of the sheet to delete.",
							type: 'string',
							example: 'b88d6048-725f-4f21-a8b0-e6de2de262e0',
							required: true,
						} ),
					],
				},
				// Origin Function
				async function ( User, SheetID )
				{ return service.DeleteSheet( User, SheetID ); },
			);


		//---------------------------------------------------------------------
		service.Origins.ScrapeTable =
			Server.NewOriginDefinition(
				// Origin Definition
				{
					name: 'ScrapeTable',
					description: "Scrape and update the sheet.",
					requires_login: true,
					allowed_roles: [ '*' ],
					Fields: [
						Server.NewFieldDefinition( {
							name: 'SheetID',
							title: "SheetID",
							description: "ID of the sheet to scrape.",
							type: 'string',
							example: 'b88d6048-725f-4f21-a8b0-e6de2de262e0',
							required: true,
						} ),
					],
				},
				// Origin Function
				async function ( User, SheetID )
				{ return service.ScrapeTable( User, SheetID ); },
			);


		//---------------------------------------------------------------------
		//---------------------------------------------------------------------
		//	View Definitions
		//---------------------------------------------------------------------
		//---------------------------------------------------------------------


		// None.


		//=====================================================================
		//=====================================================================
		//
		//	Service Functions
		//
		//=====================================================================
		//=====================================================================


		//---------------------------------------------------------------------
		// NewSheet
		//---------------------------------------------------------------------

		service.NewSheet =
			async function NewSheet( User, Values )
			{
				let sheet = await service.NewStorageItem( User, Values );
				sheet.sheet_id = LIB_UID_SAFE.sync( 18 );
				sheet = await service.StorageCreateOne( User, sheet );
				return sheet;
			};


		//---------------------------------------------------------------------
		// LoadSheet
		//---------------------------------------------------------------------

		service.LoadSheet =
			async function LoadSheet( User, SheetID )
			{
				let sheet = await service.StorageFindOne( User, { sheet_id: SheetID } );
				return sheet;
			};


		//---------------------------------------------------------------------
		// SaveSheet
		//---------------------------------------------------------------------

		service.SaveSheet =
			async function SaveSheet( User, Sheet )
			{
				let sheet = await service.StorageWriteOne( User, { sheet_id: Sheet.sheet_id }, Sheet );
				return sheet;
			};


		//---------------------------------------------------------------------
		// DeleteSheet
		//---------------------------------------------------------------------

		service.DeleteSheet =
			async function DeleteSheet( User, SheetID )
			{
				let sheet = await service.StorageDeleteOne( User, { sheet_id: SheetID } );
				return sheet;
			};


		//---------------------------------------------------------------------
		// ScrapeTable
		//---------------------------------------------------------------------

		service.ScrapeTable =
			async function ScrapeTable( User, SheetID )
			{
				// Get the sheet.
				let sheet = await service.StorageFindOne( User, { sheet_id: SheetID } );
				sheet.table_data = null;
				sheet.scraped_at = '';

				let html = await Liquicode.Network.AsyncGetRequest( sheet.page_url );
				let $ = LIB_CHEERIO.load( html, { xmlMode: true, decodeEntities: true } );

				let matrix = Liquicode.Matrix( 0 );

				let tables = $( sheet.table_selector ); // get the tables
				if ( tables.length )
				{
					let head_rows = $( ' thead tr', tables[ 0 ] ); // get the header rows
					let data_rows = $( ' tbody tr', tables[ 0 ] ); // get the data rows

					// Scrape the table header.
					if ( head_rows.length && sheet.include_header )
					{
						let cells = $( 'th,td', head_rows[ 0 ] );
						let values = [];
						for ( let cell_index = 0; cell_index < cells.length; cell_index++ )
						{
							values.push( $( cells[ cell_index ] ).text() );
						}
						matrix.AppendRows( values );
					}

					// Scrape the table data.
					for ( let row_index = 0; row_index < data_rows.length; row_index++ )
					{
						if ( row_index < sheet.skip_rows ) { continue; } // skip initial rows
						let cells = $( 'th,td', data_rows[ row_index ] );
						let values = [];
						for ( let cell_index = 0; cell_index < cells.length; cell_index++ )
						{
							values.push( $( cells[ cell_index ] ).text() );
						}
						matrix.AppendRows( values );
					}
				}

				// Update the sheet.
				sheet.table_data = matrix.RowData; // Array of arrays
				sheet.scraped_at = ( new Date() ).toISOString();
				sheet = await service.StorageWriteOne( User, { sheet_id: SheetID }, sheet );
				return sheet;
			};


		//---------------------------------------------------------------------
		// Return the Service.
		//---------------------------------------------------------------------


		return service;
	};
