const fs = require('fs');
const path = require('path');
const ArgParser = require("argparce");
const getData = require('../utils/get-data');
const getExistsResultTools = require('../utils/get-exists-result-tools');
const isIgnore = require('../utils/is-ignore');

let counts = {
    total: 0,
    ignore: 0,
    totalMinusIgnore: 0,
    phploc: 0,
    phpcpd: 0,
    phpcs: 0,
    pdepend: 0,
    phpmd: 0,
    phpmetrics: 0,
    needReview: 0,
}

let p1 = 'Maintainability';
let p2 = 'Accessibility for new developers';
let p3 = 'Simplicity of algorithms';
let p4 = 'Volume';
let p5 = 'Reducing bug\'s probability';


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
            // Заголовок в котором хранится оценка разработчика
            type: 'string',
            name: 'column-score-key',
            short: 'cr',
            default: 'D. Orlov score 0 - 100'
        },
        {
            // Путь к файлу csv
            type: 'string',
            name: 'filepath',
            short: 'f'
        }
    ],
    maxStrays: 0,
    stopAtError: true,
    errorExitCode: true
});

let filepath = params.args.filepath;
let columnLinkKey = params.args['column-link-key'];
let columnSizeKey = params.args['column-size-key'];
let columnScoreKey = params.args['column-score-key'];

if (!filepath) {
    throw new Error('Укажите путь к файлу с csv.');
}
if (!fs.readFileSync(filepath)) {
    throw new Error('По указанному пути файл csv не найден.');
}
if (!columnLinkKey) {
    throw new Error('Укажите колонку в которой находятся ссылки.')
}

filepath = path.resolve(filepath);

let filename = filepath.split('.');
filename.pop()
filename = filename.join('.');
let analysesFolder = filename + '/analyses';

const counter = async function (rowObject) {

    let link = rowObject.link;
    let ignore = true;
    let size = Number(rowObject[columnSizeKey]);

    if (!isIgnore(size, link)) {

        let splitedUrl = link.split('/');
        let repFolder = splitedUrl[3];
        let repName = splitedUrl[4];
        if (repFolder && repName) {

            ignore = false;
            let folder = `${analysesFolder}/${repFolder}/${repName}`;

            let existsResultTools = await getExistsResultTools(folder);

            for (let i = 0; i < existsResultTools.length; i++) {
                let existsResultTool = existsResultTools[i];
                counts[existsResultTool]++;
            }

        }
    }

    if (ignore) {
        counts.ignore++;
    }

    if (rowObject[p1] && rowObject[p2] && rowObject[p3] && rowObject[p4] && rowObject[p5] &&
        (
            (rowObject[p1] === '0' || rowObject[p1] === '100')
            || (rowObject[p2] === '0' || rowObject[p2] === '100')
            || (rowObject[p3] === '0' || rowObject[p3] === '100')
            || (rowObject[p4] === '0' || rowObject[p4] === '100')
            || (rowObject[p5] === '0' || rowObject[p5] === '100')
        ) &&
        (!rowObject[columnScoreKey] || Number.isNaN(Number(rowObject[columnScoreKey])))) {
        counts.needReview++;
    }

    return rowObject;
}

async function main() {
    const data = await getData(filepath);

    counts.total = data.length;
    for (let i = 0; i < data.length; i++) {
        console.log(`${i+1}/${data.length}`)
        await counter(data[i]);
    }
    counts.totalMinusIgnore = counts.total - counts.ignore;
    console.log(counts);
}

main();