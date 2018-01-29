const http = require('http');

const fs = require('fs');
http.createServer((req, res) => {
    if (req.url === '/')
        res.end(fs.readFileSync('./web/segment-data-index.html'));
    if (req.url === '/segment-data-renderer.js')
        res.end(fs.readFileSync('./web/generic-data-renderer.js'));
    if (req.url === '/segment-data') {
        const merged = JSON.parse(fs.readFileSync('./data/segment-data/page1.json'));
        for (let i = 2; i <= 30; i++)
            merged.data = merged.data.concat(...JSON.parse(fs.readFileSync('./data/segment-data/page' + i + '.json')).data);
        res.end(JSON.stringify(merged));
    } else
        res.end('');
}).listen(4040);
