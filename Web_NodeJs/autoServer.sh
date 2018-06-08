#!/bin/bash

timer=3600

clear
echo "Starting autoServer.sh ... "
pidProcess=""

while sleep $timer 
do
	pidProcess=$(pidof node)
	if [ -z $pidProcess ]; then
		date
		echo "Starting server"
    	node app.js
	fi
done