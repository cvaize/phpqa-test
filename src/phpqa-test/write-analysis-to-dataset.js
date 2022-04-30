const fs = require('fs');
const csv = require('csv-parser')
const csvWriter = require('csv-write-stream')
const HTMLParser = require('node-html-parser');
const average = function (nums) {
    return nums.reduce((a, b) => (a + b)) / nums.length;
}
//
// let replaceEnToRu = {
//     'Maintainability': 'Ремонтопригодность',
//     'Accessibility for new developers': 'Доступность для новых разработчиков',
//     'Simplicity of algorithms': 'Простота алгоритмов',
//     'Volume': 'Объем',
//     'Reducing bug&#039;s probability': 'Снижение вероятности ошибки',
// }

const sourceFilename = './dataset/60k_php_dataset_metrics.csv';
const resultFilename = './dataset/60k_php_dataset_for_labelling_result.csv';
let scoresDefault = {
    'Maintainability': '',
    'Accessibility for new developers': '',
    'Simplicity of algorithms': '',
    'Volume': '',
    'Reducing bug\'s probability': '',
    'Average Total': '',
};

const getScore = function (repFolder, repName) {
    let scores = {
        ...scoresDefault,
    };
    let filepath = `./dataset/analysis/${repFolder}/${repName}/phpmetrics.html`;

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

const fillScore = function (rowObject) {
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
            let scores = getScore(repFolder, repName);
            rowObject = {
                ...rowObject,
                ...scores,
            }
            // Итерируем по первой строке, так как она всегда полная
        }
    }

    return rowObject;
}

let csvRows = [];

fs.createReadStream(sourceFilename)
    .pipe(csv())
    .on('data', (data) => csvRows.push(data))
    .on('end', () => {
        csvRows = csvRows.map(fillScore)
        // [
        //   { NAME: 'Daffy Duck', AGE: '24' },
        //   { NAME: 'Bugs Bunny', AGE: '22' }
        // ]

        const writer = csvWriter()
        if (fs.existsSync(resultFilename)) {
            fs.unlinkSync(resultFilename);
        }

        writer.pipe(fs.createWriteStream(resultFilename))
        for (let i = 0; i < csvRows.length; i++) {
            let csvRow = csvRows[i];
            writer.write(csvRow)
        }
        writer.end()

        setTimeout(function (){
            if (fs.existsSync(sourceFilename) && fs.existsSync(resultFilename)) {
                fs.unlinkSync(sourceFilename);
                fs.renameSync(resultFilename, sourceFilename);
            }
        }, 100)
    });
