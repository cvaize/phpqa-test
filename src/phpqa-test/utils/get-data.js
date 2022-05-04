const fs = require('fs');
const csv = require('csv-parser')

function getData(filepath) {
    return new Promise(function (resolve) {
        let csvRows = [];

        fs.createReadStream(filepath).pipe(csv()).on('data', (data) => csvRows.push(data))
            .on('end', () => {
                resolve(csvRows);
                // [
                //   { NAME: 'Daffy Duck', AGE: '24' },
                //   { NAME: 'Bugs Bunny', AGE: '22' }
                // ]
            });
    })
}

module.exports = getData