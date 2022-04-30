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
          echo $need_tools;
        fi

    else
        echo "Invalid size ${size} > 200000 - ${file_path}"
    fi

  fi
done < dataset/60k_php_dataset_metrics.csv
