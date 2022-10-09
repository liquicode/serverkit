'use strict';


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );


// Read the functions text file.
let functions_text_filename = LIB_PATH.join( __dirname, 'functions.txt' );
let functions_text = LIB_FS.readFileSync( functions_text_filename, 'utf-8' );

// Convert to json.
let pages = [];
let text_lines = functions_text.split( '\n' );
for ( let text_lines_index = 0; text_lines_index < text_lines.length; text_lines_index++ )
{
	// Get the line.
	let line = text_lines[ text_lines_index ];
	if ( line.length === 0 ) { continue; }

	// Convert the line to an array of fields.
	let fields = line.split( '\t' );
	if ( fields.length === 0 ) { continue; }
	if ( fields[ 0 ] === '' ) { continue; }
	if ( fields[ 1 ] === '' ) { continue; }
	if ( fields[ 2 ] === '' ) { continue; }
	if ( fields[ 0 ] === 'Code' ) { continue; }

	// Create the page object.
	let page = {
		code: fields[ 0 ],
		object: fields[ 1 ],
		category: fields[ 2 ],
		roles: fields[ 3 ],
		type: fields[ 4 ],
		name: fields[ 5 ],
		link: fields[ 6 ],
		signature: fields[ 7 ],
		summary: fields[ 8 ],
	};
	pages.push( page );
}

// Write json file.
let pages_json_filename = LIB_PATH.join( __dirname, 'pages.json' );
LIB_FS.writeFileSync( pages_json_filename, JSON.stringify( pages, null, '\t' ) );

// Create the summary page.
let docs_api_path = LIB_PATH.resolve( __dirname, '..', 'docs', 'guides' );
create_main_page( docs_api_path, pages );
console.log( `${pages.length} pages processed.` );


//---------------------------------------------------------------------
function create_main_page( Path, Pages )
{
	let summary_page_filename = LIB_PATH.join( Path, '000-Summary.md' );
	let content = `
# ServerKit API
`;
	let headers_built = false;
	for ( let page_index = 0; page_index < Pages.length; page_index++ )
	{
		let page = Pages[ page_index ];
		switch ( page.category )
		{
			case 'Section':
				content += '\n';
				content += `## ServerKit ${page.object}\n`;
				content += `***${page.summary}***\n`;
				headers_built = false;
				break;
			case 'Object':
				content += '\n';
				content += `- ### ${page.object} Object\n`;
				content += `***${page.summary}***\n`;
				headers_built = false;
				break;
			default:
				if ( !headers_built )
				{
					content += '\n';
					content += `| Category | Type | Function | Parameters | Summary |\n`;
					content += `|----------|------|----------|------------|---------|\n`;
					headers_built = true;
				}
				content += `| ${page.category} | ${page.type} | ${page.name} | ${page.signature} | ${page.summary} |\n`;
				break;
		}
	}
	LIB_FS.writeFileSync( summary_page_filename, content );
	return;
}

