/**
 * @param {string} group
 * @param {number} index
 * @returns {string}
 */
module.exports = function getChunkName(group, index) {
    return `${group}-${index}`;
}
