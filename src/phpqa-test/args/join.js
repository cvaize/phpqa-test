const getChunkArgs = require('./chunk');

function getArgs(argv, ArgParser) {
    return getChunkArgs(argv, ArgParser);
}

module.exports = getArgs;
