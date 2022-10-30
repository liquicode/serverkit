'use strict';


const NODE_CRON = require( 'node-cron' );




exports.NewTaskManager =
	function NewTaskManager( Server )
	{
		let manager = {

			ScheduledTasks: {},

			ScheduleTask:
				function ( TaskName, TaskCron, InvokeFunction )
				{
					let task = this.ScheduledTasks[ TaskName ];
					let cron_task = null;
					if ( task && task.cron_task )
					{
						task.cron_task.stop();
						delete this.ScheduledTasks[ TaskName ];
					}
					if ( TaskCron )
					{
						cron_task = NODE_CRON.schedule( TaskCron,
							async function ()
							{
								let t0 = new Date();
								Server.Log.trace( `Starting Task [${TaskName}].` );
								if ( InvokeFunction )
								{
									await InvokeFunction();
								}
								let t1 = new Date();
								Server.Log.trace( `Completed Task [${TaskName}]; duration = ${t1 - t0}ms.` );
							} );
						this.ScheduledTasks[ TaskName ] = {
							name: TaskName,
							cron: TaskCron,
							cron_task: cron_task,
						};
					}
					return cron_task;
				},

			StopAllTasks:
				function ()
				{
					let task_names = Object.keys( this.ScheduledTasks );
					for ( let index = 0; index < task_names.length; index++ )
					{
						this.ScheduleTask( task_names[ index ] );
					}
				},


		};
		return manager;
	}

