const timeLog = require('./utils/time-log').timeLog;
const endAllLogs = require('./utils/time-log').endAllLogs;
const ArgParser = require("argparce");

process.stdin.resume();//so the program will not close instantly

const command = process.argv[2];

const endLog = timeLog(`Выполнение команды ${command}`)

function exitHandler(options, exitCode) {
    if (options.cleanup) endAllLogs();
    // if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true, exit:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

let action;
let getArgs;
try {
    action = require(`./commands/${command}.js`)
    getArgs = require(`./args/${command}.js`)
} catch (e) {
    throw new Error('Команда ' + command + ' не предусмотрена.')
}

const argv = getArgs(process.argv.slice(3), ArgParser);

action(argv).then(() => {
    endLog();
    process.exit();
})
