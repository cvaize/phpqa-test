#!/bin/bash

rm -rf dataset/analysis
mkdir -p dataset/analysis

while IFS=, read -r field1 url field3
do
  if [[ $url == *"http"* ]]; then

    file_path=$(echo ${url} | cut -d/ -f2- | cut -d/ -f2- | cut -d/ -f2- | cut -d? -f1)
    mkdir -p ./dataset/analysis/${file_path}

    git clone "$url" code
    find ./code -type d -iname "*test*" -prune -exec rm -rf {} \;
    find ./code -iname "*test*.*" -exec rm -rf {} \;
    docker run --user $(id -u):$(id -g) --rm -v "$PWD/code":/app -v  "$PWD/analysis":/analysis \
    zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc \
    --ignoredDirs build,vendor,tests,lib \
    --analyzedDirs /app --buildDir /analysis/code

    cp -R ./analysis/code ./dataset/analysis/${file_path}
  fi
done < dataset/60k_php_dataset_for_labelling.csv