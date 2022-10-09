FROM		node:12.22
LABEL		name="@liquicode/server-kit"
LABEL		description="scraper.data-pearl.com"

# Set timezone
RUN			mv /etc/localtime /etc/localtime.backup
# RUN			ln -s /usr/share/zoneinfo/CST6CDT /etc/localtime
RUN			ln -s /usr/share/zoneinfo/EST5EDT /etc/localtime

# Copy source files
COPY		./src				/home/server-kit/src
# Copy support files
COPY		./package.json		/home/server-kit/package.json
COPY		./readme.md			/home/server-kit/readme.md
COPY		./license.md		/home/server-kit/license.md
COPY		./VERSION			/home/server-kit/VERSION

WORKDIR		/home/server-kit
RUN			npm install -P

# Expose Port for Web
EXPOSE 8080
# Expose Port for WebSocket
EXPOSE 8081

CMD [ "node", "src/server-kit.js",				\
		"--ServerName", "ServerKit,				\
		"--ServerFolder", "/server",			\
	]
