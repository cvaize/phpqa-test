const buffer = {};

module.exports = {
    timeLog(label) {
        console.time(label);
        console.log(label + '...')
        buffer[label] = true;
        return function () {
            console.timeEnd(label);
            delete buffer[label];
        }
    },
    endAllLogs(){
        let labels = Object.keys(buffer);

        for (let i = 0; i < labels.length; i++) {
            let label = labels[i];
            console.timeEnd(label);
            delete buffer[label];
        }
    }
}