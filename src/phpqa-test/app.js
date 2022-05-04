// const fs = require('fs');
// const ArgParser = require("argparce");
// const getData = require('./utils/get-data');
// const execShellCommand = require('./utils/exec');
// const getExistsResultTools = require('./utils/get-exists-result-tools');
const timeLog = require('./utils/time-log').timeLog;
const endAllLogs = require('./utils/time-log').endAllLogs;
const ArgParser = require("argparce");
// const checkFileExists = require('./utils/check-file-exists');
// const writeData = require('./utils/write-data');
// const getArgs = require('./utils/get-args');
// const getCommand = require('./utils/get-command');
// const {Sema} = require('async-sema');
// const copy = require('recursive-copy');
// const _ = require('lodash')

// const COMMAND = {
//     RUN: 'run',
//     CHUNKING: 'chunking',
//     JOIN: 'join',
// }
//
// let accessCommands = [COMMAND.RUN, COMMAND.CHUNKING, COMMAND.JOIN]
// let accessTools = ['phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc']
//
// const params = ArgParser.parse(process.argv.slice(3), {
//     args: [
//         {
//             // Путь к файлу csv
//             type: 'string',
//             name: 'filepath',
//             short: 'f'
//         },
//         {
//             // Путь к конфигу phpqa .phpqa.yml
//             type: 'string',
//             name: 'phpqa-config-filepath',
//             short: 'fc'
//         },
//         {
//             // Заголовок в котором хранится ссылка на github репозиторий
//             type: 'string',
//             name: 'column-link-key',
//             short: 'cl',
//             default: 'link'
//         },
//         {
//             // Заголовок в котором хранится ссылка на github репозиторий
//             type: 'string',
//             name: 'column-size-key',
//             short: 'cs',
//             default: 'diskUsage (kb)'
//         },
//         {
//             // Phpqa tools которые нужно использовать в процессе обработки
//             type: 'string',
//             name: 'tools',
//             short: 't',
//             default: 'phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc'
//         },
//         {
//             // Количество потоков
//             type: 'uinteger',
//             name: 'parallel-calls',
//             short: 'pc',
//             default: 4
//         },
//         {
//             // Лимит в kb
//             type: 'uinteger',
//             name: 'size-limit',
//             short: 'l',
//             default: 200000
//         },
//         {
//             // Группа
//             type: 'string',
//             name: 'group',
//             short: 'g'
//         },
//         {
//             // Количество частей
//             type: 'uinteger',
//             name: 'chunks',
//             short: 'ch'
//         },
//     ],
//     maxStrays: 0,
//     stopAtError: true,
//     errorExitCode: true
// });
//
// // 0
// let command = process.argv[2];
//
// let filepath = params.args.filepath;
// let group = params.args.group;
// let chunksCount = params.args.chunks;
// let columnLinkKey = params.args['column-link-key'];
// let parallel = params.args['parallel-calls'];
// let tools = params.args.tools;
// let columnSizeKey = params.args['column-size-key'];
// let sizeLimit = params.args['size-limit'];
// let phpqaConfigFilepath = params.args['phpqa-config-filepath'];
//
//
// const PWD = process.env.PWD;
// let codeFolder = '';
// let analysesFolder = '';
// let filename = '';
// let fileExtension = '';
//
// if (!accessCommands.includes(command)) {
//     throw new Error('Команда ' + command + ' не предусмотрена.')
// }
//
// if (!filepath) {
//     throw new Error('Укажите путь к файлу с csv.');
// }
// if (!fs.readFileSync(filepath)) {
//     throw new Error('По указанному пути файл csv не найден.');
// }
//
// if (!columnLinkKey) {
//     throw new Error('Укажите колонку в которой находятся ссылки.')
// }
//
// parallel = Number(parallel || 0)
//
// if (!parallel || Number.isNaN(parallel)) {
//     throw new Error('Укажите количество потоков.')
// }
//
// tools = (tools || '').split(',');
// for (let i = 0; i < tools.length; i++) {
//     let tool = tools[i];
//     if (!accessTools.includes(tool)) {
//         throw new Error('Инструмент ' + tool + ' не предусмотрен.')
//     }
// }
// if (!tools.length) {
//     throw new Error('Укажите phpqa tools.')
// }
//
// if (command === COMMAND.CHUNKING) {
//     if (!group) {
//         throw new Error('Укажите группу.')
//     }
//     if (!chunksCount) {
//         throw new Error('Укажите группу.')
//     }
// }
//
// if (command === COMMAND.JOIN) {
//     if (!group) {
//         throw new Error('Укажите группу.')
//     }
// }
//
//
// filename = filepath.split('.');
// fileExtension = filename.pop();
// filename = filename.join('.');
// codeFolder = filename + '/code';
// analysesFolder = filename + '/analyses';
//
// let args = {
//     filepath,
//     filename,
//     fileExtension,
//     codeFolder,
//     analysesFolder,
//     group,
//     chunksCount,
//     parallel
// }
//
// const s = new Sema(parallel);
//
// async function analysis(row) {
//     await s.acquire()
//     try {
//         console.log(s.nrWaiting() + ' в очереди на обработку. ' + row.link)
//
//         await execShellCommand(`rm -rf ${row.codeFolder}`);
//
//         if (await checkFileExists(`${row.analysesRepositoryFolder}`)) {
//             await copy(row.analysesRepositoryFolder, row.analysesCloneRepositoryFolder, {overwrite: true});
//         }
//
//         await execShellCommand(`git clone git@github.com:${row.user.trim()}/${row.repository.trim()}.git ${row.codeFolder}`);
//
//         // await execShellCommand(`find ${repCodeFolder} -type d -iname "*test*" -prune -exec rm -rf {} \\;`);
//         // await execShellCommand(`find ${repCodeFolder} -iname "*test*.*" -exec rm -rf {} \\;`);
//         await execShellCommand(`docker run --user $(id -u):$(id -g) --rm -v "${PWD}/${row.codeFolder}":/app -v  "${PWD}/${row.analysesRepositoryFolder}":/analysis \\
//     ${phpqaConfigFilepath ? `-v "${phpqaConfigFilepath}":/config-phpqa/.phpqa.yml` : ''} \\
//     zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools ${row.tools.join(',')} \\
//     --ignoredDirs build,vendor,tests,uploads,phpMyAdmin,phpmyadmin ${phpqaConfigFilepath ? `--config /config-phpqa` : ''}\\
//     --analyzedDirs /app --buildDir /analysis`);
//
//         await execShellCommand(`rm -rf ${row.codeFolder}`);
//
//         if (await checkFileExists(`${row.analysesCloneRepositoryFolder}`)) {
//             await copy(row.analysesCloneRepositoryFolder, row.analysesRepositoryFolder, {overwrite: true});
//             await execShellCommand(`rm -rf ${row.analysesCloneRepositoryFolder}`);
//         }
//     } catch (e) {
//         console.error(e);
//     } finally {
//         s.release();
//     }
// }
//
// async function dataPreparation(sourceData) {
//     let needRows = [];
//
//     console.log('Debug. Строка из списка:')
//     console.log(sourceData[0])
//
//     for (let i = 0; i < sourceData.length; i++) {
//         let row = sourceData[i];
//
//         let keys = Object.keys(row);
//         if (!keys.includes(columnLinkKey)) {
//             throw new Error('В строке ' + JSON.stringify(row, null, 2) + ' нет ссылки на репозиторий.')
//         }
//         if (!keys.includes(columnSizeKey)) {
//             throw new Error('В строке ' + JSON.stringify(row, null, 2) + ' нет колонки размера репозитория.')
//         }
//
//         let githubLink = row[columnLinkKey];
//         let size = row[columnSizeKey];
//         size = size ? Number(size) : null;
//
//         if (size && !Number.isNaN(size) && size < sizeLimit && githubLink && githubLink.includes('http')) {
//
//             let splitedUrl = githubLink.split('/');
//             let user = splitedUrl[3];
//             let repository = splitedUrl[4];
//
//             needRows.push({
//                 sourceRow: row,
//                 link: row[columnLinkKey],
//                 size,
//                 user,
//                 repository,
//                 analysesUserFolder: `${analysesFolder}/${user}`,
//                 analysesRepositoryFolder: `${analysesFolder}/${user}/${repository}`,
//                 analysesCloneRepositoryFolder: `${analysesFolder}/${user}/${repository}-clone`,
//                 codeFolder: `${codeFolder}/${user}---${repository}`,
//                 tools,
//             });
//         }
//     }
//
//     return needRows;
// }
//
// async function foldersPreparation(needRows) {
//     let needRows_ = []
//
//     let length = needRows.length;
//
//     for (let i = 0; i < length; i++) {
//         let row = needRows[i];
//
//         let endLog = timeLog(`${i + 1}/${length} Подготовка директорий, проверка отчетов - ${row.link}`)
//
//         if (!await checkFileExists(row.analysesUserFolder)) {
//             await fs.promises.mkdir(row.analysesUserFolder);
//             await fs.promises.mkdir(row.analysesRepositoryFolder);
//         } else if (!await checkFileExists(row.analysesRepositoryFolder)) {
//             await fs.promises.mkdir(row.analysesRepositoryFolder);
//         }
//
//         let workTools = [...tools];
//         /**
//          * @type {["phpmetrics","phpmd","pdepend","phpcs","phpcpd","phploc"]}
//          */
//         let existsResultTools = await getExistsResultTools(row.analysesRepositoryFolder);
//
//         workTools = workTools.filter(tool => !existsResultTools.includes(tool))
//
//         if (workTools.length) {
//             row.tools = workTools;
//             needRows_.push(row)
//         }
//
//         endLog();
//     }
//
//     return needRows_;
// }
//
// function sortData(needRows) {
//     // Сортировка по размеру, сначала самые маленькие
//     return needRows.sort((a, b) => a.size - b.size);
// }
//
// async function copyChunkFiles(row, chunkFilename) {
//     await s.acquire()
//     try {
//         let analysesUserFolder = row.analysesUserFolder.replace(filename, chunkFilename);
//         let analysesRepositoryFolder = row.analysesRepositoryFolder.replace(filename, chunkFilename);
//         let analysesCloneRepositoryFolder = row.analysesCloneRepositoryFolder.replace(filename, chunkFilename);
//
//         await Promise.all([
//             checkFileExists(row.analysesUserFolder).then(exists => exists && copy(row.analysesUserFolder, analysesUserFolder, {overwrite: true})),
//             checkFileExists(row.analysesRepositoryFolder).then(exists => exists && copy(row.analysesRepositoryFolder, analysesRepositoryFolder, {overwrite: true})),
//             checkFileExists(row.analysesCloneRepositoryFolder).then(exists => exists && copy(row.analysesCloneRepositoryFolder, analysesCloneRepositoryFolder, {overwrite: true})),
//         ])
//
//     } catch (e) {
//         console.error(e);
//     } finally {
//         s.release();
//     }
// }
//
// function getChunkFilePath(i) {
//     return `${filename}-${group}-${i}.${fileExtension}`;
// }
//
// function getChunkFilename(i) {
//     return `${filename}-${group}-${i}`;
// }
//
// async function main() {
//     require(`./commands/${command}.js`)(args)
// }
//
// async function main1() {
//     let endLog = timeLog('Создание основных директорий');
//     if (!await checkFileExists(filename)) await fs.promises.mkdir(filename);
//     if (!await checkFileExists(codeFolder)) await fs.promises.mkdir(codeFolder);
//     if (!await checkFileExists(analysesFolder)) await fs.promises.mkdir(analysesFolder);
//     endLog();
//     /**
//      * @var {*}[] data
//      */
//
//
//     endLog = timeLog('Получение данных');
//     let sourceData = await getData(filepath);
//     endLog();
//
//     endLog = timeLog('Подготовка данных');
//     let needRows = await dataPreparation(sourceData)
//     endLog();
//
//     endLog = timeLog('Подготовка директорий, проверка отчетов и фильтрация списка на обработку');
//     needRows = await foldersPreparation(needRows)
//     endLog();
//
//     endLog = timeLog('Сортировка данных');
//     needRows = sortData(needRows)
//     endLog();
//
//     switch (command) {
//         case COMMAND.RUN:
//             endLog = timeLog('Параллельная обработка данных');
//             await Promise.allSettled(needRows.map(analysis))
//             endLog();
//             break;
//         case COMMAND.CHUNKING:
//             endLog = timeLog('Разделение на части');
//             let chunks = _.chunk(needRows, Math.round(needRows.length/chunksCount));
//             let chunksSources = chunks.map(() => []);
//             let promises = [];
//
//             for (let i = 0; i < chunks.length; i++) {
//                 let chunk = chunks[i];
//                 let chunkSource = chunksSources[i];
//                 let chunkFilename = getChunkFilename(i);
//
//                 for (let j = 0; j < chunk.length; j++) {
//                     let row = chunk[j];
//                     chunkSource.push(row.sourceRow);
//
//                     promises.push(copyChunkFiles(row, chunkFilename))
//                 }
//             }
//
//             await Promise.allSettled(promises)
//
//             for (let i = 0; i < chunksSources.length; i++) {
//                 await writeData(getChunkFilePath(i), chunksSources[i]);
//             }
//
//             endLog();
//             break;
//         case COMMAND.JOIN:
//             endLog = timeLog('Соединение частей');
//
//             endLog();
//             break;
//     }
// }
//
// main();

process.stdin.resume();//so the program will not close instantly

const command = process.argv[2];

const endLog = timeLog(`Выполнение команды ${command}`)

function exitHandler(options, exitCode) {
    if (options.cleanup) endAllLogs();
    // if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true, exit:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

let action;
let getArgs;
try {
    action = require(`./commands/${command}.js`)
    getArgs = require(`./args/${command}.js`)
} catch (e) {
    throw new Error('Команда ' + command + ' не предусмотрена.')
}

const argv = getArgs(process.argv.slice(3), ArgParser);

action(argv).then(() => {
    endLog();
    process.exit();
})
