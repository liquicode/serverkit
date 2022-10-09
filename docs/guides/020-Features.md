
# Features Overview


Server Functionality
---------------------------------------------------------------------

- Create a working API server within minutes.
- Full CLI makes your services callable from the command line.
- Start and stop the entire server process within your application.
- Loads and configures all server components (ExpressJS, socket.io, etc.).
- Connect various transport endpoints to your application functions.
- Built-in authentication management.
- Built-in session management (memory, file, database).
- Authorize user access (via user roles) on a per-function basis.
- Support for different view engines (pug, jade, ejs).
- Access to user info and application variables within view templates.
- ... virtually every aspect of Server-Kit is controlled by configuration settings.
- ... all with copious and verbose logging (also configurable).


Application Development
---------------------------------------------------------------------

- Develop your application services as reusable components and let Server-Kit handle the rest.
- Each service defines which user roles can call it.
- Each service defines which transport "verbs" it will be callable from (e.g. http-get, socket-call, etc.).
- Removes most, if not all, of the overhead concerning user management, authentication, etc.
- Predefined user roles `admin`, `super`, `public`, and `anon`.
- Use the `Text` transport to debug and test your services from the command line.
- Use the `Text` transport to develop a CLI for your services.
- Use the `StorageService` base class to handle CRUD operations for user data.
	- Every data item is owned by a user so its like each user has their own database.
	- Users can share data items they own with other users.
	- Use MongoDB-like query criteria to access and manipulate user data.
	- Multiple storage providers available for memory, file, and MongoDB storage.
- Flexible and hierarchical configuration system
	- Store your configuration settings in configuration files and/or modify them in code.
	- All configuration settings have sensible defaults, change only what you need.
- Develop an `ApplicationService` to expose functions to your client.
	- Service functions are callable via any transport.
	- Function definitions and paramters are fully configurable
	- Web pages look like functions that can be rendered with parameters sent from the client
- 100% client framework agnostic; build your web pages however you want.
- Automatic generation of client API files that call your services on any transport.
- The `Web` transport has a "view core" feature which generates a fully functioning web site for you.
	- Login and Signup pages
	- Generic List and Item pages to perform all CRUD for any `StorageService`.
	- An API Explorer page to inspect and test all of your service functions.
- Services are self-documenting.

