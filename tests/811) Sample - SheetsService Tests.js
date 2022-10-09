'use strict';

const LIB_PATH = require( 'path' );
const LIB_ASSERT = require( 'assert' );


const ServerKit = require( '@liquicode/lib-server-kit' );
var ServerName = 'Scrapesheet';
var ServerFolder = LIB_PATH.resolve( __dirname, '..', 'samples', ServerName );
var ServerOptions = require( LIB_PATH.join( ServerFolder, `${ServerName}.options.js` ) );


//---------------------------------------------------------------------
describe( `301) SheetsService Tests`,
	function ()
	{


		let Server = null;
		let Admin = { user_id: 'admin@server', user_role: 'admin' };
		let SheetID = '';


		//---------------------------------------------------------------------
		before(
			async function ()
			{
				Server = ServerKit.NewServer( ServerName, ServerFolder, ServerOptions );
				await Server.Initialize();
				return;
			}
		);


		//---------------------------------------------------------------------
		after(
			async function ()
			{
				return;
			}
		);


		//---------------------------------------------------------------------
		it( `should add a new Sheet record.`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				let sheet = await Server.Services.Sheets.Origins.NewSheet.invoke( Admin, {
					sheet_name: 'Test Sheet',
					page_url: 'https://datatables.net/examples/styling/display.html',
					table_selector: '#example',
				} );
				LIB_ASSERT.ok( sheet.sheet_id );
				SheetID = sheet.sheet_id;
				return;
			} );


		//---------------------------------------------------------------------
		it( `should scrape a table.`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( SheetID );
				await Server.Services.Sheets.Origins.ScrapeTable.invoke( Admin, SheetID );
				let sheet = await Server.Services.Sheets.Origins.LoadSheet.invoke( Admin, SheetID );
				LIB_ASSERT.ok( sheet.table_data );
				LIB_ASSERT.ok( sheet.table_data.length );
				LIB_ASSERT.ok( sheet.scraped_at );
				return;
			} );


		//---------------------------------------------------------------------
		it( `should delete the Sheet record.`,
			async function ()
			{
				LIB_ASSERT.ok( Server );
				LIB_ASSERT.ok( SheetID );
				await Server.Services.Sheets.Origins.DeleteSheet.invoke( Admin, SheetID );
				let sheet = await Server.Services.Sheets.Origins.LoadSheet.invoke( Admin, SheetID );
				LIB_ASSERT.ok( sheet === null );
				return;
			} );


	} );
