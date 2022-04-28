#!/bin/bash

while IFS=, read -r field1 url field3 field4 field5 size field7
do
  if [[ $url == *"http"* ]]; then

    if [ "$size" -le "200000" ]; then
            echo $size
    fi

  fi
done < dataset/60k_php_dataset_for_labelling.csv
