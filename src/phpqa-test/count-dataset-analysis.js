const fs = require('fs');
const csv = require('csv-parser')

let csvRows = [];
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

const counter = function (rowObject) {

    let link = rowObject.link;
    let ignore = true;
    let size = Number(rowObject['diskUsage (kb)']);

    if (!Number.isNaN(size) && size < 200000 && link && link.includes('http')) {
        let splitedUrl = link.split('/');
        let repFolder = splitedUrl[3];
        let repName = splitedUrl[4];
        if (repFolder && repName) {
            ignore = false;
            let folder = `./dataset/analysis/${repFolder}/${repName}`;

            if (fs.existsSync(`${folder}/phpmetrics.html`)) {
                counts.phpmetrics++;
            }

            if (fs.existsSync(`${folder}/checkstyle.xml`)) {
                counts.phpcs++;
            }

            if (fs.existsSync(`${folder}/pdepend-summary.xml`)) {
                counts.pdepend++;
            }

            if (fs.existsSync(`${folder}/phpcpd.xml`)) {
                counts.phpcpd++;
            }

            if (fs.existsSync(`${folder}/phploc.xml`)) {
                counts.phploc++;
            }

            if (fs.existsSync(`${folder}/phpmd.xml`)) {
                counts.phpmd++;
            }

        }
    }

    if (ignore) {
        counts.ignore++;
    }

    if(rowObject[p1] && rowObject[p2] && rowObject[p3] && rowObject[p4] && rowObject[p5] &&
        (
        (rowObject[p1] === '0' || rowObject[p1] === '100')
        || (rowObject[p2] === '0' || rowObject[p2] === '100')
        || (rowObject[p3] === '0' || rowObject[p3] === '100')
        || (rowObject[p4] === '0' || rowObject[p4] === '100')
        || (rowObject[p5] === '0' || rowObject[p5] === '100')
        ) &&
        (!rowObject['D. Orlov score 0 - 100'] || Number.isNaN(Number(rowObject['D. Orlov score 0 - 100'])))){
        counts.needReview++;
    }

    return rowObject;
}

fs.createReadStream('./dataset/60k_php_dataset_metrics.csv')
    .pipe(csv())
    .on('data', (data) => csvRows.push(data))
    .on('end', () => {
        counts.total = csvRows.length;
        csvRows.map(counter)
        counts.totalMinusIgnore = counts.total - counts.ignore;
        // Вывод в консоль результата
        console.log(counts);
        // [
        //   { NAME: 'Daffy Duck', AGE: '24' },
        //   { NAME: 'Bugs Bunny', AGE: '22' }
        // ]
    });
