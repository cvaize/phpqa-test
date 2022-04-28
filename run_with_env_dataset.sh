#!/bin/bash

while IFS=, read -r field1 url field3 field4 field5 size field7
do
  if [[ $url == *"http"* ]]; then

    file_path=$(echo ${url} | cut -d/ -f2- | cut -d/ -f2- | cut -d/ -f2- | cut -d? -f1)

    if [ "$size" -le "200000" ]; then
        if [ -f "./dataset/analysis/${file_path}/phpmetrics.html" ]; then
            echo ""
            echo "Analises exists ./dataset/analysis/${file_path}/phpmetrics.html"
            echo ""
        else
            echo $file_path
            mkdir -p ./dataset/analysis/${file_path}

            rm -rf code
            git clone "$url" code
            find ./code -type d -iname "*test*" -prune -exec rm -rf {} \;
            find ./code -iname "*test*.*" -exec rm -rf {} \;
            docker run --user $(id -u):$(id -g) --rm -v "$PWD/code":/app -v  "$PWD/dataset/analysis/${file_path}":/analysis \
            zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools phpmetrics \
            --ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library \
            --analyzedDirs /app --buildDir /analysis
        fi
    else
        echo ""
        echo "Invalid size ${size} > 200000 - ${file_path}"
        echo ""
    fi
    
  fi
done < dataset/60k_php_dataset_for_labelling.csv
