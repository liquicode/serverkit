"use strict";


const LIB_FS = require( 'fs' );
const LIB_PATH = require( 'path' );

const LIB_BETTER_SQLITE3 = require( 'better-sqlite3' );


exports.Construct =
	function Construct( Server )
	{
		let authentication_settings = Server.Settings.Services.Authentication;


		//---------------------------------------------------------------------
		let storage = {

			Database: null,
			Procedures: {
				select_by_user_id: null,
				select_by_session_token: null,
				insert: null,
				update_by_user_id: null,
				delete_by_user_id: null,
				// delete_all: null,
			},

			//---------------------------------------------------------------------
			initialize:
				function initialize()
				{
					// Create the database.
					let database_path = Server.ResolveApplicationPath( authentication_settings.SessionStorage.DatabaseStorage.file_path );
					let database_options = {};
					LIB_FS.mkdirSync( LIB_PATH.dirname( database_path ), { recursive: true } );
					this.Database = LIB_BETTER_SQLITE3( database_path, database_options );

					// Initialization Sql
					// let init_sql = `
					// 	CREATE TABLE IF NOT EXISTS UserSession (
					// 	user_id TEXT PRIMARY KEY,
					// 	user_role TEXT,
					// 	user_name TEXT,
					// 	password TEXT,
					// 	session_token TEXT );
					// `;
					let init_sql = `
						CREATE TABLE IF NOT EXISTS UserSession (
						user_id TEXT PRIMARY KEY,
						password TEXT,
						session_token TEXT );
					`;

					// Initialize the database.
					let create_table_info = this.Database.exec( init_sql );

					// Prepare sql statements.
					this.Procedures.select_by_user_id =
						this.Database.prepare( 'SELECT * FROM UserSession WHERE (user_id = @user_id)' );
					this.Procedures.select_by_session_token =
						this.Database.prepare( 'SELECT * FROM UserSession WHERE (session_token = @session_token)' );
					this.Procedures.insert =
						// this.Database.prepare( 'INSERT INTO UserSession VALUES ( @user_id, @user_role, @user_name, @password, @session_token )' );
						this.Database.prepare( 'INSERT INTO UserSession VALUES ( @user_id, @password, @session_token )' );
					this.Procedures.update_by_user_id =
						// this.Database.prepare( 'UPDATE UserSession SET user_role = @user_role, user_name = @user_name, password = @password, session_token = @session_token WHERE (user_id = @user_id)' );
						this.Database.prepare( 'UPDATE UserSession SET password = @password, session_token = @session_token WHERE (user_id = @user_id)' );
					this.Procedures.delete_by_user_id =
						this.Database.prepare( 'DELETE FROM UserSession WHERE (user_id = @user_id)' );

					// Initial Users
					let procedure_rowcount = this.Database.prepare( 'SELECT COUNT( * ) AS RowCount FROM UserSession' );
					let rowcount = procedure_rowcount.get();
					if ( rowcount.RowCount === 0 )
					{
						for ( let index = 0; index < Server.Settings.DefaultUsers.length; index++ )
						{
							let user = JSON.parse( JSON.stringify( Server.Settings.DefaultUsers[ index ] ) );
							user.session_token = '';
							let insert_info = this.Procedures.insert.run( user );
							Server.Log.debug( `Added default user [${user.user_id}] to the credentials store.` );
						}
					}

					// Return.
					return;
				},

			//---------------------------------------------------------------------
			destroy:
				function destroy()
				{
					if ( this.Database )
					{
						this.Database.close();
						this.Database = null;
					}
					this.Procesdures = {};
					return;
				},

			//---------------------------------------------------------------------
			find_user:
				function find_user( user_id, session_token )
				{
					let storage_user = null;
					if ( user_id )
					{
						storage_user = this.Procedures.select_by_user_id.get( {
							user_id: user_id
						} );
					}
					else if ( session_token )
					{
						storage_user = this.Procedures.select_by_session_token.get( {
							session_token: session_token
						} );
					}
					return storage_user;
				},

			//---------------------------------------------------------------------
			update_user:
				function update_user( updated_user )
				{
					let update_info = this.Procedures.update_by_user_id.run( updated_user );
					if ( !update_info.changes )
					{
						let insert_info = this.Procedures.insert.run( updated_user );
						if ( !insert_info.changes ) { throw new Error( `Error saving user session in database.` ); }
					}
					return;
				},

		};


		return storage;
	};
