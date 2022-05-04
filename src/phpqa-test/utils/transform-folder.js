const getFolders = require("./get-folders");

/**
 *
 * @param {string} filepath
 * @param {string} name
 * @return {{
 *       "filepath": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics.csv",
 *       "basename": "60k_php_dataset_metrics.csv",
 *       "filename": "60k_php_dataset_metrics",
 *       "extname": ".csv",
 *       "folder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics",
 *       "codeFolder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/code",
 *       "analysesFolder": "/home/cvaize/PhpstormProjects/datasince/dataset/60k_php_dataset_metrics/analyses"
 *     }}
 */
module.exports = function transformFolder(filepath, name) {
    filepath = filepath.split('.');

    filepath[filepath.length - 2]+= '-'+name;

    filepath = filepath.join('.');

    return getFolders(filepath);
}