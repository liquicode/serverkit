# ServerKit
***(v0.0.24)***


A Different Kind of Web Framework
---------------------------------------------------------------------

This purpose of this library is to facilitate the development of API and Application servers built on NodeJS.
ServerKit handles all of the plumbing to get your services online and usable.

ServerKit is easy to use, provides a simple way to get started with a new web project,
and has many features to assist you in developing and debugging your services.


Why Another Framework?
---------------------------------------------------------------------

When starting a new web project, I had this big ball of code that I would start with.
Then, I would spend time and energy doing search/replaces within the code,
removing stuff I didn't need, adding stuff I did need, etc.
It was either that, or start from scratch, or use someone else's big ball of code generated from their tools.
I found that this time and energy often overwhelmed much of the motivation or curiosity
which inspired the original idea in the first place.
Unable to find an easier way to get started, I built ServerKit.


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

ServerKit has a vast number of features which are all controlled through ServerKit's configuration system.
Configuration settings can be supplied in code and/or a set of confgiuration files.
All configuration settings have sensible defaults which means that you need only to
customize the settings of features that you are using.
All other ServerKit features will work just fine using their defaults.
You can provide configuration blocks and defaults for services that you write.

***Conventions Used***

ServerKit requires the use of an ApplicationFolder.
The path to this folder is provided when creating a new ServerKit Server.
This location stores authored services, configuration files, and any ServerKit generated content.
All filenames or paths that are specified in the configuration settings, are specified relative to the ApplicationFolder.
You can use ServerKit to generate configuration files, client api files, and even starter websites.
All of these generated files will also be written under the ApplicationFolder.


Getting Started
---------------------------------------------------------------------

Install via NPM:
```bash
npm install @liquicode/lib-server-kit
```

```javascript
// Include the library in your source code
const SERVER_KIT = require( '@liquicode/lib-server-kit' );

// Create a new server by supplying the Server's name and its root folder.
let server = SERVER_KIT.NewServer( 'MyServer', __dirname );
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


ServerKit Features
---------------------------------------------------------------------

***Server Functions***

- Create a new working server in minutes.
- The Server lifecycle is controlled entirely by your application.
- Ships with the Authentication service to handle user logins and sessions.
- Ships with the ServerAccounts service to manage user accounts.
- Authorize user access (via user roles) on a per-function basis.
- Ships with the Web transport for http based communication.
- The Web transport enables service Views which are like callable html pages.
- Support for popular view engines (pug, jade, ejs).
- Views have access to user info and application variables within the view templates.
- Ships with the Amqp transport for communication utilizing a message queue.
- Supports various storage mechanisms available to fit different scenarios.
- Mongo based storage and querying for user-owned data in any storage service.
- Full CLI support allows your services to be used from the command line.
- ... virtually every aspect of ServerKit is controlled by configuration settings.
- ... all with copious and verbose logging (also configurable).

***Development Features***

- Develop your application services as reusable components and let ServerKit handle the rest.
- Each service defines which user roles can call it.
- Each service defines which transport "verbs" it will be callable from (e.g. http-get, socket-call, etc.).
- Removes most, if not all, of the overhead concerning user management, authentication, etc.
- Predefined user roles `admin`, `super`, `public`, and `anon`.
- Use the `Text` transport to debug and test your services from the command line.
- Use the `Text` transport to develop a CLI for your services.
- Use the `StorageService` base class to handle CRUD operations for user-owned data.
	- Every data item is owned by a user so its like each user has their own database.
	- Users can share data items they own with other users.
	- Use MongoDB-like query criteria to access and manipulate user data.
	- Multiple storage providers available for memory, file, and MongoDB storage.
- Flexible and hierarchical configuration system
	- Store your configuration settings in configuration files and/or modify them in code.
	- All configuration settings have sensible defaults, change only what you need.
- Develop an `ApplicationService` to expose functions to your clients.
	- Service functions are callable via any transport.
	- Function definitions and parameters are fully configurable.
	- Web pages look like functions that can be rendered with parameters sent from the client.
- 100% client framework agnostic; build your web pages however you want.
- Generation of client API files that can call your services from the client.
- The `Web` transport has a "view core" feature which generates a fully functioning web site for you.
	- Login and Signup pages
	- Generic List and Item pages to perform all CRUD for a `StorageService`.
	- An API Explorer page to inspect and test all of your service functions.
- Verbose and meaningful (and configurable) logging.
- 


Project Links
---------------------------------------------------------------------

- [Library NPM Page](https://www.npmjs.com/package/@liquicode/lib-server-kit)
- [Library Source Code](https://github.com/liquicode/lib-server-kit)

Support

- [Samples](https://github.com/liquicode/lib-server-kit-samples)
- [Documentation](http://lib-server-kit.liquicode.com)
- [Support Forum](http://guilded.gg/liquicode)


Dependencies
---------------------------------------------------------------------

*(wip)*


Notices
---------------------------------------------------------------------

*(wip)*

