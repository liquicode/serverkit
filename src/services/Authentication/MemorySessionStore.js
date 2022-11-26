"use strict";


exports.Construct =
	function Construct( Server )
	{
		let authentication_settings = Server.Settings.Services.Authentication;


		//---------------------------------------------------------------------
		let storage = {

			Users: null,

			//---------------------------------------------------------------------
			initialize:
				function initialize()
				{
					this.Users = [];
					if ( Server.Settings.DefaultUsers ) 
					{
						for ( let index = 0; index < Server.Settings.DefaultUsers.length; index++ )
						{
							let user = Server.Settings.DefaultUsers[ index ];
							this.Users.push( JSON.parse( JSON.stringify( user ) ) );
							Server.Log.debug( `Added default user [${user.user_id}] to the credentials store.` );
						}
					}
					return;
				},

			//---------------------------------------------------------------------
			destroy:
				function destroy()
				{
					this.Users = null;
					return;
				},

			//---------------------------------------------------------------------
			find_user:
				function find_user( user_id, session_token )
				{
					if ( !this.Users ) { throw new Error( `MemorySessionStore is not initialized.` ); }
					for ( let index = 0; index < this.Users.length; index++ )
					{
						let user = this.Users[ index ];
						if ( user_id && user.user_id && ( user_id === user.user_id ) ) { return user; }
						if ( session_token && user.session_token && ( session_token === user.session_token ) ) { return user; }
					}
					return null;
				},

			//---------------------------------------------------------------------
			update_user:
				function update_user( updated_user )
				{
					if ( !this.Users ) { throw new Error( `MemorySessionStore is not initialized.` ); }
					for ( let index = 0; index < this.Users.length; index++ )
					{
						let user = this.Users[ index ];
						if ( updated_user.user_id === user.user_id ) 
						{
							this.Users[ index ] = JSON.parse( JSON.stringify( updated_user ) );
							return true;
						}
					}
					this.Users.push( JSON.parse( JSON.stringify( updated_user ) ) );
					return true;
				},

		};


		return storage;
	};
