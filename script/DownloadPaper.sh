#! /usr/bin/bash

cat ../preliminary/Papers/pdf_links.txt|while read line;do
  title=$(echo $line|cut -d " " -f 1)
  url=$(echo $line|cut -d " " -f 2)
  if [[ ! -f  ../preliminary/Papers/${title}.pdf ]];then
    curl -SL ${url} -o ../preliminary/Papers/${title}.pdf
  fi
done
unset url title
