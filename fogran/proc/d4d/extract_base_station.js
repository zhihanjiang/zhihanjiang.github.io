var geojson = require("geojson");
var jsonfile = require("jsonfile");
var math = require('mathjs');
var _ = require('lodash');
var fs = require("fs");

var bin = fs.readFileSync("./data/abidjan/base_station.bin");
var arr = new Float64Array(bin.buffer);
var base_station_num = arr.length / 3;
var base_station_list = _.unzip(_.chunk(arr, base_station_num));

// generate base station geojson
var point_list = [];
for (var bid = 0; bid < base_station_list.length; bid++) {
    console.log(bid, base_station_list[bid]);

    var name = base_station_list[bid][0],
        lat = base_station_list[bid][1],
        lng = base_station_list[bid][2];
    var point = {
        type: "Point",
        coordinates: [lat, lng],
        bid: bid,
        icon: "bar",
        name: name
    };
    point_list.push(point);
}

var base_station = geojson.parse(point_list, {
    Point: "coordinates",
    include: ["bid", "icon", "name", "cluster"]
});

jsonfile.writeFile("./data/abidjan/base_station.json", base_station);