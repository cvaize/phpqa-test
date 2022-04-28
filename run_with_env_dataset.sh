#!/bin/bash

while IFS=, read -r field1 url field3
do
  if [[ $url == *"http"* ]]; then

    file_path=$(echo ${url} | cut -d/ -f2- | cut -d/ -f2- | cut -d/ -f2- | cut -d? -f1)
    echo $file_path
    if [ -f "./dataset/analysis/${file_path}/phpmetrics.html" ]; then
        echo ""
        echo "Analises exists ./dataset/analysis/${file_path}/phpmetrics.html"
        echo ""
    else 
    
        mkdir -p ./dataset/analysis/${file_path}

        rm -rf code
        git clone "$url" code
        find ./code -type d -iname "*test*" -prune -exec rm -rf {} \;
        find ./code -iname "*test*.*" -exec rm -rf {} \;
        docker run --user $(id -u):$(id -g) --rm -v "$PWD/code":/app -v  "$PWD/dataset/analysis/${file_path}":/analysis \
        zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc \
        --ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library \
        --analyzedDirs /app --buildDir /analysis
    fi
    
  fi
done < dataset/60k_php_dataset_for_labelling.csv
