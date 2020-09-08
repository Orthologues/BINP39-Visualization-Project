# add '''
#     PATH+=":/home/jiawei/Desktop/github-repo/BINP39"
#     update_sh_history.sh 1>/dev/null 2>&1
#     PATH=$(echo $PATH|sed -e 's/:\/home\/jiawei\/Desktop\/github-repo\/BINP39//')
#     '''
# into ~/.bashrc first to activate this script
cd /home/jiawei/Desktop/github-repo/BINP39
sh_last_linecount=$(cat /home/jiawei/.count_last_bash_history)
sh_linecount=$(wc -l /home/jiawei/.bash_history|cut -d " " -f 1)
if [[ ! "$sh_linecount" == "$sh_last_linecount" ]];then
  mkdir -p ./log
  cp /home/jiawei/.bash_history ./log/bash_history_jw
  git add ./log/bash_history_jw
  git commit -m "automatically update my ubuntu bash history at office"
  git push origin master
  echo $sh_linecount > /home/jiawei/.count_last_bash_history
fi
unset sh_last_linecount
unset sh_linecount
