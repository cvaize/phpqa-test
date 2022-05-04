const fs = require('../providers/fs');
const copy = require('recursive-copy');
const getChunkName = require('../utils/get-chunk-name');
const transformFolder = require('../utils/transform-folder');
const getFolders = require("../utils/get-folders");


/**
 * @param {{
 *   filepath: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv',
 *   tools: [ 'phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc' ],
 *   columns: { link: 'link', size: 'diskUsage (kb)' },
 *   phpqaConfigFilepath: '/home/cvaize/PhpstormProjects/datasince/commands/src/phpqa-test/.phpqa.yml',
 *   sizeLimit: 200000,
 *   group: 'chunk',
 *   chunksCount: 4
 * }} args
 * @returns {Promise<void>}
 */
async function command(args) {
    let chunksSources = {}
    const folders = getFolders(args.filepath);

    const group = args.group;
    const chunksCount = args.chunksCount;

    for (let i = 0; i < chunksCount; i++) {
        const chunkName = getChunkName(group, i);

        chunksSources[chunkName] = {
            rows: [],
            folders: transformFolder(args.filepath, chunkName)
        };
    }

    let promises = [];
    for (const chunksSourcesKey in chunksSources) {
        const chunksSource = chunksSources[chunksSourcesKey];
        promises.push(fs.unlink(chunksSource.folders.filepath));
        promises.push(fs.exists(chunksSource.folders.analysesFolder).then(is => is && copy(chunksSource.folders.analysesFolder, folders.analysesFolder, {overwrite: true})));
    }

    await Promise.allSettled(promises);

    promises = [];
    for (const chunksSourcesKey in chunksSources) {
        const chunksSource = chunksSources[chunksSourcesKey];
        promises.push(fs.unlink(chunksSource.folders.folder));
    }

    await Promise.allSettled(promises);
}

module.exports = command;