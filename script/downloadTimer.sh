#!/bin/bash

helpFunction(){
   echo "------------------------------Help-Info------------------------------"
   echo "Usage: ./downloadTimer.sh &"
   echo "An shell script to log information every n(default: 5) seconds during a download process of 'curl'"
   echo -e "\t-o <file> Write output to <file> instead of stdout (COMPULSORY)"
   echo -e "\t-u <url> Specify your download URL (COMPULSORY)"
   echo -e "\t-i <interval> run du -h <file> during Download every <internal> seconds. DEFAULT:5 (OPTIONAL)"
   echo -e "\t-l <logFile> log information during Download to <logFile> besides stdout (OPTIONAL)"
   exit 1
}

while getopts "o:u:i:l:" flag
do
   case "$flag" in
      o ) parO="$OPTARG" ;;
      u ) parU="$OPTARG" ;;
      i ) parI="$OPTARG" ;;
      l ) parL="$OPTARG" ;;
   esac
done

if [[ -z "$parO" ]] && [[ -z "$parU" ]]; then
  echo "Output file pathname and Download URL are missing!"
  helpFunction
elif [[ -z "$parO" ]]; then
  echo "Output file pathname is missing!"
  helpFunction
elif [[ -z "$parU" ]]; then
  echo "Download URL is missing!"
  helpFunction
fi

if [[ -z "$parI" ]]; then
  parI=5
else
  #define the regex of a valid numerical time interval
  timeRE='^[1-9][0-9]*'
  if ! [[ $parI =~ $timeRE ]] ; then #if the regex isn't matched
    echo "error: The time interval that you specified is invalid"
    helpFunction
  fi
fi

if [[ -z "$parL" ]]; then #stdout only
  dlTime=0
  curl -sSL $parU -o $parO & curlID=$! 2>&1
  # 'kill -0' doesn't actually send any signal to the process, but it does check whether a signal could be sent — and it can't be sent if the process no longer exists.
  while kill -0 $curlID >/dev/null 2>&1; do
    echo "PID of curl process for download: ${curlID}"
    echo "Download time: ${dlTime}s"
    du -h $parO
    sleep $parI && dlTime=$((dlTime+parI))
  done
  unset dlTime curlID
  echo "Download finished!"
  unset parO parU parI
else #stdout and stderr into the specified log file
  dlTime=0
  curl -sSL $parU -o $parO & curlID=$! >> ./$parL 2>&1
  while kill -0 $curlID >/dev/null 2>&1; do
    echo "PID of curl process for download: ${curlID}" >> ./$parL
    echo "Download time: ${dlTime}s" >> ./$parL
    du -h $parO >> ./$parL
    sleep $parI && dlTime=$((dlTime+parI))
    done
  unset dlTime curlID
  echo "Download finished! Log file is at ${parL}"
  unset parO parU parL parI
fi
