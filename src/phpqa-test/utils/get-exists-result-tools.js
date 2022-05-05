const fs = require('fs');
const HTMLParser = require('node-html-parser');
const isIncludesContentInSource = require('./is-includes-contentIn-source');
const checkFileExists = require('./check-file-exists');

const phraseXml = '<'

/**
 * @param {string} folder
 * @returns {Promise<['phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc']>}
 */
async function getExistsResultTools(folder) {
    let existsResultTools = [];

    await Promise.allSettled([
        new Promise(async (resolve) => {
            try {
                let phpmetricsHtmlFilepath = `${folder}/phpmetrics.html`;
                let phpmetricsXmlFilepath = `${folder}/phpmetrics.xml`;
                if (await checkFileExists(phpmetricsHtmlFilepath) && await isIncludesContentInSource(phpmetricsXmlFilepath, phraseXml)) {
                    let phpmetrics = await fs.promises.readFile(phpmetricsHtmlFilepath, 'utf-8');

                    let root = HTMLParser.parse(phpmetrics);
                    let rows = root.querySelectorAll('#score table tbody tr');

                    if (rows || rows.length) {
                        existsResultTools.push('phpmetrics');
                    }
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await isIncludesContentInSource(`${folder}/checkstyle.xml`, phraseXml)) {
                    existsResultTools.push('phpcs');
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await isIncludesContentInSource(`${folder}/pdepend-summary.xml`, phraseXml)) {
                    existsResultTools.push('pdepend');
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await isIncludesContentInSource(`${folder}/phpcpd.xml`, phraseXml)) {
                    existsResultTools.push('phpcpd');
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await isIncludesContentInSource(`${folder}/phploc.xml`, phraseXml)) {
                    existsResultTools.push('phploc');
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await isIncludesContentInSource(`${folder}/phpmd.xml`, phraseXml)) {
                    existsResultTools.push('phpmd');
                }
            } finally {
                resolve();
            }
        }),
    ])

    return existsResultTools;
}

module.exports = getExistsResultTools