#!/bin/bash

while IFS=, read -r field1 url field3 field4 field5 size field7
do
  if [[ $url == *"http"* ]]; then

    file_path=$(echo ${url} | cut -d/ -f2- | cut -d/ -f2- | cut -d/ -f2- | cut -d? -f1)

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
          echo "$file_path - $need_tools"

          if [ -d "./dataset/analysis/${file_path}" ]; then
            cp -rf ./dataset/analysis/${file_path} ./dataset/analysis/${file_path}-clone
          else
            mkdir -p ./dataset/analysis/${file_path}
          fi

          rm -rf code
          git clone "$url" code
          find ./code -type d -iname "*test*" -prune -exec rm -rf {} \;
          find ./code -iname "*test*.*" -exec rm -rf {} \;
          docker run --user $(id -u):$(id -g) --rm -v "$PWD/code":/app -v  "$PWD/dataset/analysis/${file_path}":/analysis \
          -v "$PWD/.phpqa.yml":/config-phpqa/.phpqa.yml \
          zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools $need_tools \
          --ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library --config /config-phpqa \
          --analyzedDirs /app --buildDir /analysis

          if [ -d "./dataset/analysis/${file_path}-clone" ]; then
            cp -rf ./dataset/analysis/${file_path}-clone/* ./dataset/analysis/${file_path}
            rm -rf ./dataset/analysis/${file_path}-clone
          fi
        fi

    else
        echo "Invalid size ${size} > 200000 - ${file_path}"
    fi
    
  fi
done < dataset/60k_php_dataset_metrics.csv
