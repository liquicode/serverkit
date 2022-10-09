

About ServerKit Command Line
---------------------------------------------------------------------

This tool allows you to interact with your ServerKit based server from the command line.
From the command line, you have the ability to establish user sessions (signup/login) with the server
as well as explore and invoke any custom service hosted by the server.

This provides critical functionality to any ServerKit server such that you can ad-hoc test your service functions
and also to control the server through scripts.
All of your management functions (backups or other house-keeping) can coexist in a single codebase with the services they target.
Having a command line interface for every service function also facilitates integrations with other systems.


Dynamic Usage
---------------------------------------------------------------------

```bash
npx @liquicode/server-kit [--name MyServer] [--folder ~/ServerCode] [--options ~/server-options.json] <command>
```

Installation is not a required step as the `npx` command will also search
the `npm` registry for this command if it is not found on the local system.


Command Line Options
---------------------------------------------------------------------
~~~

    Usage: npx @liquicode/server-kit [options] <command> <command-parameters>

---------------------------------------------------
Use one of the following commands:
---------------------------------------------------
    who                                            | Displays information on the logged in user and current session.
    signup <UserEmail> <Password> [UserName]       | Signs up a user with the server and establishes a session.
    login <UserEmail> <Password>                   | Logs in a user with the server and establishes a session.
    logout <UserEmail>                             | Logs out a user with the server and destroys the session.
    list                                           | Lists all services on the server.
    list <ServiceName>                             | Lists all origins in the service.
    list <ServiceName.OriginName>                  | Lists origin definition.
    call <ServiceName.OriginName> <...Fields>      | Invokes an origin.
---------------------------------------------------
Any command can be preceeded by any of the following options:
---------------------------------------------------
    --name <server-name>              | Name of the server. Defaults to the server folder name.
    --folder <server-folder>          | Root folder for the server. Defaults to the current working directory.
    --options <options-filename>      | Filename of a server options file. Defaults to '<server-folder>/<server-name>.options.json'.
    --log                             | Send server log output to the console.
    --shell                           | Send server log output to the shell (console with styling).
---------------------------------------------------
Examples:
---------------------------------------------------
    > npx @liquicode/server-kit-cli signup user@server "my password" "My Name"
    > npx @liquicode/server-kit-cli --name MyServer login user@server "my password"
    > npx @liquicode/server-kit-cli list
    > npx @liquicode/server-kit-cli --log list ServerAccounts
    > npx @liquicode/server-kit-cli call ServerAccounts.StorageFindOne
~~~

