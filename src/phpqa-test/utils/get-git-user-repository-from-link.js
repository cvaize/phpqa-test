/**
 * @param {string} link
 */
module.exports = function getGitUserRepositoryFromLink(link) {
    let user = '';
    let repository = '';
    if (link.includes('http:') || link.includes('https:')) {
        let splitedLink = link.split('/');
        user = (splitedLink[3] || '').trim();
        repository = (splitedLink[4] || '').trim();
    }
    return {
        user,
        repository,
    }
}