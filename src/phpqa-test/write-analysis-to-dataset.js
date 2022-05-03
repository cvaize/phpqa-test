const fs = require('fs');
const csvWriter = require('csv-write-stream')
const HTMLParser = require('node-html-parser');
const ArgParser = require("argparce");
const getData = require("./utils/get-data");
const path = require("path");
const average = function (nums) {
    return nums.reduce((a, b) => (a + b)) / nums.length;
}

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
        }
    ],
    maxStrays: 0,
    stopAtError: true,
    errorExitCode: true
});

let filepath = params.args.filepath;
let columnLinkKey = params.args['column-link-key'];

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
let fileExtension = filename.pop();
filename = filename.join('.');
let analysesFolder = filename + '/analyses';

const sourceFilename = `${filename}.${fileExtension}`;
const resultFilename = `${filename}-result.${fileExtension}`;

let scoresDefault = {
    'Maintainability': '',
    'Accessibility for new developers': '',
    'Simplicity of algorithms': '',
    'Volume': '',
    'Reducing bug\'s probability': '',
    'Average Total': '',
};

const getScore = async function (repFolder, repName) {
    let scores = {
        ...scoresDefault,
    };
    let filepath = `${analysesFolder}/${repFolder}/${repName}/phpmetrics.html`;

    if (fs.existsSync(filepath)) {
        let phpmetrics = fs.readFileSync(filepath, 'utf-8');

        let scoresArray = [];
        let root = HTMLParser.parse(phpmetrics);
        let rows = root.querySelectorAll('#score table tbody tr');

        if (rows && rows.length) {
            for (let i = 0; i < rows.length; i++) {
                let cols = rows[i].querySelectorAll('td');
                let column = cols[0].innerText.replace('&#039;', '\'');
                scores[column] = Number(cols[1].innerText.split('/')[0].trim());
                scoresArray.push(scores[column]);
            }
            scores['Average Total'] = Math.round(average(scoresArray) * 100) / 100;
        }
    }

    return scores;
}

const fillScore = async function (rowObject) {
    rowObject = {
        ...rowObject,
        ...scoresDefault,
    }

    let link = rowObject.link;
    if (link && link.includes('http')) {
        let splitedUrl = link.split('/');
        let repFolder = splitedUrl[3];
        let repName = splitedUrl[4];
        if (repFolder && repName) {
            let scores = await getScore(repFolder, repName);
            rowObject = {
                ...rowObject,
                ...scores,
            }
            // Итерируем по первой строке, так как она всегда полная
        }
    }

    return rowObject;
}

async function main() {
    let data = await getData(filepath);

    for (let i = 0; i < data.length; i++) {
        console.log(`${i+1}/${data.length}`)
        data[i] = await fillScore(data[i])
    }

    const writer = csvWriter()
    if (fs.existsSync(resultFilename)) {
        fs.unlinkSync(resultFilename);
    }

    writer.pipe(fs.createWriteStream(resultFilename))
    for (let i = 0; i < data.length; i++) {
        writer.write(data[i])
    }
    writer.end()

    setTimeout(function () {
        if (fs.existsSync(sourceFilename) && fs.existsSync(resultFilename)) {
            fs.unlinkSync(sourceFilename);
            fs.renameSync(resultFilename, sourceFilename);
        }
    }, 100)
}

main()
