// Initialization =========================================================
// var $ = require("jquery");
var util = require("util");
var ndarray = require("ndarray");
var ops = require("ndarray-ops");
var colormap = require('colormap');
var turf = require("@turf/turf");
var _ = require('lodash');
var os = require("os");

var chart_layer = {};
chart_layer.param = {};
var data_layer = {};
data_layer.param = {};
var map_layer = {};
map_layer.param = {};
mapboxgl.accessToken =
  "pk.eyJ1IjoibG9uZ2JpYW9jaGVuIiwiYSI6Ijd3c0FwaXMifQ.HB3MlrBeV29DHLYjsxvRUg";
var time_layer = {};
time_layer.param = {};

// Safari 不能接受"2013-04-01 00:00:00"这样的时间格式，得换成"2013/04/01 00:00:00";

// settings: Abidjan
city = "abidjan";
map_layer.param.center = [-3.991019, 5.351848];
map_layer.param.zoom = 10.3;
time_layer.param.start_time = "2011/12/19 00:00:00";
time_layer.param.end_time = "2012/01/30 00:00:00";
time_layer.param.current_time = "2012/01/09 09:00:00";
time_layer.param.step = 60; // in minutes
chart_layer.param.start_time = "2012/01/02 00:00:00";
chart_layer.param.end_time = "2012/01/17 00:00:00";
data_layer.capacity = 200000;

//settings: Daker
// city = "dakar";
// map_layer.param.center = [-17.466667, 14.710778];
// map_layer.param.zoom = 11.5;
// time_layer.param.start_time = "2013/04/01 00:00:00";
// time_layer.param.end_time = "2014/07/01 00:00:00";
// time_layer.param.current_time = "2013/04/11 11:00:00";
// time_layer.param.step = 60; // in minutes
// chart_layer.param.start_time = "2013/04/01 00:00:00";
// chart_layer.param.end_time = "2013/04/15 00:00:00";
// data_layer.capacity = 300000;

// mode = 'day';
tpday = '_wekd_8_17';
path = '../data/';

// Application entry =========================================================
$(function() {
  time_layer.init();
  data_layer.init();
  map_layer.init();
  chart_layer.init();

  util.log("load_city_border");

  var request = new XMLHttpRequest();
  var url = path+city+'/city_border.json'/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
  request.open("get", url);/*设置请求方法与路径*/
  request.send(null);/*不发送数据到服务器*/
  request.onload = function () {/*XHR对象获取到返回信息后执行*/
    if (request.status == 200) {
      data_layer.city_border= JSON.parse(request.responseText);
      data_layer.base_station = {};
      url = path+city+'/base_station.bin'/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
      request.open("get", url);/*设置请求方法与路径*/
      request.responseType = 'arraybuffer';
      request.send(null);/*不发送数据到服务器*/
      request.onload = function () {/*XHR对象获取到返回信息后执行*/
        if (request.status == 200) {
          var bin = request.response;
          var arr = new Float64Array(bin);
          // arr = Array.from(arr);
          // console.log(arr.length);
          data_layer.base_station.number = arr.length / 3;
          data_layer.base_station.ndarray = ndarray(arr, [data_layer.base_station.number, null], [1, data_layer.base_station.number]);
          // generate geojson
          var point_list = [];
          for (var i = 0; i < data_layer.base_station.number; i++) {
            var point = turf.point([
              data_layer.base_station.ndarray.get(i, 1), data_layer.base_station.ndarray.get(i, 2)
            ], {
              name: data_layer.base_station.ndarray.get(i, 0),
              bid: i
            });
            point_list.push(point);
          }
          data_layer.base_station.geojson = turf.featureCollection(point_list);

          util.log("load_traffic");
          data_layer.traffic = {};

          // url = path+city+'/traffic.bin';
          // request.open("get", url);/*设置请求方法与路径*/
          // request.send(null);/*不发送数据到服务器*/
          // request.responseType = 'arraybuffer';
          url = path+city+'/basestation_geojson_'+city+'.json'/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
          request.open("get", url);/*设置请求方法与路径*/
          request.send(null);/*不发送数据到服务器*/
          request.responseType = 'text';
          request.onload = function () {/*XHR对象获取到返回信息后执行*/
            if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
              // bin = request.response;
              // arr = new Float64Array(bin);
              // data_layer.traffic.ndarray = ndarray(arr, [data_layer.base_station.number, null], [1, data_layer.base_station.number]);
              // util.log("update_traffic: id %d", data_layer.frame_id);
              // data_layer.traffic.frame = data_layer.traffic.ndarray.pick(null, data_layer.frame_id);
              // util.log('overall traffic: %d', ops.sum(data_layer.traffic.frame));
              // for (var i in data_layer.base_station.geojson.features) {
              //   data_layer.base_station.geojson.features[i].properties.color = data_layer.traffic.frame.get(i) / 2e5;
              // }
              data_layer.base_station.geojson=JSON.parse(request.responseText);
              load_traffic_series_list();
              load_traffic2();
              util.log("load_handover");
              data_layer.handover = {};
              url = path+city+'/handover_geojson_'+city+'.json'/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
              request.open("get", url);/*设置请求方法与路径*/
              request.responseType = 'text';
              request.send(null);/*不发送数据到服务器*/
              request.onload = function () {/*XHR对象获取到返回信息后执行*/
              if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
                  data_layer.handover.geojson = JSON.parse(request.responseText);
                  util.log("load_cluster");
                  data_layer.cluster = {};
                  url = path+city+'/cluster.bin'/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
                  request.open("get", url);/*设置请求方法与路径*/
                  request.responseType = 'arraybuffer';
                  request.send(null);/*不发送数据到服务器*/
                  request.onload = function () {/*XHR对象获取到返回信息后执行*/
                    if (request.status == 200) {
                      var bin = request.response;
                      var arr = new Float64Array(bin);
                      // console.log(arr.length);
                      data_layer.cluster.number = arr.length / 3;
                      data_layer.cluster.ndarray = ndarray(arr, [data_layer.cluster.number, null], [1, data_layer.cluster.number]);
                      var point_list = [];
                      data_layer.cluster.handover_rate = 0;
                      var cm = colormap({
                        colormap: 'hsv',
                        nshades: data_layer.cluster.number + 1,
                        format: 'hex'
                      });
                      cm = _.shuffle(cm);
                      for (var i = 0; i < data_layer.cluster.number; i++) {
                        var point = turf.point([
                          data_layer.cluster.ndarray.get(i, 0), data_layer.cluster.ndarray.get(i, 1)
                        ], {
                          // util: data_layer.cluster.ndarray.get(i, 2),
                          // bbu: data_layer.cluster.ndarray.get(i, 3),
                          hand: data_layer.cluster.ndarray.get(i, 2),
                          cid: i,
                          color: cm[i]
                        });
                        data_layer.cluster.handover_rate +=
                          data_layer.cluster.ndarray.get(i, 2);
                        point_list.push(point);
                      }
                      data_layer.cluster.geojson = turf.featureCollection(point_list);
                      data_layer.cluster.voronoi = turf.voronoi(data_layer.cluster.geojson, {
                        bbox: turf.bbox(data_layer.city_border)
                      });
                      // intersect with city border
                      for (var i in data_layer.cluster.voronoi.features) {
                        data_layer.cluster.voronoi.features[i] = turf.intersect(data_layer.cluster.voronoi.features[i], data_layer.city_border);
                        data_layer.cluster.voronoi.features[i].properties = data_layer.cluster.geojson.features[i].properties;
                      }
                      data_layer.cluster2 = new Array();
                      data_layer.BBUpool = new Array();
                      load_cluster2();
                      init();
                      // map_layer.map.on("load", function() {
                      //   init();
                      // });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  function load_cluster2() {
    util.log("load_cluster2");
    var request = new XMLHttpRequest();
    var url = path + city + '/clu_inner' + tpday + '.txt';
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
      if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
        var level = request.responseText;
        level = level.toString();
        level = level.split('\n');
        //console.log(level.length);
        for (var i = 0; i < level.length; ++i) {
          line = level[i].split(' ');
          var cl = parseInt(line[0]) - 1;
          var innerCl = line[1].split(',');
          //console.log(i);
          data_layer.cluster2[cl] = new Array();
          for (var j = 0; j < innerCl.length; ++j) {
            data_layer.cluster2[cl][j] = parseInt(innerCl[j]) - 1;
          }
          data_layer.BBUpool[cl] = {};
          var bbus = $.uniqueSort(data_layer.cluster2[cl]);
          data_layer.BBUpool[cl].BBUnumber = bbus.length;
          data_layer.BBUpool[cl].BBUs = new Array();
          for (var j = 0; j < bbus.length; ++j) {
            data_layer.BBUpool[cl].BBUs[j] = bbus[j];
          }
        }
      }
    }
  }

  data_layer.BBUs = new Array();
  load_rrhs();

  function load_rrhs() {
    var request = new XMLHttpRequest();
    var url = path + city + '/clu_rrhs' + tpday + '.txt';
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
      if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
        var level = request.responseText;
    // fs.readFile(path + city + '/clu_rrhs' + tpday + '.txt', 'utf-8', function(err, level) {
    //   if (err) throw err;
        level = level.toString();
        level = level.split('\n');

        for (var i = 0; i < level.length; ++i) {
          line = level[i].split(' ');
          var cl = parseInt(line[0]) - 1;
          var rrhs = line[1].split(',');
          data_layer.BBUs[cl] = new Array();
          for (var j = 0; j < rrhs.length; ++j) {
            data_layer.BBUs[cl][j] = parseInt(rrhs[j]) - 1;
          }
        }
      }
    }
  }

  function init(){
    util.log("show_city_border");
    // map_layer.map.on("load", function() {
      map_layer.map.addLayer({
        id: "city_border_layer",
        type: "line",
        source: {
          type: "geojson",
          data: data_layer.city_border
        },
        paint: {
          "line-dasharray": [3, 3],
          // "line-color": "#db4437",
          "line-color": "#333",
          "line-width": 2
        }
      });
      util.log("show_base_station");
      map_layer.map.addLayer({
        id: "base_station_layer",
        type: "circle",
        source: {
          type: "geojson",
          data: data_layer.base_station.geojson
        },
        // filter: ["==", "cluster", 4],
        paint: {
          //  "circle-radius": 4, // Dakar
          "circle-radius": 3, // Abidjan
          // "circle-radius": {
          //   property: "color",
          //   type: "exponential",
          //   stops: [
          //     [0, 1],
          //     [1, 6]
          //   ]
          // },
          "circle-color": "#f00",
          "circle-color": "#ec423c",
          //"circle-opacity": ["get", "color"],
          "circle-stroke-width": .5,
          "circle-stroke-color": "#ccc",
          "circle-stroke-opacity": .5
        }
      });
      util.log("show_handover");
      map_layer.map.addLayer({
        id: "handover_layer",
        type: "line",
        source: {
          type: "geojson",
          data: data_layer.handover.geojson
        },
        // filter: ["==", "bid", "177"],
        "paint": {
          "line-opacity": {
            property: "weight",
            type: "exponential",
            stops: [
              // [0, 0],
              // [10, 1]  //Dakar
              [1, 1],
              [20, 1] //abidjan
            ]
          },
          "line-width": {
            property: "weight",
            type: "exponential",
            stops: [
              // [1, 1],
              // [2, 2]   //Dakar
              [1, 1],
              [5, 5] //abidjan
            ]
          },
          // "line-color": "#00caff"
          "line-color": "#337ab7"
        }
      }, "base_station_layer");
      util.log("show_cluster");
      map_layer.map.addLayer({
        id: "cluster_layer",
        type: "fill",
        source: {
          type: "geojson",
          data: data_layer.cluster.voronoi
        },
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": .2,
        }
      });
      util.log("show_cluster_border");
      map_layer.map.addLayer({
        id: "cluster_layer_border",
        type: "line",
        source: {
          type: "geojson",
          data: data_layer.cluster.voronoi
        },
        paint: {
          "line-color": "#282c34",
          "line-opacity": .3,
        }
      });

    // });

    map_layer.map.on("click", "base_station_layer", function(e) {
      var p = e.features[0].properties;
      data_layer.traffic.series_id = p.bid;
      chart_layer.base_station_id = p.bid;
      util.log(util.format("\nbase_station: %d\nname: %d\n",
        p.bid, p.name));
      chart_layer.plot_traffic();
    });
    map_layer.map.on("click", function(e) {
      cancelAnimationFrame(map_layer.animation_frame);
    });

    
    data_layer.checkbox = new Array();
    map_layer.map.on("click", "cluster_layer", function(e) {
      var p = e.features[0].properties;
      util.log(util.format("\ncluster: %d\nhand: %f\n",
        p.cid, p.hand));
      util.log("BBU_number: " + data_layer.BBUpool[p.cid].BBUnumber);
      util.log("BBU_id: " + data_layer.BBUpool[p.cid].BBUs);
      var rrh_number = 0;
      var mydiv = document.getElementById("BBUs");
      mydiv.innerHTML = "";
      // while (mydiv.hasChildNodes()) {
      //   mydiv.removeChild(mydiv.firstChild);
      // }
      for (var i = 0; i < data_layer.BBUpool[p.cid].BBUnumber; ++i) {
        var bbu = data_layer.BBUpool[p.cid].BBUs[i];
        rrh_number = rrh_number + data_layer.BBUs[bbu].length;
        util.log("RRH_id in BBU " + bbu + " : " + data_layer.BBUs[bbu]);
        var oCheckbox = document.createElement("input");
        oCheckbox.id = "bbus";
        var myText = document.createTextNode("BBU" + bbu);

        // var br = document.createElement("div");
        // br.innerHTML = "<br/>";
        oCheckbox.setAttribute("type", "checkbox");
        oCheckbox.setAttribute("id", bbu);
        if (i > 0)
          oCheckbox.style.marginLeft = "10px";
        oCheckbox.onclick = function() {
          if (this.checked) {
            util.log(this.id);
            util.log(data_layer.BBUs[this.id]);
            plot_traffic(data_layer.BBUs[this.id]);

            for (var j = 0; j < $(this).siblings().length; ++j) {
              //  console.log($(this).siblings()[j]);
              $(this).siblings()[j].checked = false;
            }

            //      mydiv.child
          }
        }
        mydiv.appendChild(oCheckbox);
        mydiv.appendChild(myText);
        //  mydiv.appendChild(br);
        data_layer.checkbox[i] = {};
        data_layer.checkbox[i].id = bbu;
      }

      var label1 = document.getElementById("BBU_Pool_ID");
      label1.innerHTML = "BBU Pool ID : " + p.cid;
      var label2 = document.getElementById("BBU_Number");
      label2.innerHTML = "BBU Number : " + data_layer.BBUpool[p.cid].BBUnumber;
      var label3 = document.getElementById("RRH_Number");
      label3.innerHTML = "RRH Number : " + rrh_number;
    });

    $('#handover').css({
      'width': data_layer.cluster.handover_rate / 784.7 * 100 + '%'
    });
    chart_layer.data = [];
  }

  function load_traffic2() {
    util.log('load_traffic2');
    data_layer.traffic.series2 = [];
    var request = new XMLHttpRequest();
    var url = path + city + '/traffic.txt';
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
      if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
        var level = request.responseText;
    // fs.readFile(path + city + '/traffic.txt', 'utf-8', function(err, level) {
    //   if (err) throw err;
        level = level.toString();
        level = level.split('\n');
        //console.log(level);
        for (var i = 0; i < level.length; ++i) {
          line = level[i].split(' ');
          var cl = parseInt(line[0]) - 1;
          //console.log(cl);
          var traffic = line[1].split(',');
          data_layer.traffic.series2[cl] = new Array();
          for (var j = 0; j < traffic.length; ++j) {
            data_layer.traffic.series2[cl][j] = parseInt(traffic[j]);
          }
          //  console.log(data_layer.traffic.series2[cl]);
        }
      }
      //util.log("848");
    }
  }

  function plot_traffic(rrhs) {
    util.log('plot_traffic');
    $('#chart_view').show();
    chart_layer.data = [];
    var trace = [];
    var sum = 0;
    var sum_y = [];
    for (var i = 0; i < rrhs.length; ++i) {
      var base_station_id = rrhs[i];
      for (var j = 0; j < 24; ++j) {
        if (sum_y[j] == undefined) {
          sum_y[j] = data_layer.traffic.series2[base_station_id][j];
        } else {
          sum_y[j] = sum_y[j] + data_layer.traffic.series2[base_station_id][j];
        }
      }
      trace[i] = {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        y: data_layer.traffic.series2[base_station_id],
        type: "scatter",
        name: "RRH " + rrhs[i]
      }
      chart_layer.data.push(trace[i]);
    }
    var y = [];
    for (var i = 0; i < 24; ++i) {
      y.push(data_layer.capacity);
    }
    trace[rrhs.length] = {
      x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      y: y,
      type: "scatter",
      name: "capacity"
    }
    trace[rrhs.length + 1] = {
      x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      y: sum_y,
      line: {
        width: 3
      },
      type: "scatter",
      name: "Total Volume"
    }
    chart_layer.data.push(trace[rrhs.length]);
    chart_layer.data.push(trace[rrhs.length + 1]);
    for (var i = 0; i < sum_y.length; ++i) {
      if (sum_y[i] > data_layer.capacity) {
        sum += data_layer.capacity;
      } else {
        sum += sum_y[i];
      }
    }

    var layout = {
      title: 'Traffic of ' + rrhs,
      //+ "BBU Utilization: " + sum / (data_layer.capacity * 24) * 100 + "%",
      xaxis: {
        title: 'Time',
        zeroline: true
        //  range: [chart_layer.param.start_time, chart_layer.param.end_time]
      },
      yaxis: {
        title: 'Traffic Volume',
        zeroline: true
      }
    };
    // Plotly.purge('chart_view');
    Plotly.newPlot('chart_view', chart_layer.data, layout);
  }
  time_layer.update_time();
});

chart_layer.init = function(){}

load_traffic_series_list = function() {
    console.log("load_traffic_series_list");
    data_layer.traffic.series_list=[];
    var request = new XMLHttpRequest();
    var url = path + city + '/traffic_series_list_'+city+'.txt';
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () 
    {/*XHR对象获取到返回信息后执行*/
      if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
        var level = request.responseText;
    // fs.readFile(path + city + '/traffic.txt', 'utf-8', function(err, level) {
    //   if (err) throw err;
        level = level.toString();
        level = level.split('\n');
        for (var i = 0; i < level.length; ++i) {
          line = level[i].split(',');
          data_layer.traffic.series_list[i]=[];
          for(var j=0;j<line.length;++j){
            data_layer.traffic.series_list[i].push(parseInt(line[j]));
          }
        }
      }
    }
}

chart_layer.plot_traffic = function() {
    util.log('plot basestation traffic');
    $('#chart_view').show();

    data_layer.traffic.series = data_layer.traffic.series_list[data_layer.traffic.series_id];
    // data_layer.traffic.series = [];
    // var t = data_layer.traffic.ndarray.pick(data_layer.traffic.series_id, null);
    // // console.log(data_layer.traffic.series_id);
    // // console.log(t);
    // var i = 0;
    // while (t.get(i) != undefined) {
    //     data_layer.traffic.series.push(t.get(i));
    //     i++;
    // }
    // console.log(data_layer.traffic.series);
    var data = [{
        x: time_layer.ticks,
        y: data_layer.traffic.series,
        type: "scatter",
        name: "Real Traffic"
    }];
    var layout = {
        title: 'Traffic of Base Station ' + chart_layer.base_station_id,
        xaxis: {
            title: 'Time',
            zeroline: true,
            range: [chart_layer.param.start_time, chart_layer.param.end_time]
        },
        yaxis: {
            title: 'Traffic Volume',
            zeroline: true
        }
    };
    // Plotly.purge('chart_view');
    Plotly.newPlot('chart_view', data, layout);
}

chart_layer.plot_prediction = function() {
    util.log('plot_prediction');
    var data = [{
        x: time_layer.ticks,
        y: data_layer.prediction[chart_layer.base_station_id - 1],
        type: "scatter",
        name: "Predicted Traffic"
    }];
    var layout = {
        title: 'Prediction of Base Station',
        xaxis: {
            title: 'Time',
            range: [chart_layer.param.start_range, chart_layer.param.end_range]
        },
        yaxis: {
            title: 'Volume'
        }
    };
    Plotly.plot('chart_view', data, layout);
}

chart_layer.hide = function() {
    $('#chart_view').hide();
}

data_layer.init = function() {
  data_layer.frame_id = (time_layer.current_time.getTime() - time_layer.start_time.getTime()) / time_layer.step;
};

map_layer.init = function() {
  map_layer.map = new mapboxgl.Map({
    container: "map_view",
    center: map_layer.param.center,
    zoom: map_layer.param.zoom,
    style: "mapbox://styles/mapbox/light-v9",
    preserveDrawingBuffer: true,
    attributionControl: false
  });
  map_layer.map.on("click", function(e) {
    chart_layer.hide();
  });
};

time_layer.init = function() {
    // Fiat Lux [Genesis 1:3]
    time_layer.start_time = new Date(time_layer.param.start_time);
    time_layer.end_time = new Date(time_layer.param.end_time);
    time_layer.current_time = new Date(time_layer.param.current_time);
    time_layer.step = 6e4 * time_layer.param.step; // 6e4 = 1 minute
    var temp = Math.floor((time_layer.end_time - time_layer.start_time) / time_layer.step);
    time_layer.ticks = Array(temp).fill().map((_, idx) => (new Date(time_layer.start_time.getTime() + idx * time_layer.step)));
}

time_layer.update_time = function() {
    util.log("update_time");
    time_layer.current_time = new Date(time_layer.start_time.getTime() + data_layer.frame_id * 60 * 60 * 1e3);
    $('#time').html(time_layer.current_time);
}
