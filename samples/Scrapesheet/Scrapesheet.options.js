module.exports = {
	defaults_filename: '',		// Writes server defaults to a file.
	settings_filename: '',		// Writes server settings to a file.
	config_path: '',			// Merges, alphabetically, all json/yaml files in path. Can be the filename of a single config file.
	services_path: 'services',	// Path to the application services folder. Can be the filename of a single service.
	Settings:
	{
		AppInfo: {
			name: 'Scrapesheet',
			description: 'Scrape and store html tables.',
			environment: 'development',
		},
		Services: {
			Authentication: {
				Storage: {
					storage_engine: 'Database',
				},
			},
			ServerAccounts: {
				Storage: {
					storage_provider: 'sqlite3',
					Sqlite3Provider: {
						filename: 'ServerAccounts.sqlite3',				// Name of the database file.
						table_name: 'ServerAccount',					// Name of the table for this service.
					},
				},
			},
			Sheets: {
				Storage: {
					storage_provider: 'sqlite3',
					Sqlite3Provider: {
						filename: 'Sheets.sqlite3',				// Name of the database file.
						table_name: 'Sheets',					// Name of the table for this service.
					},
				},
			},
		},
		Transports: {
			Web: {
				enabled: true,
				// report_routes: true,
				ServerAddress: {
					// port: 4200
				},
				ClientSupport: {
					enabled: true,
					view_core: 'w3css-angularjs',				// Generate core ui elements (in public_folder).
					// view_core_overwrite: true,
					view_core_overwrite: false,
				},
				Security: {
					Cors: {
						enabled: true,
					},
					Helmet: {
						enabled: false,
					},
				},
			},
			WebSocket: {
				enabled: true,
				ClientSupport: {
					enabled: true,
				},
			},
		},
		Modules: {
			Log: {
				Console: {
					enabled: false,
				},
				Shell: {
					enabled: true,
				},
			},
		},
	},
};
