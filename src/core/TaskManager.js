'use strict';


const NODE_CRON = require( 'node-cron' );




exports.NewTaskManager =
	function NewTaskManager( Server )
	{
		let manager = {

			ScheduledTasks: {},

			Task:
				function ( TaskName )
				{
					return this.ScheduledTasks[ TaskName ];
				},

			AddTask:
				function ( TaskName, Options, InvokeFunction )
				{
					if ( this.ScheduledTasks[ TaskName ] !== undefined ) { throw new Error( `A scheduled task with the name [${TaskName}] already exists.` ); }

					Options = Options || {};
					Options = Server.Liquicode.Object.Merge(
						{
							crontab: '',
							run_once: false,
							run_count: 0,
						},
						Options
					);

					if ( Options.run_once ) { Options.run_count = 1; }
					if ( !Options.crontab && Options.run_count ) { Options.crontab = '* * * * * *'; }
					if ( !Options.crontab ) { throw new Error( `No scheduling options were provided.` ); }

					this.ScheduledTasks[ TaskName ] = {
						name: TaskName,
						options: JSON.parse( JSON.stringify( Options ) ),
						enabled: false,
						task: null,
						last_start: null,
						last_finish: null,
						last_duration: null,
						last_error: null,
						run_count: 0,
						handler:
							async function ()
							{
								let this_task = Server.TaskManager.ScheduledTasks[ TaskName ];
								this_task.last_start = new Date();
								this_task.last_finish = null;
								this_task.last_duration = null;
								this_task.last_error = null;
								this_task.run_count++;

								Server.Log.trace( `Starting Task [${TaskName}].` );
								if ( InvokeFunction )
								{
									try 
									{
										await InvokeFunction();
									}
									catch ( error ) 
									{
										this_task.last_error = error.message;
									}
								}
								this_task.last_finish = new Date();
								this_task.last_duration = ( this_task.last_finish - this_task.last_start );

								if ( this_task.last_error )
								{
									Server.Log.error( `Scheduled task [${TaskName}] had an error: ${this_task.last_error}` );
									Server.TaskManager.EnableTask( TaskName, false );
									return;
								}
								else
								{
									Server.Log.trace( `Completed task [${TaskName}]; duration = ${this_task.last_duration}ms.` );
								}

								if ( this_task.options.run_count &&
									( this_task.run_count >= this_task.options.run_count ) )
								{
									Server.Log.trace( `Disabling task [${TaskName}] because it has reached the maximum run count of ${this_task.options.run_count}.` );
									Server.TaskManager.EnableTask( TaskName, false );
									return;
								}

								return;
							},
					};

					return this.Task( TaskName );
				},


			EnableTask:
				function ( TaskName, Enabled )
				{
					let scheduled_task = this.ScheduledTasks[ TaskName ];
					if ( Enabled )
					{
						scheduled_task.enabled = true;
						if ( !scheduled_task.task )
						{
							scheduled_task.task = NODE_CRON.schedule( scheduled_task.options.crontab, scheduled_task.handler );
						}
						Server.Log.debug( `Enabled scheduled task [${TaskName}].` );
					}
					else
					{
						scheduled_task.enabled = false;
						if ( scheduled_task.task )
						{
							scheduled_task.task.stop();
							scheduled_task.task = null;
						}
						Server.Log.debug( `Disabled scheduled task [${TaskName}].` );
					}
					return;
				},


			RemoveTask:
				function ( TaskName )
				{
					let scheduled_task = this.ScheduledTasks[ TaskName ];
					if ( scheduled_task.task ) { scheduled_task.task.stop(); }
					scheduled_task.task = null;
					scheduled_task.enabled = false;
					delete this.ScheduledTasks[ TaskName ];
					return scheduled_task;
				},


			Startup:
				function ()
				{
					let task_keys = Object.keys( this.ScheduledTasks );
					for ( let index = 0; index < task_keys.length; index++ )
					{
						this.EnableTask( task_keys[ index ], true );
					}
					return;
				},


			Shutdown:
				function ()
				{
					let task_keys = Object.keys( this.ScheduledTasks );
					for ( let index = 0; index < task_keys.length; index++ )
					{
						this.EnableTask( task_keys[ index ], false );
					}
					return;
				},


			// StopTask:
			// 	function ( TaskName )
			// 	{
			// 		let scheduled_task = this.ScheduledTasks[ TaskName ];
			// 		if ( scheduled_task.task ) { scheduled_task.task.stop(); }
			// 		scheduled_task.task = null;
			// 		scheduled_task.enabled = false;
			// 	},


			// StopAllTasks:
			// 	function ()
			// 	{
			// 		let task_names = Object.keys( this.ScheduledTasks );
			// 		for ( let index = 0; index < task_names.length; index++ )
			// 		{
			// 			this.ScheduleTask( task_names[ index ] );
			// 		}
			// 	},


		};
		return manager;
	}

