docker run --rm -v "$PWD/code":/app -v  "$PWD/analysis":/analysis \
zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc \
--ignoredDirs build,vendor,bin,tests \
--analyzedDirs /app --buildDir /analysis/code