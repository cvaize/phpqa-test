/**
 *
 * @param {number} size
 * @param {string} link
 * @returns {boolean|boolean}
 */
module.exports = function (size, sizeLimit, link){
    return Number.isNaN(size) || size >= sizeLimit || !link || !link.includes('http')
}