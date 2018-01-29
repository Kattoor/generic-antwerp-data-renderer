const baseUrl = 'http://datasets.antwerpen.be/v4/gis/segment.json';
const outputFolder = './data/segment-data';
const fileNamePrefix = 'page';

const dataGatherer = require('./data-gatherer.js')(baseUrl, outputFolder, fileNamePrefix);
dataGatherer.getPages(1, 30);
