const baseUrl = 'http://datasets.antwerpen.be/v4/gis/parken.json';
const outputFolder = './data/park-data';
const fileNamePrefix = 'page';

const dataGatherer = require('./data-gatherer.js')(baseUrl, outputFolder, fileNamePrefix);
dataGatherer.getPages(1, 1);
