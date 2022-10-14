FROM		node:14
LABEL		name="@liquicode/serverkit"
LABEL		description="ServerKit (v0.0.26)"

# Set timezone
# RUN			mv /etc/localtime /etc/localtime.backup
# RUN			ln -s /usr/share/zoneinfo/CST6CDT /etc/localtime
# RUN			ln -s /usr/share/zoneinfo/EST5EDT /etc/localtime

# Copy source files
COPY		./src				/home/serverkit/src

# Copy support files
COPY		./package.json		/home/serverkit/package.json
COPY		./readme.md			/home/serverkit/readme.md
COPY		./license.md		/home/serverkit/license.md
COPY		./VERSION			/home/serverkit/VERSION

# NPM Install
WORKDIR		/home/serverkit
RUN			npm install -P

# Expose Default Port for Web
EXPOSE 8080
# Expose Default Port for WebSocket
EXPOSE 8081

# Set the Entrypoint
ENTRYPOINT [ "node", "src/serverkit.js" ]

# docker run -it --mount type=bind,target=/serverkit-data,source=W:\code-projects\orgs\liquicode\apps\serverkit.git\~samples\MathsServer serverkit --name MathsServer --folder /data
