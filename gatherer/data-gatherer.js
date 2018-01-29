const http = require('http');
const fs = require('fs');

module.exports = (baseUrl, outputFolder, fileNamePrefix) => {

    const pageUrlBuilder = buildUrl(baseUrl);

    function getPages(from, to) {
        const pages = Array.from({length: to - from + 1}, (value, index) => index + from);
        pages
            .map(requestData)
            .map(readData)
            .map(saveData);
    }

    function requestData(pageNumber) {
        return cb => http.get(pageUrlBuilder(pageNumber), cb(pageNumber));
    }

    function readData(requestFunction) {
        return cb => requestFunction(pageNumber =>
            res => {
                const binaryChunks = [];
                res.on('data', chunk => binaryChunks.push(chunk));
                res.on('end', () => cb(binaryChunks, pageNumber));
            });
    }

    function saveData(readFunction) {
        outputFolder.split('/').map((value, index, array) => {
            if (value !== '.') {
                const folderPath = array.slice(0, index + 1).join('/');
                if (!fs.existsSync(folderPath))
                    fs.mkdirSync(folderPath);
            }
        });

        if (!fs.existsSync(outputFolder))
            fs.mkdirSync(outputFolder);
        return readFunction((binaryBuffer, pageNumber) => fs.writeFile(`${outputFolder}/${fileNamePrefix}${pageNumber}.json`, Buffer.concat(binaryBuffer).toString(), _ => _));
    }

    function buildUrl(base) {
        return page => `${base}?page=${page}`;
    }

    return {getPages};
};
