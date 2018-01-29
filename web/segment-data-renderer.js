const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');
let mapWidth, mapHeight, pixelizedData;

setDimensions();

setInterval(() => {
    setDimensions();
    if (pixelizedData)
        draw();
}, 1000);

function setDimensions() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    mapWidth = canvas.width;
    mapHeight = canvas.height;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const xExtrema = getExtrema('x', pixelizedData);
    const yExtrema = getExtrema('y', pixelizedData);

    pixelizedData.forEach(obj => {
        ctx.beginPath();
        const coordsArray = obj.pixelizedCoordinates.map(getCoords(xExtrema, yExtrema));
        ctx.moveTo(coordsArray[0].x, coordsArray[0].y);
        coordsArray.slice(1).forEach(coords => ctx.lineTo(coords.x, coords.y));
        ctx.stroke();
    });
}

fetch('segment-data').then(response => response.json()).then(json => pixelizedData = json.data.map(latLon2Pixel));

function getExtrema(what, data) {
    const min = data.reduce((min, curr) => Math.min(...curr.pixelizedCoordinates.map(coord => coord[what])) < Math.min(...min.pixelizedCoordinates.map(coord => coord[what])) ? curr : min);
    const max = data.reduce((max, curr) => Math.max(...curr.pixelizedCoordinates.map(coord => coord[what])) > Math.max(...max.pixelizedCoordinates.map(coord => coord[what])) ? curr : max);
    return {min: Math.min(...min.pixelizedCoordinates.map(coord => coord[what])), max: Math.max(...max.pixelizedCoordinates.map(coord => coord[what]))};
}

/* latLon2Pixel
* From: [[lat, lon], [lat, lon], [lat, lon], ...]
* To:   [{x, y}, {x, y}, {x, y}, ...]
* */
function latLon2Pixel(obj) {
    const coordinates = JSON.parse(obj.geometry).coordinates[0];
    const pixelizedCoordinates = coordinates.map(latLonPair => {
        const x = (latLonPair[1] * mapWidth) / 360; // lon
        const y = (latLonPair[0] * mapHeight) / 180; // lat
        return {x, y};
    });
    return Object.assign(obj, {pixelizedCoordinates});
}

function getCoords(xExtrema, yExtrema) {
    return coords => {
        const x = (coords.x - xExtrema.min) / (xExtrema.max - xExtrema.min) * mapWidth;
        const y = (coords.y - yExtrema.min) / (yExtrema.max - yExtrema.min) * mapHeight;
        return {x, y};
    }
}