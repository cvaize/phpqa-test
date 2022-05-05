const fs = require('fs');
const path = require('path');
const HTMLParser = require('node-html-parser');
const rimraf = require("rimraf");
const ArgParser = require("argparce");
const getData = require('./utils/get-data');
const isIgnore = require('./utils/is-ignore');
const isIncludesContentInSource = require('./utils/is-includes-contentIn-source');

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
            // Путь к файлу csv
            type: 'string',
            name: 'filepath',
            short: 'f'
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

let filepath = params.args.filepath;
let columnLinkKey = params.args['column-link-key'];
let columnSizeKey = params.args['column-size-key'];
let sizeLimit = params.args['size-limit'];

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

const phraseXml = '<'

const removeSource = function (filepath) {
    if (fs.existsSync(filepath)) {
        rimraf.sync(filepath);
        console.log(`Removed - ${filepath}`)
    }
}

const clean = async function (rowObject) {

    let link = rowObject.link;
    let ignore = true;
    let size = Number(rowObject[columnSizeKey]);

    if (!isIgnore(size, sizeLimit, link)) {

        let splitedUrl = link.split('/');
        let repFolder = splitedUrl[3];
        let repName = splitedUrl[4];
        if (repFolder && repName) {

            let folder = `${analysesFolder}/${repFolder}/${repName}`;

            removeSource(`${folder}-clone`);
            removeSource(`${folder}/${repName}-clone`);

            if (fs.existsSync(`${folder}/phpmetrics.html`)) {
                let phpmetrics = fs.readFileSync(`${folder}/phpmetrics.html`, 'utf-8');

                let root = HTMLParser.parse(phpmetrics);
                let rows = root.querySelectorAll('#score table tbody tr');

                if (!rows || !rows.length) {
                    removeSource(`${folder}/phpmetrics.html`);
                }
            }

            if (!await isIncludesContentInSource(`${folder}/phpmetrics.xml`, phraseXml)) {
                removeSource(`${folder}/phpmetrics.xml`);
            }

            if (!await isIncludesContentInSource(`${folder}/checkstyle.xml`, phraseXml)) {
                removeSource(`${folder}/checkstyle.xml`);
            }

            if (!await isIncludesContentInSource(`${folder}/pdepend-dependencies.xml`, phraseXml)
                || !await isIncludesContentInSource(`${folder}/pdepend-jdepend.xml`, phraseXml)
                || !await isIncludesContentInSource(`${folder}/pdepend-summary.xml`, phraseXml)) {
                removeSource(`${folder}/pdepend-dependencies.xml`);
                removeSource(`${folder}/pdepend-jdepend.xml`);
                removeSource(`${folder}/pdepend-summary.xml`);
                removeSource(`${folder}/pdepend-jdepend.svg`);
                removeSource(`${folder}/pdepend-pyramid.svg`);
            }

            if (!await isIncludesContentInSource(`${folder}/phpcpd.xml`, phraseXml)) {
                removeSource(`${folder}/phpcpd.xml`);
            }

            if (!await isIncludesContentInSource(`${folder}/phploc.xml`, phraseXml)) {
                removeSource(`${folder}/phploc.xml`);
            }

            if (!await isIncludesContentInSource(`${folder}/phpmd.xml`, phraseXml)) {
                removeSource(`${folder}/phpmd.xml`);
            }

        }
    }

    return rowObject;
}

async function main() {
    const data = await getData(filepath);

    for (let i = 0; i < data.length; i++) {
        console.log(`${i+1}/${data.length}`)
        await clean(data[i]);
    }
}

main();

