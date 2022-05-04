const getRunArgs = require('./run');

const args = [
    { // Группа
        type: 'string',
        name: 'group',
        short: 'g'
    },
    { // Количество частей
        type: 'uinteger',
        name: 'chunks',
        short: 'ch'
    },
];

/**
 * @param {string[]} argv
 * @returns {{
 *   filepath: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv',
 *   tools: [ 'phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc' ],
 *   columns: { link: 'link', size: 'diskUsage (kb)' },
 *   phpqaConfigFilepath: '/home/cvaize/PhpstormProjects/datasince/commands/src/phpqa-test/.phpqa.yml',
 *   sizeLimit: 200000
 * }}
 */
function getArgs(argv, ArgParser) {
    let group;
    let chunksCount;

    let result = getRunArgs(argv, {
        parse(argv, argsSettings) {
            argsSettings.args = argsSettings.args.concat(args);

            const params = ArgParser.parse(argv, argsSettings);

            group = params.args.group;
            chunksCount = params.args.chunks;

            return params;
        }
    });

    if (!group) {
        throw new Error('Укажите группу.')
    }
    if (!chunksCount) {
        throw new Error('Укажите количество частей.')
    }

    result.group = group;
    result.chunksCount = chunksCount;

    return result;
}

module.exports = getArgs;
