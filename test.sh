#!/bin/bash

while IFS=, read -r field1 url field3
do
  if [[ $url == *"http"* ]]; then

    file_path=$(echo ${url} | cut -d/ -f2- | cut -d/ -f2- | cut -d/ -f2- | cut -d? -f1)
    git_folder=$(echo ${file_path} | cut -d/ -f1)
    echo $file_path
    echo $git_folder

  fi
done < dataset/60k_php_dataset_for_labelling.csv
