
const withRejectTimeout = (promise, timeout = 2000) => {
    const timeoutError = new Error('Promise timeout');

    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(timeoutError), timeout)),
    ]);
};

module.exports = withRejectTimeout;
