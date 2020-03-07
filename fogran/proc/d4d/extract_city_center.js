var polygonCenter = require("geojson-polygon-center");

var city_border = require("./data/dakar/city_border.json");

var centroid = polygonCenter(city_border.geometry);
console.log(centroid);