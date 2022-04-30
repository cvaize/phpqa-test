const fs = require('fs');
const csv = require('csv-parser')
const HTMLParser = require('node-html-parser');
const rimraf = require("rimraf");

const phraseXml = '<?xml'

const removeSource = function (filepath) {
    if (fs.existsSync(filepath)) {
        rimraf.sync(filepath);
        console.log(`Removed - ${filepath}`)
    }
}

/**
 *
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

const clean = function (rowObject) {

    let link = rowObject.link;
    if (link && link.includes('http')) {
        let splitedUrl = link.split('/');
        let repFolder = splitedUrl[3];
        let repName = splitedUrl[4];
        if (repFolder && repName) {
            let folder = `./dataset/analysis/${repFolder}/${repName}`;
            let cloneFolder = `${folder}-clone`;
            let phpmetricsHtmlFilepath = `${folder}/phpmetrics.html`;
            let phpmetricsXmlFilepath = `${folder}/phpmetrics.xml`;

            removeSource(cloneFolder);

            if (fs.existsSync(phpmetricsHtmlFilepath)) {
                let phpmetrics = fs.readFileSync(phpmetricsHtmlFilepath, 'utf-8');

                let root = HTMLParser.parse(phpmetrics);
                let rows = root.querySelectorAll('#score table tbody tr');

                if (!rows || !rows.length) {
                    removeSource(phpmetricsHtmlFilepath);
                    removeSource(phpmetricsXmlFilepath);
                }
            }

            if (!isIncludesContentInSource(`${folder}/checkstyle.xml`, phraseXml)) {
                removeSource(`${folder}/checkstyle.xml`);
            }

            if (!isIncludesContentInSource(`${folder}/pdepend-dependencies.xml`, phraseXml)
                || !isIncludesContentInSource(`${folder}/pdepend-jdepend.xml`, phraseXml)
                || !isIncludesContentInSource(`${folder}/pdepend-summary.xml`, phraseXml)) {
                removeSource(`${folder}/pdepend-dependencies.xml`);
                removeSource(`${folder}/pdepend-jdepend.xml`);
                removeSource(`${folder}/pdepend-summary.xml`);
                removeSource(`${folder}/pdepend-jdepend.svg`);
                removeSource(`${folder}/pdepend-pyramid.svg`);
            }

            if (!isIncludesContentInSource(`${folder}/phpcpd.xml`, phraseXml)) {
                removeSource(`${folder}/phpcpd.xml`);
            }

            if (!isIncludesContentInSource(`${folder}/phploc.xml`, phraseXml)) {
                removeSource(`${folder}/phploc.xml`);
            }

            if (!isIncludesContentInSource(`${folder}/phpmd.xml`, phraseXml)) {
                removeSource(`${folder}/phpmd.xml`);
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
