/**
 *
 * @param {number} size
 * @param {string} link
 * @returns {boolean|boolean}
 */
module.exports = function (size, link){
    return Number.isNaN(size) || size >= 200000 || !link || !link.includes('http')
}