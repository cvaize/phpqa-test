const fs = require('../providers/fs');
const childProcess = require('../providers/child-process');
const commonRun = require('./_run');
const copy = require('recursive-copy');
const writeData = require('../utils/write-data');
const getFolders = require('../utils/get-folders');

/**
 * @param {string} group
 * @param {number} index
 * @returns {string}
 */
function getChunkName(group, index) {
    return `${group}-${index}`;
}

/**
 *
 * @param {string} filepath
 * @param {string} name
 * @return {{
 *       "filepath": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv",
 *       "basename": "60k_php_dataset_metrics.csv",
 *       "filename": "60k_php_dataset_metrics",
 *       "extname": ".csv",
 *       "folder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics",
 *       "codeFolder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/code",
 *       "analysesFolder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/analyses"
 *     }}
 */
function transformFolder(filepath, name) {
    filepath = filepath.split('.');

    filepath[filepath.length - 2]+= '-'+name;

    filepath = filepath.join('.');

    return getFolders(filepath);
}

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
    let chunkIndex = 0;
    let chunksSources = {}

    const group = args.group;
    const chunksCount = args.chunksCount;

    for (let i = 0; i < chunksCount; i++) {
        const chunkName = getChunkName(group, i);

        chunksSources[chunkName] = {
            rows: [],
            folders: transformFolder(args.filepath, chunkName)
        };
    }

    await commonRun('Разбитие на части', args, async function (ctx) {
        /**
         * @var {{
         *   "info": {
         *     "length": 9,
         *     "ignoreCount": {
         *       "error": 0,
         *       "sizeLimit": 0
         *     },
         *     "completed": 8
         *   },
         *   "options": {
         *     "args": {
         *       "filepath": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv",
         *       "tools": [
         *         "phpmetrics",
         *         "phpmd",
         *         "pdepend",
         *         "phpcs",
         *         "phpcpd",
         *         "phploc"
         *       ],
         *       "columns": {
         *         "link": "link",
         *         "size": "diskUsage (kb)"
         *       },
         *       "phpqaConfigFilepath": "/home/cvaize/PhpstormProjects/datasince/commands/src/phpqa-test/.phpqa.yml",
         *       "sizeLimit": 200000,
         *       "group": "chunk",
         *       "chunksCount": 4
         *     },
         *     "folders": {
         *       "filepath": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv",
         *       "basename": "60k_php_dataset_metrics.csv",
         *       "filename": "60k_php_dataset_metrics",
         *       "extname": ".csv",
         *       "folder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics",
         *       "codeFolder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/code",
         *       "analysesFolder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/analyses"
         *     }
         *   },
         *   "row": {
         *     "﻿nameWithOwner": "rafu1987/t3bootstrap-project",
         *     "link": "https://github.com/rafu1987/t3bootstrap-project",
         *     "createdAt": "2012-11-29T14:37:05Z",
         *     "pushedAt": "2013-09-27T16:14:34Z",
         *     "isFork": "FALSE",
         *     "diskUsage (kb)": "34670",
         *     "D. Orlov score 0 - 100": "15",
         *     "D. Orlov - Why did I lower the score.": "",
         *     "Maintainability": "65.25",
         *     "Accessibility for new developers": "0",
         *     "Simplicity of algorithms": "0",
         *     "Volume": "1.22",
         *     "Reducing bug's probability": "0",
         *     "Average Total": "13.29"
         *   },
         *   "linkData": {
         *     "user": "rafu1987",
         *     "repository": "t3bootstrap-project"
         *   },
         *   "analysesRepositoryFolder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/analyses/rafu1987/t3bootstrap-project",
         *   "notExistsTools": [
         *     "phpmetrics",
         *     "pdepend",
         *     "phpcs",
         *     "phpmd",
         *     "phpcpd",
         *     "phploc"
         *   ]
         * }} ctx
         */
        if (chunkIndex >= chunksCount) {
            chunkIndex = 0;
        }

        const name = getChunkName(group, chunkIndex);
        chunkIndex++;

        chunksSources[name].rows.push(ctx.row);

        const chunkFolders = chunksSources[name].folders;
        const chunkAnalysesRepositoryFolder = `${chunkFolders.analysesFolder}/${ctx.linkData.user}/${ctx.linkData.repository}`
        const chunkAnalysesCloneRepositoryFolder = chunkAnalysesRepositoryFolder + '-clone';

        const analysesRepositoryFolder = ctx.analysesRepositoryFolder;
        const analysesCloneRepositoryFolder = analysesRepositoryFolder + '-clone';

        await Promise.all([
            fs.exists(analysesRepositoryFolder).then(exists => exists && copy(analysesRepositoryFolder, chunkAnalysesRepositoryFolder, {overwrite: true})),
            fs.exists(analysesCloneRepositoryFolder).then(exists => exists && copy(analysesCloneRepositoryFolder, chunkAnalysesCloneRepositoryFolder, {overwrite: true})),
        ])
    });

    for (const chunksSourcesKey in chunksSources) {
        const chunksSource = chunksSources[chunksSourcesKey];
        await writeData(chunksSource.folders.filepath, chunksSource.rows);
    }
}

module.exports = command;