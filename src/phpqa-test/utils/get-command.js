/**
 * @returns {string}
 */
function getCommand() {
    return process.argv[2];
}

module.exports = getCommand;