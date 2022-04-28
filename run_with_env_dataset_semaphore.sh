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
    mkdir -p ./dataset/analysis/${1}
    rm -rf ./dataset/code/${1}
    git clone "$url" ./dataset/code/${1}
    find ./dataset/code/${1} -type d -iname "*test*" -prune -exec rm -rf {} \;
    find ./dataset/code/${1} -iname "*test*.*" -exec rm -rf {} \;
    docker run --user $(id -u):$(id -g) --rm -v "$PWD/dataset/code/${1}":/app -v  "$PWD/dataset/analysis/${1}":/analysis \
    zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools phpmetrics \
    --ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library \
    --analyzedDirs /app --buildDir /analysis
    rm -rf ./dataset/code/${2}
}

while IFS=, read -r field1 url field3
do
  if [[ $url == *"http"* ]]; then

    file_path=$(echo ${url} | cut -d/ -f2- | cut -d/ -f2- | cut -d/ -f2- | cut -d? -f1)
    git_folder=$(echo ${file_path} | cut -d/ -f1)
    if [ -f "./dataset/analysis/${file_path}/phpmetrics.html" ]; then
        echo ""
        echo "Analises exists ./dataset/analysis/${file_path}/phpmetrics.html"
        echo ""
    else
        N=4
        open_sem $N
        run_with_lock task $file_path $git_folder
    fi

  fi
done < dataset/60k_php_dataset_for_labelling.csv
