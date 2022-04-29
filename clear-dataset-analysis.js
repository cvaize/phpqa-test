const fs = require('fs');
const csv = require('csv-parser')
const HTMLParser = require('node-html-parser');
const rimraf = require("rimraf");


const clean = function (rowObject) {

    let link = rowObject.link;
    if (link && link.includes('http')) {
        let splitedUrl = link.split('/');
        let repFolder = splitedUrl[3];
        let repName = splitedUrl[4];
        if (repFolder && repName) {
            let filepath = `./dataset/analysis/${repFolder}/${repName}/phpmetrics.html`;

            if (fs.existsSync(filepath)) {
                let phpmetrics = fs.readFileSync(filepath, 'utf-8');

                let root = HTMLParser.parse(phpmetrics);
                let rows = root.querySelectorAll('#score table tbody tr');

                if (!rows || !rows.length) {
                    rimraf.sync(`./dataset/analysis/${repFolder}/${repName}`);
                    console.log(`Removed - ./dataset/analysis/${repFolder}/${repName}`)
                }
            }

        }
    }

    return rowObject;
}

let csvRows = [];

fs.createReadStream('./dataset/60k_php_dataset_metrics.csv')
    .pipe(csv())
    .on('data', (data) => csvRows.push(data))
    .on('end', () => {
        csvRows.map(clean)
        // [
        //   { NAME: 'Daffy Duck', AGE: '24' },
        //   { NAME: 'Bugs Bunny', AGE: '22' }
        // ]
    });
