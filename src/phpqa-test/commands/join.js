const config = require('../config/app');

/**
 *
 * @param {{
 *   filepath: '/home/cvaize/PhpstormProjects/commands/dataset/60k_php_dataset_metrics.csv',
 *   basename: '60k_php_dataset_metrics.csv',
 *   filename: '60k_php_dataset_metrics',
 *   extname: '.csv',
 *   folder: '/home/cvaize/PhpstormProjects/commands/dataset/60k_php_dataset_metrics',
 *   codeFolder: '/home/cvaize/PhpstormProjects/commands/dataset/60k_php_dataset_metrics/code',
 *   analysesFolder: '/home/cvaize/PhpstormProjects/commands/dataset/60k_php_dataset_metrics/analyses',
 *   group: 'chunk',
 *   chunksCount: 4,
 *   columnSizeKey: 'diskUsage (kb)',
 *   sizeLimit: 200000,
 *   phpqaConfigFilepath: '/home/cvaize/PhpstormProjects/commands/src/phpqa-test/.phpqa.yml'
 * }} args
 * @returns {Promise<void>}
 */
async function join(args) {
    console.log(args)



}

module.exports = join;