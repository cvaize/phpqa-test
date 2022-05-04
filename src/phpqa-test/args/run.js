const fs = require('fs');
const path = require("path");
const config = require('../config/app');

const accessTools = Object.values(config.PHPQA.TOOLS)

const argsSettings = {
    args: [
        { // Путь к файлу csv
            type: 'string', name: 'filepath', short: 'f'
        },
        { // Phpqa tools которые нужно использовать в процессе обработки
            type: 'string', name: 'tools', short: 't', default: 'phpmetrics,phpmd,pdepend,phpcs,phpcpd,phploc'
        },
        { // Заголовок в котором хранится ссылка на github репозиторий
            type: 'string', name: 'column-link-key', short: 'cl', default: 'link'
        },
        { // Заголовок в котором хранится ссылка на github репозиторий
            type: 'string', name: 'column-size-key', short: 'cs', default: 'diskUsage (kb)'
        },
        { // Путь к конфигу phpqa .phpqa.yml
            type: 'string', name: 'filepath-phpqa-config', short: 'fc', default: './src/phpqa-test/.phpqa.yml'
        },
        { // Лимит в kb
            type: 'uinteger', name: 'size-limit', short: 'l', default: 200000
        },
    ], maxStrays: 0, stopAtError: true, errorExitCode: true
};

/**
 * @param {string[]} argv
 * @returns {{
 *   filepath: '/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv',
 *   tools: [ 'phpmetrics', 'phpmd', 'pdepend', 'phpcs', 'phpcpd', 'phploc' ],
 *   columns: { link: 'link', size: 'diskUsage (kb)' },
 *   phpqaConfigFilepath: '/home/cvaize/PhpstormProjects/datasince/commands/src/phpqa-test/.phpqa.yml',
 *   sizeLimit: 200000
 * }}
 */
function getArgs(argv, ArgParser) {

    const params = ArgParser.parse(argv, argsSettings);

    // 0
    let filepath = path.resolve(params.args.filepath);

    if (!filepath) {
        throw new Error('Укажите путь к файлу csv, который нужно обработать.');
    }

    if (!fs.readFileSync(filepath)) {
        throw new Error(`Файл не найден по пути: ${filepath}.`);
    }

    // 1
    let tools = params.args.tools;

    tools = (tools || '').split(',');
    for (let i = 0; i < tools.length; i++) {
        let tool = tools[i];
        if (!accessTools.includes(tool)) {
            throw new Error('Инструмент ' + tool + ' не предусмотрен.')
        }
    }

    if (!tools.length) {
        throw new Error('Укажите phpqa tools.')
    }

    // 2
    let columns = {
        link: params.args['column-link-key'],
        size: params.args['column-size-key'],
    }

    if (!columns.link) {
        throw new Error('Укажите колонку в которой находятся ссылки.')
    }

    if (!columns.size) {
        throw new Error('Укажите колонку в которой находятся размер.')
    }

    // 4
    let phpqaConfigFilepath = params.args['filepath-phpqa-config'];

    if (phpqaConfigFilepath) {
        phpqaConfigFilepath = path.resolve(phpqaConfigFilepath);
    }

    // 5
    let sizeLimit = params.args['size-limit'];

    sizeLimit = Number(sizeLimit || 0)

    if (!sizeLimit || Number.isNaN(sizeLimit)) {
        throw new Error('Укажите ограничение по размеру.')
    }

    return {filepath, tools, columns, phpqaConfigFilepath, sizeLimit};
}

module.exports = getArgs;
