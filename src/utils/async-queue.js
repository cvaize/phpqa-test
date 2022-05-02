/**
 *
 * @param {number} streams
 * @param {(data: Object) => Promise<boolean>} terminationCondition
 * @param {(data: Object) => Promise} worker
 * @param {Object} data
 * @returns {Promise<unknown>}
 */
function createQueue(streams, terminationCondition, worker, data){
    return new Promise(function (resolve){

        let runningStreams = 0
        streams = streams || 1;

        const mainQueue = async function (){
            if (await terminationCondition(data)) {
                if (runningStreams === 0) {
                    resolve(data);
                }
            } else {
                runningStreams++;
                await worker(data);
                runningStreams--;
                console.log('runningStreams', runningStreams)
                mainQueue();
            }
        }

        for (let i = 0; i < streams; i++) {
            // noinspection JSIgnoredPromiseFromCall
            mainQueue();
        }
    })
}

module.exports = createQueue