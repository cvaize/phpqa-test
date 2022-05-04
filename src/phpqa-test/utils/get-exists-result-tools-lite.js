const checkFileExists = require('./check-file-exists');

/**
 * @param {string} folder
 * @returns {Promise<['phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc']>}
 */
async function getExistsResultToolsLite(folder) {
    let existsResultTools = [];

    await Promise.allSettled([
        new Promise(async (resolve) => {
            try {
                let phpmetricsHtmlFilepath = `${folder}/phpmetrics.html`;
                let phpmetricsXmlFilepath = `${folder}/phpmetrics.xml`;
                if (await checkFileExists(phpmetricsHtmlFilepath) && await checkFileExists(phpmetricsXmlFilepath)) {
                    existsResultTools.push('phpmetrics');
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await checkFileExists(`${folder}/checkstyle.xml`)) {
                    existsResultTools.push('phpcs');
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await checkFileExists(`${folder}/pdepend-summary.xml`)) {
                    existsResultTools.push('pdepend');
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await checkFileExists(`${folder}/phpcpd.xml`)) {
                    existsResultTools.push('phpcpd');
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await checkFileExists(`${folder}/phploc.xml`)) {
                    existsResultTools.push('phploc');
                }
            } finally {
                resolve();
            }
        }),
        new Promise(async (resolve) => {
            try {
                if (await checkFileExists(`${folder}/phpmd.xml`)) {
                    existsResultTools.push('phpmd');
                }
            } finally {
                resolve();
            }
        }),
    ])

    return existsResultTools;
}

module.exports = getExistsResultToolsLite