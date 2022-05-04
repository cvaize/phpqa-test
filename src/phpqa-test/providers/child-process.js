const exec = require('child_process').exec;

module.exports = {
    /**
     *
     * @param {string} cmd
     * @returns {Promise<unknown>}
     */
    exec(cmd) {
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                resolve(stdout ? stdout : stderr);
            });
        });
    }
}