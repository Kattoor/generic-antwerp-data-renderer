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
        //obj.pixelizedCoordinates = [[{x,y}, {x,y}, {x,y}, {x,y}, {x,y}, ...], [{x,y}, {x,y}, {x,y}, {x,y}, {x,y}, ...], [{x,y}, {x,y}, {x,y}, {x,y}, {x,y}, ...], ...]
        let coordsArray;
        switch (obj.geoType) {
            case 'LineString':

                break;
            case 'MultiLineString':
                ctx.beginPath();
                coordsArray = obj.pixelizedCoordinates.map(line => line.map(getCoords(xExtrema, yExtrema)));
                coordsArray.forEach(line => {
                    ctx.moveTo(line[0].x, line[0].y);
                    line.slice(1).forEach(coords => ctx.lineTo(coords.x, coords.y));
                });
                ctx.closePath();
                ctx.stroke();
                break;
            case 'Polygon':
                coordsArray = obj.pixelizedCoordinates.map(district => district.map(getCoords(xExtrema, yExtrema)));
                coordsArray.forEach(district => {
                    ctx.beginPath();
                    ctx.moveTo(district[0].x, coordsArray[0].y);
                    district.slice(1).forEach(coords => ctx.lineTo(coords.x, coords.y));
                    ctx.closePath();
                    ctx.fill();
                });
                break;
            default:
                console.log("wtf");
                console.log(obj.geoType);
                break;
        }
    });
}

fetch('segment-data').then(response => response.json()).then(json => pixelizedData = json.data.map(latLon2Pixel));

function getExtrema(what, data) {
    const flattenedToOneDimension = [].concat(...[].concat(...data.map(obj => obj.pixelizedCoordinates)));
    return {
        min: Math.min(...flattenedToOneDimension.map(coord => coord[what])),
        max: Math.max(...flattenedToOneDimension.map(coord => coord[what]))
    };
}

/* latLon2Pixel
* From: [[lat, lon], [lat, lon], [lat, lon], ...]
* To:   [{x, y}, {x, y}, {x, y}, ...]
* */
function latLon2Pixel(obj) {
    const type = JSON.parse(obj.geometry).type;
    const coordinates = JSON.parse(obj.geometry).coordinates;
    let pixelizedCoordinates;

    switch (type) {
        case 'LineString':
            pixelizedCoordinates = coordinates.map(latLonPair => {
                const x = (latLonPair[1] * mapWidth) / 360; // lon
                const y = (latLonPair[0] * mapWidth) / 180; // lat
                return {x, y};
            });
            break;
        case 'MultiLineString':
            pixelizedCoordinates = coordinates.map(line =>
                line.map(latLonPair => {
                    const x = (latLonPair[1] * mapWidth) / 360; // lon
                    const y = (latLonPair[0] * mapHeight) / 180; // lat
                    return {x, y};
                })
            );
            break;
        case 'Polygon':
            pixelizedCoordinates = coordinates.map(district =>
                district.map(latLonPair => {
                    const x = (latLonPair[1] * mapWidth) / 360; // lon
                    const y = (latLonPair[0] * mapHeight) / 180; // lat
                    return {x, y};
                })
            );
            break;
    }
    return Object.assign(obj, {pixelizedCoordinates, geoType: type});
}

function getCoords(xExtrema, yExtrema) {
    return coords => {
        const x = (coords.x - xExtrema.min) / (xExtrema.max - xExtrema.min) * mapWidth;
        const y = (coords.y - yExtrema.min) / (yExtrema.max - yExtrema.min) * mapHeight;
        return {x, y};
    }
}