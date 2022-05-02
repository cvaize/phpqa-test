rm -rf code && \
rm -rf analysis && \
mkdir -p analysis && \
git clone $GIT_URL code && \
docker run --user $(id -u):$(id -g) --rm -v "$PWD/code":/app -v  "$PWD/analysis":/analysis \
zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc \
--ignoredDirs build,vendor \
--analyzedDirs /app --buildDir /analysis/code && \
docker run --user $(id -u):$(id -g) -it --rm -v "$PWD":/usr/src/app -w /usr/src/app node node app.js