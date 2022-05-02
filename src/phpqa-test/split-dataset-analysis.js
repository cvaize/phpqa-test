const fs = require('fs');
const path = require('path');
const HTMLParser = require('node-html-parser');
const rimraf = require("rimraf");
const ArgParser = require("argparce");
const getData = require('../utils/get-data');
const isIgnore = require('../utils/is-ignore');
const isIncludesContentInSource = require('../utils/is-includes-contentIn-source');
const timeLog = require("../utils/time-log");

const params = ArgParser.parse(process.argv.slice(2), {
    args: [
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
            // Путь к файлу csv
            type: 'string',
            name: 'filepath',
            short: 'f'
        },
        {
            // Группа
            type: 'string',
            name: 'group',
            short: 'g'
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

let accessTools = ['phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc']

let filepath = params.args.filepath;
let group = params.args.group;
let columnLinkKey = params.args['column-link-key'];
let columnSizeKey = params.args['column-size-key'];
let sizeLimit = params.args['size-limit'];
let tools = params.args.tools;
let codeFolder = filename + '/code';

if (!filepath) {
    throw new Error('Укажите путь к файлу с csv.');
}
if (!fs.readFileSync(filepath)) {
    throw new Error('По указанному пути файл csv не найден.');
}
if (!columnLinkKey) {
    throw new Error('Укажите колонку в которой находятся ссылки.')
}
if (!group) {
    throw new Error('Укажите группу.')
}

filepath = path.resolve(filepath);

let filename = filepath.split('.');
filename.pop()
filename = filename.join('.');

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

let analysesFolder = filename + '/analyses';


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
                analysesCloneRepositoryFolder: `${analysesFolder}/${user}/${repository}-clone`,
                fixRemove: `${analysesFolder}/${user}/${repository}/${repository}-clone`,
                codeFolder: `${codeFolder}/${user}---${repository}`,
                tools,
            });
        }
    }

    return data;
}

async function main() {
    const sourceData = await getData(filepath);

    let endLog = timeLog('Подготовка данных');
    let data = await dataPreparation(sourceData)
    endLog();


}

main();

