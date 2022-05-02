const fs = require('fs');
const checkFileExists = require("./check-file-exists");

/**
 * @param {string} filepath
 * @param {string} phrase
 * @returns {Promise<boolean>}
 */
async function isIncludesContentInSource(filepath, phrase) {
    if (await checkFileExists(filepath)) {
        /**
         * @var {string} content
         */

        let content = '';
        try {
            content = await fs.promises.readFile(filepath, 'utf-8');
        }catch (e){
        }

        return !!(content && content.includes(phrase));
    }
    return false;
}

module.exports = isIncludesContentInSource
