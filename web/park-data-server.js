const http = require('http');
const jsonc = require('jsoncomp');

const fs = require('fs');
http.createServer((req, res) => {
    if (req.url === '/')
        res.end(fs.readFileSync('./web/park-data-index.html'));
    if (req.url === '/park-data-renderer.js')
        res.end(fs.readFileSync('./web/generic-data-renderer.js'));
    if (req.url === '/park-data')
        res.end(JSON.stringify(JSON.parse(fs.readFileSync('./data/park-data/page1.json'))));
    else
        res.end('');
}).listen(4040);