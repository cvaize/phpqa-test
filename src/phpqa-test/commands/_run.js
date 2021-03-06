const timeLog = require('../utils/time-log').timeLog;
const getData = require('../utils/get-data');
const getFolders = require('../utils/get-folders');
const getGitUserRepositoryFromLink = require('../utils/get-git-user-repository-from-link');
const fs = require('../providers/fs');
const getNotExistsResultToolsLite = require('../utils/get-not-exists-result-tools-lite');

/**
 * @param {string} name
 * @param {{
 *   filepath: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv',
 *   tools: [ 'phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc' ],
 *   columns: { link: 'link', size: 'diskUsage (kb)' },
 *   phpqaConfigFilepath: '/home/cvaize/PhpstormProjects/datasince/commands/src/phpqa-test/.phpqa.yml',
 *   sizeLimit: 200000
 * }} args
 * @param {(ctx) => Promise} rowAction
 * @param {(ctx) => Promise} rowsAction
 * @returns {Promise<void>}
 */
async function command(name, args, rowAction, rowsAction = null) {

    /**
     * @type {{
     *   args: {
     *     filepath: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv',
     *     tools: [ 'phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc' ],
     *     columns: { link: 'link', size: 'diskUsage (kb)' },
     *     phpqaConfigFilepath: '/home/cvaize/PhpstormProjects/datasince/commands/src/phpqa-test/.phpqa.yml',
     *     sizeLimit: 200000
     *   },
     *   folders: {
     *     filepath: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv',
     *     basename: '60k_php_dataset_metrics.csv',
     *     filename: '60k_php_dataset_metrics',
     *     extname: '.csv',
     *     folder: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics',
     *     codeFolder: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/code',
     *     analysesFolder: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/analyses'
     *   }
     * }}
     */
    const options = {
        args,
        folders: getFolders(args.filepath)
    }

    let endLog = timeLog('?????????????????? ????????????');
    let sourceData = await getData(options.args.filepath);
    const sourceDataLength = sourceData.length;
    endLog();

    console.log('Debug. ???????????? ???????????? ???? ????????????:')
    console.log(sourceData[0])

    if (rowsAction) {
        await rowsAction({options})
    }

    endLog = timeLog('???????????????????? ???????????? ???? ??????????????, ?????????????? ?????????? ??????????????????');
    sourceData = sourceData.sort((a, b) => (a[options.args.columns.size] || 0) - (b[options.args.columns.size] || 0));
    endLog();

    endLog = timeLog(`${name}, ${sourceDataLength} ??????????`);
    const info = {
        length: sourceDataLength,
        ignoreCount: {
            error: 0,
            sizeLimit: 0,
        },
        completed: 0,
    }
    for (let i = 0; i < sourceDataLength; i++) {
        const row = sourceData[i];
        const link = row[options.args.columns.link]
        let size = row[options.args.columns.size]
        const sizeLimit = options.args.sizeLimit
        let endLog = timeLog(`${i + 1}/${sourceDataLength}. ?????????????????? - ${link}`);

        try {
            let isError = false
            if (!link) {
                let error = '?????? ???????????? ???? ??????????????????????.';
                console.error(error)
                isError = true
            }
            let linkData = getGitUserRepositoryFromLink(link)
            if (!linkData.user || !linkData.repository) {
                let error = '???????????? ???? ?????????????????????? ?????????????????????????? ??????????????.';
                console.error(error)
                isError = true
            }
            if (!size) {
                let error = '?????? ?????????????? ?????????????? ??????????????????????.';
                console.error(error)
                isError = true
            }
            size = Number(size);
            if (!size || Number.isNaN(size)) {
                let error = '???????????????????????? ???????????? ??????????????, ???????????? ???????? ?????????? ???? 1.';
                console.error(error)
                isError = true
            }
            if (!linkData.user || !linkData.user) {
                let error = '???????????????????????? ???????????? ??????????????, ???????????? ???????? ?????????? ???? 1.';
                console.error(error)
                isError = true
            }

            if (isError) {
                info.ignoreCount.error++;
            } else if (size > sizeLimit) {
                info.ignoreCount.sizeLimit++;
            } else {
                const analysesRepositoryFolder = `${options.folders.analysesFolder}/${linkData.user}/${linkData.repository}`

                /**
                 * @type {["phpmetrics","phpmd","pdepend","phpcs","phpcpd","phploc"]}
                 */
                let notExistsTools = await getNotExistsResultToolsLite(analysesRepositoryFolder, options.args.tools);

                if (notExistsTools.length !== 0) {
                    await rowAction({info, options, row, linkData, analysesRepositoryFolder, notExistsTools});
                }
                info.completed++;
            }

        } catch (e) {
            console.error(e);
            info.ignoreCount.error++;
        }

        endLog();
    }

    if (await fs.exists(options.folders.codeFolder)) await fs.unlink(options.folders.codeFolder);

    endLog();

    console.log(info)
}

module.exports = command;