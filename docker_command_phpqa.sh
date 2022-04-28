docker run --rm -v $FULL_REPO_PATH:/app -v  $FULL_OUTPUT_PATH:/analysis \
zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools phpmetrics \
--analyzedDirs /app --buildDir /analysis/$NAME