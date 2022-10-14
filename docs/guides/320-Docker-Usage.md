
# Docker Usage

You can find the standard docker image of ServerKit [here](https://hub.docker.com/r/agbowlin/serverkit).

This image exposes port 8080 (for Web traffic) and 8081 (for WebSocket traffic).
and requires that the server's main folder is mounted on the running container.

If you need to run different ports, you will have to modify the docker build script below and build a custom image.


Basic Usage
---------------------------------------------------------------------

For example, to run the MathsServer sample, we need to specify the path
to the MathServer folder and also publish the ports we need for Web and WebSocket transports.

You could use the following Docker call in a script:

~~~bash
# run-maths.sh:
docker run -it                                       \
	--name MathsServer                               \ # container name (optional)
	--publish 80:8080/tcp                            \ # Web traffic on port 80
	--publish 81:8081/tcp                            \ # WebSocket traffic on port 81
	--mount type=bind,source=~/MathsServer,target=/server \ # Mount the Server Folder (code and data)
	agbowlin/serverkit                               \ # this docker image
	--folder /server                                 \ # The mounted Server Folder
	--name MathsServer                               \ # Server name (required)
	--options MathsServer.options.json               \ # options file in Server Folder
	$@                                                 # pass rest of command line to SerevrKit
~~~

Then to run the MathsServer, view the log output, and interact with the web components:
~~~bash
bash run-maths.sh --shell run
~~~

Use it to discover available services and functions:
~~~bash
$ bash run-maths.sh list
  Authentication   # <-- services in this server
  ServerAccounts
  ServerManagement
  Maths
$ bash run-maths.sh list Maths
  Add              # <-- service functions/origins
  Subtract
  Multiple
  Divide
~~~

Use it to invoke services from the command line:
~~~bash
$ bash run-maths.sh call Maths.Multiply 6 7
  42 # <-- call the service and prints the answer
~~~

> Aee also: [ServerKit command line usage](111-Server-Cli.md)


Here are some generic scripts which will instantiate a ServerKit server
in your current working directory.
Note that the `--name` parameter is required when running these scripts.

**Linux/Mac**
~~~bash
# serverkit-here.sh:
docker run -it                                      \
	--publish 8080:8080/tcp                         \
	--publish 8081:8081/tcp                         \
	--mount type=bind,source=$(pwd),target=/server  \
	agbowlin/serverkit                              \
	--folder /server                                \
	$@
~~~
~~~bash
# Run serverkit in this folder
bash serverkit-here.sh --name MyServer list
bash serverkit-here.sh --name MyServer run
~~~

**Windows**
~~~bash
# serverkit-here.bat:
docker run -it                                     ^
	--publish 8080:8080/tcp                        ^
	--publish 8081:8081/tcp                        ^
	--mount type=bind,source=%cd%,target=/server   ^
	agbowlin/serverkit                             ^
	--folder /server                               ^
	%*
~~~
~~~bash
# Run serverkit in this folder
serverkit-here.bat --name MyServer run
~~~


Docker Build Script
---------------------------------------------------------------------

~~~docker
FROM		node:14
LABEL		name="@liquicode/serverkit"

# Install ServerKit
WORKDIR		/home/serverkit
RUN			npm init -Y
RUN			npm install @liquicode/serverkit

# Expose default port for Web traffic
EXPOSE 8080
# Expose default port for WebSocket traffic
EXPOSE 8081

# Set the Entrypoint
ENTRYPOINT [ "npx", "@liquicode/serverkit" ]
~~~

