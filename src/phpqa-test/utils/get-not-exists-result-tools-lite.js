const checkFileExists = require('./check-file-exists');

const toolsToFile = {
    'phpmetrics': 'phpmetrics.html',
    'phpcs': 'checkstyle.xml',
    'pdepend': 'pdepend-summary.xml',
    'phpcpd': 'phpcpd.xml',
    'phploc': 'phploc.xml',
    'phpmd': 'phpmd.xml',
}

/**
 * @param {string} folder
 * @param {string[]} tools
 * @returns {Promise<string[]>}
 */
async function getNotExistsResultToolsLite(folder, tools) {
    /**
     * @type {string[]}
     */
    const notExistsResultTools = [];

    await Promise.allSettled(
        tools.map(tool => checkFileExists(`${folder}/${toolsToFile[tool]}`).then(is => {
            if(!is){
                notExistsResultTools.push(tool);
            }
        }))
    )

    return notExistsResultTools;
}

module.exports = getNotExistsResultToolsLite