var geojson = require("geojson");
var jsonfile = require("jsonfile");
var math = require('mathjs');
var _ = require('lodash');
var fs = require("fs");

var bin = fs.readFileSync("./data/abidjan/base_station.bin");
var arr = new Float64Array(bin.buffer);
var base_station_num = arr.length / 3;
var base_station_list = _.unzip(_.chunk(arr, base_station_num));

var bin = fs.readFileSync("./data/abidjan/cluster.bin");
var arr = new Float64Array(bin.buffer);
var cluster_list = _.unzip(_.chunk(arr, base_station_num));

var bin = fs.readFileSync("./data/abidjan/link.bin");
var arr = new Float64Array(bin.buffer);
var link_matrix = _.unzip(_.chunk(arr, base_station_num));

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
        name: name,
        cluster: cluster_list[bid][0]
    };
    point_list.push(point);
}
var base_station = geojson.parse(point_list, {
    Point: "coordinates",
    include: ["bid", "icon", "name", "cluster"]
});

// generate link geojson
var link_list = [];
for (var j = 0; j < base_station_list.length; j++) {
    for (var i = j; i < base_station_list.length; i++) {
        if (link_matrix[i][j] != 0) {
            var line_string = {
                type: "LineString",
                coordinates: [
                    [base_station_list[i][1], base_station_list[i][2]],
                    [base_station_list[j][1], base_station_list[j][2]]
                ],
                weight: link_matrix[i][j],
            }
            link_list.push(line_string);
        }
    }
}
var link = geojson.parse(link_list, {
    LineString: "coordinates",
    include: ["weight"]
});

jsonfile.writeFile("./data/abidjan/base_station.json", base_station);
jsonfile.writeFile("./data/abidjan/link.json", link);