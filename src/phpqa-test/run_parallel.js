const fs = require('fs');
const ArgParser = require("argparce");
const getData = require('../utils/get-data');
const execShellCommand = require('../utils/exec');
const getExistsResultTools = require('../utils/get-exists-result-tools');
const timeLog = require('../utils/time-log');
const checkFileExists = require('../utils/check-file-exists');
const {Sema} = require('async-sema');

let accessTools = ['phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc']

const params = ArgParser.parse(process.argv.slice(2), {
    args: [
        {
            // Путь к файлу csv
            type: 'string',
            name: 'filepath',
            short: 'f'
        },
        {
            // Заголовок в котором хранится ссылка на github репозиторий
            type: 'string',
            name: 'column-link-key',
            short: 'cl',
            default: 'link'
        },
        {
            // Заголовок в котором хранится ссылка на github репозиторий
            type: 'string',
            name: 'column-size-key',
            short: 'cs',
            default: 'diskUsage (kb)'
        },
        {
            // Phpqa tools которые нужно использовать в процессе обработки
            type: 'string',
            name: 'tools',
            short: 't',
            default: 'phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc'
        },
        {
            // Количество потоков
            type: 'uinteger',
            name: 'streams',
            short: 's',
            default: 4
        },
        {
            // Лимит в kb
            type: 'uinteger',
            name: 'size-limit',
            short: 'l',
            default: 200000
        }
    ],
    maxStrays: 0,
    stopAtError: true,
    errorExitCode: true
});

// 0
let filepath = params.args.filepath;
let columnLinkKey = params.args['column-link-key'];
let streams = params.args.streams;
let tools = params.args.tools;
let columnSizeKey = params.args['column-size-key'];
let sizeLimit = params.args['size-limit'];


const PWD = process.env.PWD;
let codeFolder = '';
let analysesFolder = '';
let filename = '';
let fileExtension = '';


if (!filepath) {
    throw new Error('Укажите путь к файлу с csv.');
}
if (!fs.readFileSync(filepath)) {
    throw new Error('По указанному пути файл csv не найден.');
}

if (!columnLinkKey) {
    throw new Error('Укажите колонку в которой находятся ссылки.')
}

streams = Number(streams || 0)

if (!streams || Number.isNaN(streams)) {
    throw new Error('Укажите количество потоков.')
}

tools = (tools || '').split(',');
for (let i = 0; i < tools.length; i++) {
    let tool = tools[i];
    if (!accessTools.includes(tool)) {
        throw new Error('Инструмент ' + tool + ' не предусмотрен.')
    }
}
if (!tools.length) {
    throw new Error('Укажите phpqa tools.')
}


filename = filepath.split('.');
fileExtension = filename.pop();
filename = filename.join('.');
codeFolder = filename + '/code';
analysesFolder = filename + '/analyses';
const s = new Sema(streams);

// 2
async function worker(ceil) {
    let githubLink = ceil[columnLinkKey];
    let size = ceil[columnSizeKey];
    size = size ? Number(size) : null;
    if (size && !Number.isNaN(size) && size < sizeLimit && githubLink && githubLink.includes('http') && githubLink.includes('github')) {

        let splitedUrl = githubLink.split('/');
        let repUser = splitedUrl[3];
        let repName = splitedUrl[4];
        let repAnalysesFolder = `${analysesFolder}/${repUser}/${repName}`;
        let repCodeFolder = `${codeFolder}/${repUser}/${repName}`;

        if (!await checkFileExists(`${analysesFolder}/${repUser}`)) {
            await fs.promises.mkdir(`${analysesFolder}/${repUser}`);

            await fs.promises.mkdir(repAnalysesFolder);
        } else if (!await checkFileExists(repAnalysesFolder)) {
            await fs.promises.mkdir(repAnalysesFolder);
        }

        if (await checkFileExists(`${repAnalysesFolder}-clone`)) {
            await execShellCommand(`cp -rf ${repAnalysesFolder}-clone ${repAnalysesFolder} && rm -rf ${repAnalysesFolder}-clone`);
        }

        let workTools = [...tools];
        let existsResultTools = await getExistsResultTools(repAnalysesFolder);

        workTools = workTools.filter(tool => !existsResultTools.includes(tool))

        if (workTools.length) {

            if (!await checkFileExists(`${codeFolder}/${repUser}`)) {
                await fs.promises.mkdir(`${codeFolder}/${repUser}`);
            }

            if (await checkFileExists(`${repCodeFolder}`)) {
                await execShellCommand(`rm -rf ${repCodeFolder}`);
            }

            if (await checkFileExists(`${repAnalysesFolder}`)) {
                await execShellCommand(`cp -rf ${repAnalysesFolder} ${repAnalysesFolder}-clone`);
            }

            await execShellCommand(`git clone ${githubLink} ${repCodeFolder}`);
            // await execShellCommand(`find ${repCodeFolder} -type d -iname "*test*" -prune -exec rm -rf {} \\;`);
            // await execShellCommand(`find ${repCodeFolder} -iname "*test*.*" -exec rm -rf {} \\;`);
            await execShellCommand(`docker run --user $(id -u):$(id -g) --rm -v "${PWD}/${repCodeFolder}":/app -v  "${PWD}/${repAnalysesFolder}":/analysis \\
    -v "${PWD}/.phpqa.yml":/config-phpqa/.phpqa.yml \\
    zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools ${workTools.join(',')} \\
    --ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library --config /config-phpqa \\
    --analyzedDirs /app --buildDir /analysis`);


            if (await checkFileExists(`${repCodeFolder}`)) {
                await execShellCommand(`rm -rf ${repCodeFolder}`);
            }

            if (await checkFileExists(`${repAnalysesFolder}-clone`)) {
                await execShellCommand(`cp -rf ${repAnalysesFolder}-clone ${repAnalysesFolder}`);
                await execShellCommand(`rm -rf ${repAnalysesFolder}-clone`);
            }

        }
    }
}

async function analysis(row) {
    await s.acquire()
    try {
        console.log(s.nrWaiting() + ' в очереди на обработку. ' + row.link)

        if (await checkFileExists(`${row.codeFolder}`)) {
            await execShellCommand(`rm -rf ${row.codeFolder}`);
        }

        if (await checkFileExists(`${row.analysesRepositoryFolder}`)) {
            await execShellCommand(`cp -rf ${row.analysesRepositoryFolder} ${row.analysesRepositoryFolder}-clone`);
        }

        await execShellCommand(`git clone ${row.link} ${row.codeFolder}`);

        // await execShellCommand(`find ${repCodeFolder} -type d -iname "*test*" -prune -exec rm -rf {} \\;`);
        // await execShellCommand(`find ${repCodeFolder} -iname "*test*.*" -exec rm -rf {} \\;`);
        await execShellCommand(`docker run --user $(id -u):$(id -g) --rm -v "${PWD}/${row.codeFolder}":/app -v  "${PWD}/${row.analysesRepositoryFolder}":/analysis \\
    -v "${PWD}/src/phpqa-test/.phpqa.yml":/config-phpqa/.phpqa.yml \\
    zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools ${row.tools.join(',')} \\
    --ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library --config /config-phpqa \\
    --analyzedDirs /app --buildDir /analysis`);


        if (await checkFileExists(`${row.codeFolder}`)) {
            await execShellCommand(`rm -rf ${row.codeFolder}`);
        }

        if (await checkFileExists(`${row.analysesRepositoryFolder}-clone`)) {
            await execShellCommand(`cp -rf ${row.analysesRepositoryFolder}-clone ${row.analysesRepositoryFolder} && rm -rf ${row.analysesRepositoryFolder}-clone`);
        }
    } catch (e){
        console.error(e);
    }finally {
        s.release();
    }
}

async function dataPreparation(sourceData) {
    let data = {
        needRows: [],
        sourceData,
    }

    console.log('Debug. Строка из списка:')
    console.log(sourceData[0])

    for (let i = 0; i < sourceData.length; i++) {
        let row = sourceData[i];

        let keys = Object.keys(row);
        if (!keys.includes(columnLinkKey)) {
            throw new Error('В строке ' + JSON.stringify(row, null, 2) + ' нет ссылки на репозиторий.')
        }
        if (!keys.includes(columnSizeKey)) {
            throw new Error('В строке ' + JSON.stringify(row, null, 2) + ' нет колонки размера репозитория.')
        }

        let githubLink = row[columnLinkKey];
        let size = row[columnSizeKey];
        size = size ? Number(size) : null;

        if (size && !Number.isNaN(size) && size < sizeLimit && githubLink && githubLink.includes('http')) {

            let splitedUrl = githubLink.split('/');
            let user = splitedUrl[3];
            let repository = splitedUrl[4];

            data.needRows.push({
                link: row[columnLinkKey],
                size,
                user,
                repository,
                analysesUserFolder: `${analysesFolder}/${user}`,
                analysesRepositoryFolder: `${analysesFolder}/${user}/${repository}`,
                codeFolder: `${codeFolder}/${user}---${repository}`,
                tools,
            });
        }
    }

    return data;
}

async function foldersPreparation(data) {
    let needRows = []

    let length = data.needRows.length;

    for (let i = 0; i < length; i++) {
        let row = data.needRows[i];

        let endLog = timeLog(`${i + 1}/${length} Подготовка директорий, проверка отчетов - ${row.link}`)

        if (!await checkFileExists(row.analysesUserFolder)) {
            await Promise.all([
                fs.promises.mkdir(row.analysesUserFolder),
                fs.promises.mkdir(row.analysesRepositoryFolder),
            ])
        } else if (!await checkFileExists(row.analysesRepositoryFolder)) {
            await fs.promises.mkdir(row.analysesRepositoryFolder);
        }

        let workTools = [...tools];
        /**
         * @type {["phpmetrics","phpmd","pdepend","phpcs","phpcpd","phploc"]}
         */
        let existsResultTools = await getExistsResultTools(row.analysesRepositoryFolder);

        workTools = workTools.filter(tool => !existsResultTools.includes(tool))

        if (workTools.length) {
            row.tools = workTools;
            needRows.push(row)
        }

        endLog();
    }

    data.needRows = needRows

    return data;
}

function sortData(data) {
    // Сортировка по размеру, сначала самые маленькие

    data.needRows = data.needRows.sort((a, b) => a.size - b.size);

    return data;
}


async function fun() {
    let endLog = timeLog('Создание основных директорий');
    if (!await checkFileExists(filename)) await fs.promises.mkdir(filename);
    if (!await checkFileExists(codeFolder)) await fs.promises.mkdir(codeFolder);
    if (!await checkFileExists(analysesFolder)) await fs.promises.mkdir(analysesFolder);
    endLog();
    /**
     * @var {*}[] data
     */

    endLog = timeLog('Получение данных');
    let sourceData = await getData(filepath);
    endLog();

    endLog = timeLog('Подготовка данных');
    let data = await dataPreparation(sourceData)
    endLog();

    endLog = timeLog('Подготовка директорий, проверка отчетов и фильтрация списка на обработку');
    data = await foldersPreparation(data)
    endLog();

    endLog = timeLog('Сортировка данных');
    data = sortData(data)
    endLog();

    endLog = timeLog('Обработка данных');
    await Promise.allSettled(data.needRows.map(analysis))
    endLog();

    return;
    // let index = 0;
    // let runningStreams = 0;
    //
    // const runWorker = function () {
    //     if (index === data.length) {
    //         if (runningStreams === 0) {
    //             console.log('Done')
    //         }
    //     } else {
    //         runningStreams++;
    //         let runIndex = index;
    //         console.log('Run row - ' + runIndex + '/' + data.length + ' - ' + (data[runIndex][columnLinkKey] || ''))
    //         index++;
    //         worker(data[runIndex]).then(function () {
    //             runningStreams--;
    //             runWorker();
    //         });
    //     }
    // }
    //
    // for (let i = 0; i < streams; i++) {
    //     runWorker();
    // }
}

fun();
