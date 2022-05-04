const path = require("path");

/**
 * @param sourceFilepath
 * @returns {{basename: string, filename: string, folder: string, filepath: string, codeFolder: string, analysesFolder: string, extname: string}}
 */
function getFolders(sourceFilepath) {
    let filepath = path.resolve(sourceFilepath);

    let basename = path.basename(filepath);
    let extname = path.extname(filepath);
    let folder = filepath.split('.');
    folder.pop();
    folder = folder.join('.');
    let filename = folder.split(path.sep);
    filename = filename.pop();
    let codeFolder = path.join(folder, '/code');
    let analysesFolder = path.join(folder, '/analyses');

    return {
        filepath,
        basename,
        filename,
        extname,
        folder,
        codeFolder,
        analysesFolder,
    };
}

module.exports = getFolders;
