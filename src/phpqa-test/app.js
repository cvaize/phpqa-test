const timeLog = require('./utils/time-log').timeLog;
const ArgParser = require("argparce");

const command = process.argv[2];

const endLog = timeLog(`Выполнение команды ${command}`)

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
})
