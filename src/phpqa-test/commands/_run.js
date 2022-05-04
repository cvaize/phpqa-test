const timeLog = require('../utils/time-log').timeLog;
const getData = require('../utils/get-data');
const getFolders = require('../utils/get-folders');
const getGitUserRepositoryFromLink = require('../utils/get-git-user-repository-from-link');
const fs = require('../providers/fs');
const getNotExistsResultToolsLite = require('../utils/get-not-exists-result-tools-lite');
const { Sema } = require('async-sema');

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
 * @returns {Promise<void>}
 */
async function command(name, args, rowAction) {
    const s = new Sema(
        10, // Allow 4 concurrent async calls
        {
            capacity: 100 // Prealloc space for 100 tokens
        }
    );
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

    let endLog = timeLog('Получение данных');
    let sourceData = await getData(options.args.filepath);
    const sourceDataLength = sourceData.length;
    endLog();

    console.log('Debug. Первая строка из списка:')
    console.log(sourceData[0])

    endLog = timeLog('Создание основных директорий');
    if (!await fs.exists(options.folders.folder)) await fs.mkdir(options.folders.folder);
    if (!await fs.exists(options.folders.codeFolder)) await fs.mkdir(options.folders.codeFolder);
    if (!await fs.exists(options.folders.analysesFolder)) await fs.mkdir(options.folders.analysesFolder);
    endLog();


    endLog = timeLog('Сортировка данных по размеру, сначала самые маленькие');
    sourceData = sourceData.sort((a, b) => (a[options.args.columns.size] || 0) - (b[options.args.columns.size] || 0));
    endLog();

    endLog = timeLog(`${name}, ${sourceDataLength} строк`);
    const info = {
        length: sourceDataLength,
        ignoreCount: {
            error: 0,
            sizeLimit: 0,
        },
        completed: 0,
    }

    const promises = [];

    for (let i = 0; i < sourceDataLength; i++) {
        const row = sourceData[i];
        const link = row[options.args.columns.link]
        let size = row[options.args.columns.size]
        const sizeLimit = options.args.sizeLimit
        let endLog = timeLog(`${i + 1}/${sourceDataLength}. Обработка - ${link}`);

        try {
            let isError = false
            if (!link) {
                let error = 'Нет ссылки на репозиторий.';
                console.error(error)
                isError = true
            }
            let linkData = getGitUserRepositoryFromLink(link)
            if (!linkData.user || !linkData.repository) {
                let error = 'Ссылка на репозиторий неправильного формата.';
                console.error(error)
                isError = true
            }
            if (!size) {
                let error = 'Нет колонки размера репозитория.';
                console.error(error)
                isError = true
            }
            size = Number(size);
            if (!size || Number.isNaN(size)) {
                let error = 'Неправильный формат размера, должно быть число от 1.';
                console.error(error)
                isError = true
            }
            if (!linkData.user || !linkData.user) {
                let error = 'Неправильный формат размера, должно быть число от 1.';
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
                    promises.push(new Promise(async (resolve) => {
                        await s.acquire()
                        try {
                            console.log(s.nrWaiting() + ' вызовов в очереди')

                            await rowAction({info, options, row, linkData, analysesRepositoryFolder, notExistsTools}).then(() => {
                                info.completed++;
                                endLog();
                            }).catch((e) => {
                                console.error(e);
                                info.ignoreCount.error++;
                                endLog();
                            })

                        } finally {
                            s.release();
                            resolve();
                        }
                    }));
                }else{
                    info.completed++;
                    endLog();
                }
            }

        } catch (e) {
            console.error(e);
            info.ignoreCount.error++;
            endLog();
        }
    }

    await Promise.allSettled(promises);

    if (await fs.exists(options.folders.codeFolder)) await fs.unlink(options.folders.codeFolder);

    endLog();

    console.log(info)
}

module.exports = command;