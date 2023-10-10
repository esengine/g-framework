@echo off
set sourceDir=source\bin
set destinationDir=client-test\lib

xcopy "%sourceDir%\*" "%destinationDir%\" /s /i /y