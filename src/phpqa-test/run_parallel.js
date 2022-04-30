const fs = require('fs');
const csv = require('csv-parser')
const HTMLParser = require('node-html-parser');
// const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
// const execSync = function (command){
//     console.log('execSync call: ' + command)
// }

const phraseXml = '<?xml'

/**
 * Результатом программы считать дирректорию одноименную с файлом csv и результаты аналитики внутри этой директории
 *
 * 0) Получить csv файл и распарсить
 * 1) Достать все записи
 * 2) Запустить обработку
 * 2.1) Во время обработки проверять наличие файлов и обрабатывать только когда в этом есть необходимость.
 * 2.2) Копировать директории с отчетами, если остались старые, в директории -clone, чтобы они не удалялись, так как phpqa очищает директории
 * 2.3) Копировать обратно из директорий -clone и удалять директории -clone
 * 3) Запустить очистку от ошибок и вернуться на шаг 2.
 * 4) Если шаг 2 вернул пустой массив выйти из программы.
 */
let exampleCommand = 'Команда: node run_parallel.js [filepath] [columnLinkKey] [streams] [tools]`. Пример команды: `node run_parallel.js "../../dataset/60k_php_dataset_metrics.csv" link 4 phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc`';
let accessTools = ['phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc']

// let nodePath = process.argv[0];
// let appPath = process.argv[1];

// 0
// Путь к файлу csv
let filepath = process.argv[2];
let codeFolder = '';
let analysesFolder = '';
let filename = '';
let fileExtension = '';
// Заголовок в котором хранится ссылка на github репозиторий
let columnLinkKey = process.argv[3];
// Количество потоков
let streams = process.argv[4];
// Phpqa tools которые нужно использовать в процессе обработки
let tools = process.argv[5]; // phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc
let columnSizeKey = 'diskUsage (kb)';
// Лимит в kb
let sizeLimit = 200000;
let PWD = process.env.PWD;

// 1
function getData(filepath) {
    return new Promise(function (resolve) {
        let csvRows = [];

        fs.createReadStream(filepath).pipe(csv()).on('data', (data) => csvRows.push(data))
            .on('end', () => {
                resolve(csvRows);
                // [
                //   { NAME: 'Daffy Duck', AGE: '24' },
                //   { NAME: 'Bugs Bunny', AGE: '22' }
                // ]
            });
    })
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}


/**
 * @param {string} filepath
 * @param {string} phrase
 * @returns {boolean}
 */
const isIncludesContentInSource = function (filepath, phrase) {
    if (fs.existsSync(filepath)) {
        /**
         * @var {string} content
         */
        let content = fs.readFileSync(filepath, 'utf-8');

        return !!(content && content.includes(phrase));
    }
    return false;
}

function getExistsResultTools(folder) {
    let existsResultTools = [];

    try {
        let phpmetricsHtmlFilepath = `${folder}/phpmetrics.html`;
        let phpmetricsXmlFilepath = `${folder}/phpmetrics.xml`;
        if (fs.existsSync(phpmetricsHtmlFilepath) && isIncludesContentInSource(phpmetricsXmlFilepath, phraseXml)) {
            let phpmetrics = fs.readFileSync(phpmetricsHtmlFilepath, 'utf-8');

            let root = HTMLParser.parse(phpmetrics);
            let rows = root.querySelectorAll('#score table tbody tr');

            if (rows || rows.length) {
                existsResultTools.push('phpmetrics');
            }
        }
    } catch (e) {
    }

    try {
        if (isIncludesContentInSource(`${folder}/checkstyle.xml`, phraseXml)) {
            existsResultTools.push('phpcs');
        }
    } catch (e) {
    }

    try {
        if (isIncludesContentInSource(`${folder}/pdepend-summary.xml`, phraseXml)) {
            existsResultTools.push('pdepend');
        }
    } catch (e) {
    }

    try {
        if (isIncludesContentInSource(`${folder}/phpcpd.xml`, phraseXml)) {
            existsResultTools.push('phpcpd');
        }
    } catch (e) {
    }

    try {
        if (isIncludesContentInSource(`${folder}/phploc.xml`, phraseXml)) {
            existsResultTools.push('phploc');
        }
    } catch (e) {
    }

    try {
        if (isIncludesContentInSource(`${folder}/phpmd.xml`, phraseXml)) {
            existsResultTools.push('phpmd');
        }
    } catch (e) {
    }

    return existsResultTools;
}

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

        if (!fs.existsSync(`${analysesFolder}/${repUser}`)) {
            fs.mkdirSync(`${analysesFolder}/${repUser}`);

            fs.mkdirSync(repAnalysesFolder);
        } else if (!fs.existsSync(repAnalysesFolder)) {
            fs.mkdirSync(repAnalysesFolder);
        }

        if (fs.existsSync(`${repAnalysesFolder}-clone`)) {
            await execShellCommand(`cp -rf ${repAnalysesFolder}-clone ${repAnalysesFolder}`);
            await execShellCommand(`rm -rf ${repAnalysesFolder}-clone`);
        }

        let workTools = [...tools];
        let existsResultTools = getExistsResultTools(repAnalysesFolder);

        workTools = workTools.filter(tool => !existsResultTools.includes(tool))

        if (workTools.length) {

            if (!fs.existsSync(`${codeFolder}/${repUser}`)) {
                fs.mkdirSync(`${codeFolder}/${repUser}`);
            }

            if (fs.existsSync(`${repCodeFolder}`)) {
                await execShellCommand(`rm -rf ${repCodeFolder}`);
            }

            if (fs.existsSync(`${repAnalysesFolder}`)) {
                await execShellCommand(`cp -rf ${repAnalysesFolder} ${repAnalysesFolder}-clone`);
            }

            await execShellCommand(`git clone ${githubLink} ${repCodeFolder}`);
            await execShellCommand(`find ${repCodeFolder} -type d -iname "*test*" -prune -exec rm -rf {} \\;`);
            await execShellCommand(`find ${repCodeFolder} -iname "*test*.*" -exec rm -rf {} \\;`);
            await execShellCommand(`docker run --user $(id -u):$(id -g) --rm -v "${PWD}/${repCodeFolder}":/app -v  "${PWD}/${repAnalysesFolder}":/analysis \\
    -v "${PWD}/.phpqa.yml":/config-phpqa/.phpqa.yml \\
    zdenekdrahos/phpqa:v1.25.0-php7.2 phpqa --tools ${workTools.join(',')} \\
    --ignoredDirs build,vendor,tests,lib,uploads,phpMyAdmin,phpmyadmin,library --config /config-phpqa \\
    --analyzedDirs /app --buildDir /analysis`);


            if (fs.existsSync(`${repCodeFolder}`)) {
                await execShellCommand(`rm -rf ${repCodeFolder}`);
            }

            if (fs.existsSync(`${repAnalysesFolder}-clone`)) {
                await execShellCommand(`cp -rf ${repAnalysesFolder}-clone ${repAnalysesFolder}`);
                await execShellCommand(`rm -rf ${repAnalysesFolder}-clone`);
            }

        }
    }
}

async function fun() {
    /**
     * @var {*}[] data
     */

    let data = await getData(filepath);
    let index = 0;
    let runningStreams = 0;

    const runWorker = function () {
        if (index === data.length) {
            if (runningStreams === 0) {
                console.log('Done')
            }
        } else {
            runningStreams++;
            let runIndex = index;
            console.log('Run row - ' + runIndex + '/' + data.length)
            index++;
            worker(data[runIndex]).then(function () {
                runningStreams--;
                runWorker();
            });
        }
    }

    for (let i = 0; i < streams; i++) {
        runWorker();
    }
}

if (filepath === '--help') {
    console.log(exampleCommand)
} else {
    // 0
    if (!filepath) {
        new Error('Укажите путь к файлу с csv. ' + exampleCommand)
    }

    if (!columnLinkKey) {
        new Error('Укажите колонку в которой находятся ссылки. ' + exampleCommand)
    }

    streams = Number(streams || 0)

    if (!streams || Number.isNaN(streams)) {
        new Error('Укажите количество потоков. ' + exampleCommand)
    }

    tools = (tools || '').split(',');
    for (let i = 0; i < tools.length; i++) {
        let tool = tools[i];
        if (!accessTools.includes(tool)) {
            new Error('Инструмент ' + tool + ' не предусмотрен. ' + exampleCommand)
        }
    }
    if (!tools.length) {
        new Error('Укажите phpqa tools. ' + exampleCommand)
    }

    filename = filepath.split('.');
    fileExtension = filename.pop();
    filename = filename.join('.');
    codeFolder = filename + '/code';
    analysesFolder = filename + '/analyses';

    if (!fs.existsSync(filename)) fs.mkdirSync(filename);
    if (!fs.existsSync(codeFolder)) fs.mkdirSync(codeFolder);
    if (!fs.existsSync(analysesFolder)) fs.mkdirSync(analysesFolder);

    fun();
}

// Example parallel work
// let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
// let iterator = 0;
//
//
// function worker() {
//     let number = numbers[iterator];
//
//     iterator++;
//     if (number) {
//         let time = Math.random() * 1000;
//         let promise = new Promise(function (resolve) {
//
//             setTimeout(function () {
//                 console.log(number + ' - ' + time);
//                 resolve(number);
//             }, time)
//         })
//         promise.then(worker)
//     }
//
//     return;
// }
//
// for (let i = 0; i < 4; i++) {
//     worker();
// }