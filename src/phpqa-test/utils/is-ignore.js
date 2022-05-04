/**
 *
 * @param {number} size
 * @param {number} sizeLimit
 * @param {string} link
 * @returns {boolean|boolean}
 */
module.exports = function (size, sizeLimit, link){
    return size >= sizeLimit || !link || !link.includes('http')
}