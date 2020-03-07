var turf = require("@turf/turf");

var bs_points = [];
var tn = require("./data/trentino/tn_4g.json").responseData;
for (var i in tn) {
    var bs = tn[i];
    // console.log(bs.latitude, bs.longitude);
    if (bs.firstseendate < 1388530800000) {
        bs_points.push([bs.longitude, bs.latitude]);
    }
}
var points = turf.points(bs_points);

var city_border = require("./data/trentino/city_border.json");
var searchWithin = turf.polygon(city_border.geometry.coordinates);

var ptsWithin = turf.pointsWithinPolygon(points, searchWithin);
console.log(ptsWithin.features.length);