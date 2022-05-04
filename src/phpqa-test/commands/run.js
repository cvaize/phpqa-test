const fs = require('../providers/fs');
const childProcess = require('../providers/child-process');
const commonRun = require('./_run');
const copy = require('recursive-copy');

/**
 * @param {{
 *   filepath: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv',
 *   tools: [ 'phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc' ],
 *   columns: { link: 'link', size: 'diskUsage (kb)' },
 *   phpqaConfigFilepath: '/home/cvaize/PhpstormProjects/datasince/commands/src/phpqa-test/.phpqa.yml',
 *   sizeLimit: 200000
 * }} args
 * @returns {Promise<void>}
 */
async function command(args) {
    await commonRun('Обработка данных', args, async function (ctx) {
        /**
         * @var {{
         *   "info": {
         *     "errors": [],
         *     "ignoreCount": {
         *       "error": 0,
         *       "sizeLimit": 0,
         *       "completed": 0,
         *       "total": 0
         *     }
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
         *       "sizeLimit": 200000
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
         *     "﻿nameWithOwner": "iamfiscus/codeigniter-ion-auth-migration",
         *     "link": "https://github.com/iamfiscus/codeigniter-ion-auth-migration",
         *     "createdAt": "2011-07-28T14:51:30Z",
         *     "pushedAt": "2018-10-04T08:07:24Z",
         *     "isFork": "FALSE",
         *     "diskUsage (kb)": "136",
         *     "D. Orlov score 0 - 100": "75",
         *     "D. Orlov - Why did I lower the score.": "",
         *     "Maintainability": "17.17",
         *     "Accessibility for new developers": "0",
         *     "Simplicity of algorithms": "14.29",
         *     "Volume": "9.38",
         *     "Reducing bug's probability": "0",
         *     "Average Total": "8.17"
         *   },
         *   "linkData": {
         *     "user": "iamfiscus",
         *     "repository": "codeigniter-ion-auth-migration"
         *   },
         *   "analysesRepositoryFolder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/analyses/iamfiscus/codeigniter-ion-auth-migration",
         *   "notExistsTools": ["phpmetrics","phpmd","pdepend","phpcs","phpcpd","phploc"],
         * }} ctx
         */

        /**
         * @type {string}
         */
        const analysesRepositoryFolder = ctx.analysesRepositoryFolder;
        const analysesCloneRepositoryFolder = analysesRepositoryFolder + '-clone';
        const user = ctx.linkData.user;
        const repository = ctx.linkData.repository;
        const codeFolder = `${ctx.options.folders.codeFolder}/${user}---${repository}`;
        const tools = ctx.notExistsTools;
        const phpqaConfigFilepath = ctx.options.args.phpqaConfigFilepath;

        await fs.unlink(codeFolder)

        if (await fs.exists(analysesCloneRepositoryFolder)) {
            await copy(analysesCloneRepositoryFolder, analysesRepositoryFolder, {overwrite: true});
        }

        if (await fs.exists(analysesRepositoryFolder)) {
            await copy(analysesRepositoryFolder, analysesCloneRepositoryFolder, {overwrite: true});
        }

        if (!await fs.exists(analysesRepositoryFolder)) {
            await fs.mkdir(analysesRepositoryFolder);
        }

        await childProcess.exec(`git clone git@github.com:${user}/${repository}.git ${codeFolder}`);

        // await execShellCommand(`find ${repCodeFolder} -type d -iname "*test*" -prune -exec rm -rf {} \\;`);
        // await execShellCommand(`find ${repCodeFolder} -iname "*test*.*" -exec rm -rf {} \\;`);
        await childProcess.exec(`docker run --user $(id -u):$(id -g) --rm -v "${codeFolder}":/app -v  "${analysesRepositoryFolder}":/analysis \\
${phpqaConfigFilepath ? `-v "${phpqaConfigFilepath}":/config-phpqa/.phpqa.yml` : ''} \\
zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools ${tools.join(',')} \\
--ignoredDirs build,vendor,tests,uploads,phpMyAdmin,phpmyadmin ${phpqaConfigFilepath ? `--config /config-phpqa` : ''} \\
--analyzedDirs /app --buildDir /analysis`);

        await fs.unlink(codeFolder)

        if (await fs.exists(analysesCloneRepositoryFolder)) {
            await copy(analysesCloneRepositoryFolder, analysesRepositoryFolder, {overwrite: true});
            await fs.unlink(analysesCloneRepositoryFolder)
        }
    });
}

module.exports = command;