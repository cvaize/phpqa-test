const fs = require('fs');
const csvWriter = require('csv-write-stream')

function writeData(filepath, data) {
    console.log(filepath, data.length)
    return new Promise(function (resolve) {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        const writer = csvWriter()

        writer.pipe(fs.createWriteStream(filepath))
        for (let i = 0; i < data.length; i++) {
            writer.write(data[i])
        }
        writer.end()

        setTimeout(resolve, 100)
    })
}

module.exports = writeData