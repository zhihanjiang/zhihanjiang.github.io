// var util = require("util");
// var fs = require("fs");
// var ndarray = require("ndarray");
// var turf = require("@turf/turf");
// var ops = require("ndarray-ops");
// // var ndarray = require("ndarray");
// // var ops = require("ndarray-ops");
// // var geojson = require("geojson");
// // var colormap = require('colormap');
// // var turf = require("@turf/turf");
// // var path = require("path");
// // var _ = require('lodash');
// // var os = require("os");



// city="abidjan";

// data_layer={};

// util.log("load_base_station");
// // load binary data
// data_layer.base_station = {};
// var bin = fs.readFileSync(util.format(
// "../../data/%s/base_station.bin",
// //  process.cwd(),
// city
// ));
// var arr = new Float64Array(bin.buffer);
// console.log(arr);
// data_layer.base_station.number = arr.length / 3;
// data_layer.base_station.ndarray = ndarray(arr, [data_layer.base_station.number, null], [1, data_layer.base_station.number]);
// // generate geojson
// var point_list = [];
// for (var i = 0; i < data_layer.base_station.number; i++) {
// var point = turf.point([
//   data_layer.base_station.ndarray.get(i, 1), data_layer.base_station.ndarray.get(i, 2)
// ], {
//   name: data_layer.base_station.ndarray.get(i, 0),
//   bid: i
// });
// point_list.push(point);
// }
// data_layer.base_station.geojson = turf.featureCollection(point_list);



// util.log("load_traffic");
// data_layer.traffic = {};
// var bin = fs.readFileSync(util.format(
// "../../data/%s/traffic.bin",
// //  process.cwd(),
// city
// ));
// var arr = new Float64Array(bin.buffer);
// data_layer.traffic.ndarray = ndarray(arr, [data_layer.base_station.number, null], [1, data_layer.base_station.number]);
// util.log("update_traffic: id %d", data_layer.frame_id);

// data_layer.traffic.frame = data_layer.traffic.ndarray.pick(null, data_layer.frame_id);
// util.log('overall traffic: %d', ops.sum(data_layer.traffic.frame));
// for (var i in data_layer.base_station.geojson.features) {
// data_layer.base_station.geojson.features[i].properties.color = data_layer.traffic.frame.get(i) / 2e5;
// }

// util.log("load_handover");
// data_layer.handover = {};
// var bin = fs.readFileSync(util.format(
// "../../data/%s/handover.bin",
// //  process.cwd(),
// city
// ));
// var arr = new Float64Array(bin.buffer);
// data_layer.handover.ndarray = ndarray(arr, [data_layer.base_station.number, data_layer.base_station.number, null], [1, data_layer.base_station.number,
// data_layer.base_station.number * data_layer.base_station.number
// ]);

// util.log("update_handover: id %d", data_layer.frame_id);

// data_layer.handover.frame = data_layer.handover.ndarray.pick(null, null, data_layer.frame_id);
// // data_layer.handover.frame.set(113, 33, 10); // TODO: temp inject
// // generate geojson
// var handover_list = [];
// for (var j = 0; j < data_layer.base_station.number; j++) {
// for (var i = j; i < data_layer.base_station.number; i++) {
//   if (data_layer.handover.frame.get(i, j) > 0) {
//     var line = turf.lineString(
//       [
//         [data_layer.base_station.ndarray.get(i, 1), data_layer.base_station.ndarray.get(i, 2)],
//         [data_layer.base_station.ndarray.get(j, 1), data_layer.base_station.ndarray.get(j, 2)]
//       ], {
//         weight: data_layer.handover.frame.get(i, j)
//       });
//     handover_list.push(line);
//   }
// }
// }
// data_layer.handover.geojson = turf.featureCollection(handover_list);
// console.log(data_layer.handover.geojson);

// fs.appendFileSync("test.txt", data_layer.handover.ndarray[0].toString());
// for(var i=0;i<data_layer.handover.ndarray.length;++i){
// 	fs.appendFileSync("test.txt", data_layer.handover.ndarray[i] + " " + data_layer.hosp[j].id + " " + result.routes[0].distance + "\n");
// }
