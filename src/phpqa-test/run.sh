#!/bin/bash

docker run --user $(id -u):$(id -g) --rm -v "$PWD/code":/app -v "$PWD/analysis":/analysis \
-v "$PWD/.phpqa.yml":/config-phpqa/.phpqa.yml \
zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc \
--ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library --config /config-phpqa \
--analyzedDirs /app --buildDir /analysis/code
