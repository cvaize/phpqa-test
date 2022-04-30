#!/bin/bash

# https://unix.stackexchange.com/questions/103920/parallelize-a-bash-for-loop

open_sem(){
    mkfifo pipe-$$
    exec 3<>pipe-$$
    rm pipe-$$
    local i=$1
    for((;i>0;i--)); do
        printf %s 000 >&3
    done
}

# run the given command asynchronously and pop/push tokens
run_with_lock(){
    local x
    # this read waits until there is something to read
    read -u 3 -n 3 x && ((0==x)) || exit $x
    (
     ( "$@"; )
    # push the return code of the command to the semaphore
    printf '%.3d' $? >&3
    )&
}

task(){
    if [ -d "./dataset/analysis/${1}" ]; then
      cp -rf ./dataset/analysis/${1} ./dataset/analysis/${1}-clone
    else
      mkdir -p ./dataset/analysis/${1}
    fi

    rm -rf ./dataset/code/${1}
    git clone "$url" ./dataset/code/${1} </dev/null &>/dev/null
    find ./dataset/code/${1} -type d -iname "*test*" -prune -exec rm -rf {} \;
    find ./dataset/code/${1} -iname "*test*.*" -exec rm -rf {} \;
    docker run --user $(id -u):$(id -g) --rm -v "$PWD/dataset/code/${1}":/app -v  "$PWD/dataset/analysis/${1}":/analysis \
    -v "$PWD/.phpqa.yml":/config-phpqa/.phpqa.yml \
    zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools ${2} \
    --ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library --config /config-phpqa \
    --analyzedDirs /app --buildDir /analysis </dev/null &>/dev/null
    rm -rf ./dataset/code/${1}

    if [ -d "./dataset/analysis/${1}-clone" ]; then
      cp -rf ./dataset/analysis/${1}-clone/* ./dataset/analysis/${1}
      rm -rf ./dataset/analysis/${1}-clone
    fi
}

while IFS=, read -r field1 url field3 field4 field5 size field7
do
  if [[ $url == *"http"* ]]; then

    file_path=$(echo ${url} | cut -d/ -f2- | cut -d/ -f2- | cut -d/ -f2- | cut -d? -f1)
    git_folder=$(echo ${file_path} | cut -d/ -f1)
    if [ "$size" -le "200000" ]; then
      need_tools=""
      if [ ! -f "./dataset/analysis/${file_path}/phpmetrics.html" ] || [ ! -f "./dataset/analysis/${file_path}/phpmetrics.xml" ]; then
        if [ ! -z "$need_tools" ]; then
          need_tools="${need_tools},"
        fi
        need_tools="${need_tools}phpmetrics"
      fi
      if [ ! -f "./dataset/analysis/${file_path}/phploc.xml" ]; then
        if [ ! -z "$need_tools" ]; then
          need_tools="${need_tools},"
        fi
        need_tools="${need_tools}phploc"
      fi
      if [ ! -f "./dataset/analysis/${file_path}/checkstyle.xml" ]; then
        if [ ! -z "$need_tools" ]; then
          need_tools="${need_tools},"
        fi
        need_tools="${need_tools}phpcs"
      fi
      if [ ! -f "./dataset/analysis/${file_path}/phpcpd.xml" ]; then
        if [ ! -z "$need_tools" ]; then
          need_tools="${need_tools},"
        fi
        need_tools="${need_tools}phpcpd"
      fi
      if [ ! -f "./dataset/analysis/${file_path}/pdepend-pyramid.svg" ]; then
        if [ ! -z "$need_tools" ]; then
          need_tools="${need_tools},"
        fi
        need_tools="${need_tools}pdepend"
      fi
      if [ ! -f "./dataset/analysis/${file_path}/phpmd.xml" ]; then
        if [ ! -z "$need_tools" ]; then
          need_tools="${need_tools},"
        fi
        need_tools="${need_tools}phpmd"
      fi
      if [ ! -z "$need_tools" ]; then
        N=4
        open_sem $N
        run_with_lock task $file_path $need_tools
      fi
    else
        echo "Invalid size ${size} > 200000 - ${file_path}"
    fi

  fi
done < dataset/60k_php_dataset_metrics.csv
