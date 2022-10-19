# ServerKit
***(v0.0.30)***


A Different Kind of Web Framework
---------------------------------------------------------------------

ServerKit facilitate the development of API and Application servers built on NodeJS.
It handles all of the plumbing to get your services online and usable.

ServerKit is easy to use, provides a simple way to get started with a new web project,
and has many features to assist you in the development and debugging of your services.


Why Another Framework?
---------------------------------------------------------------------

When starting a new web project, I had this big ball of code that I would use to start with.
Then, I would spend time and energy doing search/replaces within the code,
removing stuff I didn't need, adding stuff I did need, etc.
It was either that, or start from scratch, or use someone else's big ball of code generated from their tools.
I found that this time and energy often overwhelmed much of the motivation or curiosity
which inspired the original idea in the first place.
Unable to find an easier way to get started, I built ServerKit.
I hope that you also find ServerKit to be a valuable starting point for your projects as well.


How It Works
---------------------------------------------------------------------

ServerKit bundles together a number of technologies that allow you to write services that work
over the web (http), web sockets, message queues, and even the command line.

***Transport Agnostic Services***

You write the hosted service by defining service functions and describing how to call them.
ServerKit manages the interactions needed to authenticate users, authorize function invocations,
and transfer data between client and server.
Your service functions are transport-agnostic.

***Dynamic Configuration System***

ServerKit uses a number of well known and established libraries (such as [Express](https://expressjs.com/))
and has a vast number of features which are all controlled through ServerKit's configuration system.
Configuration settings can be supplied within code and/or configuration files.
All configuration settings have sensible defaults which means that you need only
customize the settings and features that you are using in your project.
All other ServerKit features will work just fine using their defaults.
When you write your own services, you will provide a configuration block that contains the configuration options for your service.
These options are included in ServerKit's configuration, allowing you to keep all configuration settings in one place.

***Conventions Used***

ServerKit requires the use of an ApplicationFolder.
The path to this folder is provided when creating a new ServerKit Server.
This location stores authored services, configuration files, and any ServerKit generated content.
All filenames or paths that are specified in the configuration settings, are specified relative to the ApplicationFolder.
You can use ServerKit to generate configuration files, client api files, and even starter websites.
All of these generated files will also be written under the ApplicationFolder.


Getting Started
---------------------------------------------------------------------

There are several ways to get started with ServerKit.
You can use it as a NodeJS library or you can run it from the command line.

***ServerKit as a Library***

You can run ServerKit as a library to have complete control over server's lifecycle.

Install via NPM:
```bash
npm install @liquicode/serverkit
```

```javascript
// Include the library into your project
const ServerKit = require( '@liquicode/serverkit' );

// Set some configuration options.
let server_options = {
	AppInfo: {
		environment: "development"
	},
	Transports: {
		Web: {
			ServerAddress: {
				port: 4200
			}
		}
};

// Create a new server by supplying the Server's name, the Application Folder, and some settings.
let server = ServerKit.NewServer( 'MyServer', __dirname, server_options );
// - The server is created.
// - Configuration Defaults and Settings have been calculated.
// - No Services or Transports have been initialized.

// Initialize the server
await server.Initialize();
// - Services and Transports are initialized.
// - Services and Transports are ready for internal consumption.

// Start the server
await server.Startup();
// - Services and Transports are started.
// - Services can be called remotely via Transports (e.g. Web, WebSocket).

// Wait for some signal to stop the server ...

// Stop the server
await server.Shutdown();
```

***ServerKit as an Application***

You can run ServerKit as an application to publish your custom services.
Your service and configuration files will exist within the Application Folder:

~~~
~/MathsServer                           <-- Application Folder
	MathsServer.options.json            <-- Server Options (js or json)
	MathsService.js                     <-- Custom Service
~~~

Run using NPX:
```bash
npm install @liquicode/serverkit
npx serverkit --name MathsServer --folder ~/MathsServer --options MathsServer.options.js
```

Run without Installation:
```bash
npx @liquicode/serverkit --name MathsServer --folder ~/MathsServer --options MathsServer.options.js
```

Run as a Docker Container:
```bash
docker run --mount type=bind,source=~/MathsServer,target=/server agbowlin/serverkit --name MathsServer --folder /server
#                  ^ use the ~/MathsServer folder               ^ image name        ^ serverkit arguments
```


ServerKit Features
---------------------------------------------------------------------

***Server Features***

- Create a new working server in minutes.
- The Server lifecycle is controlled entirely by your application.
- Ships with the `Authentication` service to handle user logins and sessions.
- Ships with the `ServerAccounts` service to manage user accounts.
- Authorize user access (via user roles) on a per-function basis.
- Ships with the `Web` transport for http based communication.
- The `Web` transport has Service Views which are like paramterized web pages.
- Support for popular templating view engines (pug, jade, ejs).
- Service Views can access user and application info from within the template.
- Ships with the `WebSocket` transport for communication utilizing web sockets.
- Ships with the `Amqp` transport for communication utilizing a message queue.
- Storage Services offer a user-based storage system that handles data ownership and sharing for you.
- Supports various storage mechanisms available to fit different scenarios (memory, local, remote).
- Full CLI support allows your services to be usable from the command line.
- ... virtually every aspect of ServerKit is controlled by configuration settings.
- ... all with copious and verbose logging (also configurable).

***Development Features***

Reusability

Once a ServerKit service authored, it can be used anywhere.

- Develop your application services as reusable components and let ServerKit handle the rest.
- Services are self-contained js files that can be managed seperately from the core server code (i.e. ServerKit).
- Once a service is written, it can be used with any transport (Text, Web, etc.) and in any scenario.
- A service can easily be copied to and used by another ServerKit project.

Security

ServerKit has a system of users and user roles which control access to service calls.

- Each service endpoint defines which user roles can call it.
- Each service endpoint defines which transport "verbs" it will be callable from (e.g. http-get, socket-call, etc.).
- Removes most, if not all, of the overhead concerning user management, authentication, etc.
- Predefined user roles `admin`, `super`, `user`, and `anon`.

Versatility

ServerKit ships with transports that allow your services to be called from various platforms.

- Use the `Text` transport to debug and test your services from the command line.
- Use the `Text` transport to develop a CLI for your services.
- Use the `Web` transport to develop http-based API servers.
- Use the `Web` and `WebSocket` transports to develop dynamic websites.
- Use the `Amqp` transport to invoke long running tasks (e.g. data backup).

Storage

The `StorageService` base class handles CRUD operations for user-owned data.

- Every data item is owned by a user so its like each user has their own database.
- End users can share data items to other users.
- Use MongoDB-like query criteria to access and manipulate user data.
- Storage providers are available for memory, local, and remote storage.

Configuration

ServerKit has a flexible and hierarchical configuration system.

- Store your configuration settings in configuration files and/or modify them in code.
- All configuration settings have sensible defaults, change only what you need.
- Configuration files can be independently managed for different environments (development, production, etc.).
- Configuration can also be modified in code.

User Interface

The ServerKit `Web` transport has a View Core feature to give you a fully functioning user interface for your services.

- Login and Signup pages
- Generic List and Item pages to perform all CRUD for a `StorageService` based service.
- An API Explorer page to inspect and ad-hoc test all of your service functions.
- Generation of client API files to call your services from the browser.
- 100% client framework agnostic; build your web pages however you want.
- Extend or replace any portion of it, it's just a starting point.
- Web pages can take parameters, making them look like a function call and providing dynamic content.

Logging

ServerKit has a built in logging mechanism.

- Every process within ServerKit is logged.
- All service calls and parameters are logged so that you can see what's going on outside of your service.
- Configure log output to view trace and debug information or just warnings and errors.
- Log to the console and/or files.


Project Links
---------------------------------------------------------------------

Distributions

- [Source](https://github.com/liquicode/serverkit): Source code hosted on github.
- [NPM](https://www.npmjs.com/package/@liquicode/serverkit): The NodeJS npm package.
- [Docker](https://hub.docker.com/r/agbowlin/serverkit): The docker version of serverkit.

Support

- [Docs](http://docs.serverkit.net): Documentation
- [Wiki](https://wiki.serverkit.net): Documentation
- [Samples](https://github.com/liquicode/serverkit-samples): Sample code and projects.
- [Forums](http://guilded.gg/liquicode): Q&A, Discussion Forums.


Dependencies
---------------------------------------------------------------------

*(wip)*


Notices
---------------------------------------------------------------------

*(wip)*

