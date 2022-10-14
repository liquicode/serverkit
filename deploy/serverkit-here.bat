@echo off

docker run -it										^
	--publish 8080:8080/tcp							^
	--publish 8081:8081/tcp							^
	--mount type=bind,source=%cd%,target=/server	^
	agbowlin/serverkit								^
	--folder /server								^
	%*
