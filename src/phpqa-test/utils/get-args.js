const fs = require('fs');
const ArgParser = require("argparce");
const path = require("path");
const config = require('../config/app');

const accessTools = Object.values(config.PHPQA.TOOLS)

const argsSettings = {
    args: [{
        // Путь к файлу csv
        type: 'string', name: 'filepath', short: 'f'
    }, {
        // Путь к конфигу phpqa .phpqa.yml
        type: 'string', name: 'phpqa-config-filepath', short: 'fc'
    }, {
        // Заголовок в котором хранится ссылка на github репозиторий
        type: 'string', name: 'column-link-key', short: 'cl', default: 'link'
    }, {
        // Заголовок в котором хранится ссылка на github репозиторий
        type: 'string', name: 'column-size-key', short: 'cs', default: 'diskUsage (kb)'
    }, {
        // Phpqa tools которые нужно использовать в процессе обработки
        type: 'string', name: 'tools', short: 't', default: 'phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc'
    }, {
        // Количество потоков
        type: 'uinteger', name: 'parallel-calls', short: 'pc', default: 4
    }, {
        // Лимит в kb
        type: 'uinteger', name: 'size-limit', short: 'l', default: 200000
    }, {
        // Группа
        type: 'string', name: 'group', short: 'g'
    }, {
        // Количество частей
        type: 'uinteger', name: 'chunks', short: 'ch'
    },], maxStrays: 0, stopAtError: true, errorExitCode: true
};

const commandsArgs = {
    run(params) {
        let filepath = path.resolve(params.args.filepath);

        if (!params.filepath) {
            throw new Error('Укажите путь к файлу csv, который нужно обработать.');
        }

        if (!fs.readFileSync(params.filepath)) {
            throw new Error(`Файл не найден по пути: ${params.filepath}.`);
        }

        return {filepath};
    },
    chunk(params) {
        let filepath = path.resolve(params.args.filepath);

        if (!params.filepath) {
            throw new Error('Укажите путь к файлу csv, который нужно разбить на части.');
        }

        if (!fs.readFileSync(params.filepath)) {
            throw new Error(`Файл не найден по пути: ${params.filepath}.`);
        }

        return {filepath};
    },
}

/**
 *
 * @param {string} command
 * @returns {{
 *   filepath: '/home/cvaize/PhpstormProjects/commands/dataset/60k_php_dataset_metrics.csv',
 *   group: 'chunk',
 *   chunksCount: 4,
 *   columnSizeKey: 'diskUsage (kb)',
 *   sizeLimit: 200000,
 *   phpqaConfigFilepath: '/home/cvaize/PhpstormProjects/commands/src/phpqa-test/.phpqa.yml'
 * }}
 */
function getArgs(command) {

    const params = ArgParser.parse(process.argv.slice(3), argsSettings);


    // let group = params.args.group;
    // let chunksCount = params.args.chunks;
    // let tools = params.args.tools;
    // let columnLinkKey = params.args['column-link-key'];
    // let parallelCalls = params.args['parallel-calls'];
    // let columnSizeKey = params.args['column-size-key'];
    // let sizeLimit = params.args['size-limit'];
    // let phpqaConfigFilepath = params.args['phpqa-config-filepath'];

    //
    // if (phpqaConfigFilepath) {
    //     phpqaConfigFilepath = path.resolve(phpqaConfigFilepath);
    // }
    //
    // if (!columnLinkKey) {
    //     throw new Error('Укажите колонку в которой находятся ссылки.')
    // }
    //
    // parallelCalls = Number(parallelCalls || 0)
    //
    // if (!parallelCalls || Number.isNaN(parallelCalls)) {
    //     throw new Error('Укажите количество параллельных вызовов.')
    // }
    //
    // tools = (tools || '').split(',');
    // for (let i = 0; i < tools.length; i++) {
    //     let tool = tools[i];
    //     if (!accessTools.includes(tool)) {
    //         throw new Error('Инструмент ' + tool + ' не предусмотрен.')
    //     }
    // }
    //
    // if (!tools.length) {
    //     throw new Error('Укажите phpqa tools.')
    // }
    //
    // if (!group && command === config.COMMAND.CHUNKING) {
    //     throw new Error('Укажите группу.')
    // }
    //
    // if (!chunksCount && command === config.COMMAND.CHUNKING) {
    //     throw new Error('Укажите количество частей.')
    // }

    return commandsArgs[command](params);
}

module.exports = getArgs;
