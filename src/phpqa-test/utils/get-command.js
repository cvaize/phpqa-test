const config = require('../config/app');

let accessCommands = Object.values(config.COMMAND);

/**
 * @returns {string}
 */
function getCommand() {
    let command = process.argv[2];

    if (!accessCommands.includes(command)) {
        throw new Error('Команда ' + command + ' не предусмотрена.')
    }

    return command;
}

module.exports = getCommand;