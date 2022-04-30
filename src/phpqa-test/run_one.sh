ROOT_PWD="$PWD/../.." && \
rm -rf "${ROOT_PWD}/code" && \
rm -rf "${ROOT_PWD}/analysis" && \
mkdir -p "${ROOT_PWD}/analysis" && \
git clone https://github.com/cvaize/TestWork-834405 "${ROOT_PWD}/code" && \
find "${ROOT_PWD}/code" -type d -iname "*test*" -prune -exec rm -rf {} \; && \
find "${ROOT_PWD}/code" -iname "*test*.*" -exec rm -rf {} \; && \
docker run --user $(id -u):$(id -g) --rm -v "${ROOT_PWD}/code":/app -v "${ROOT_PWD}/analysis":/analysis \
-v "$PWD/.phpqa.yml":/config-phpqa/.phpqa.yml \
zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc \
--ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library --config /config-phpqa \
--analyzedDirs /app --buildDir /analysis/code && \
docker run --user $(id -u):$(id -g) -it --rm -v "$PWD":/app -v "${ROOT_PWD}/analysis":/analysis -w /app node node app.js