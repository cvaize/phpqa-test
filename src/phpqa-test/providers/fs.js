const fs = require('fs');
const childProcess = require('../providers/child-process');

module.exports = {
    /**
     * @param {string} filepath
     * @returns {Promise<boolean>}
     */
    exists(filepath) {
        return fs.promises.access(filepath, fs.constants.F_OK).then(() => true).catch(() => false)
    },
    /**
     * @param {string} filepath
     * @returns {Promise<void>}
     */
    mkdir(filepath) {
        return childProcess.exec(`mkdir -p ${filepath}`);
    },
    /**
     *
     * @param {string} filepath
     * @returns {Promise<*>}
     */
    unlink(filepath){
        return childProcess.exec(`rm -rf ${filepath}`);
    }
}