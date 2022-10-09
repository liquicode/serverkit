@echo off

docker run -it										^
	--publish 8080:8080/tcp							^
	--publish 8081:8081/tcp							^
	--name server-kit.liquicode.com					^
	--mount type=bind,source=%cd%,target=/server	^
	server-kit.liquicode.com						^
	/bin/bash
