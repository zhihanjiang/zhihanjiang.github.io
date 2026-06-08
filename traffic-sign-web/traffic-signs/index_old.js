// Initialization =========================================================
var util = require('util');
mapboxgl.accessToken =
  "pk.eyJ1IjoibG9uZ2JpYW9jaGVuIiwiYSI6Ijd3c0FwaXMifQ.HB3MlrBeV29DHLYjsxvRUg";

data_layer = {};
data_layer.param = {};
map_layer = {};
map_layer.param = {};
map_layer.param.zoom = 11.4;
map_layer.param.center = [118.131624, 24.492368]; // island center
map_layer.show_pic_flag = false;
// Application entry =========================================================
$(function() {
  map_layer.map = new mapboxgl.Map({
    container: "map_view",
    center: map_layer.param.center,
    zoom: map_layer.param.zoom,
    style: "mapbox://styles/mapbox/dark-v9",
    preserveDrawingBuffer: true
  });
  map_layer.map.on("click", function(e) {});


  map_layer.map.loadImage('../res/img/no_parking.png', function(error, image) {
    if (error) throw error;
    map_layer.map.addImage("no_parking", image);
  });
  map_layer.map.loadImage('../res/img/turn_left.png', function(error, image) {
    if (error) throw error;
    map_layer.map.addImage("turn_left", image);
  });
  map_layer.map.loadImage('../res/img/turn_right.png', function(error, image) {
    if (error) throw error;
    map_layer.map.addImage("turn_right", image);
  });
  map_layer.map.loadImage('../res/img/uturn.png', function(error, image) {
    if (error) throw error;
    map_layer.map.addImage("uturn", image);
  });

  var img1 = new Image();
  var img2 = new Image();
  //  var imgContainer1 = document.getElementById("pic_view1");
  //  var imgContainer2 = document.getElementById("pic_view2");
  img1.width = 500;
  img1.height = 250;
  //  img2.width = 500;
  //  img2.height = 250;
  imgContainer1 = document.getElementById("pic_view1");
  //  imgContainer2 = document.getElementById("pic_view2");

  $('#pic_view1').show();
  //  $('#pic_view2').show();

  //function signs() {
  data_layer.signs = new Array();
  data_layer.features = new Array();
  types = ["no_parking", "turn_left", "turn_right", "uturn"];
  for (i = 0; i < types.length; ++i) {
    type = types[i];
    var url = "../data/sign_"+type+".json"/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
    read_signs(url,i,type);
  }
  function read_signs(url,i,type){
    var request = new XMLHttpRequest();
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
      if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
        var temp = JSON.parse(request.responseText)
        data_layer.signs[i] = temp[0];
        // console.log(i);
        // console.log(data_layer.signs[i]);
        var traffic_signs = data_layer.signs[i].map(a => [a.sign_lon, a.sign_lat]);
        data_layer.features[type] = new Array();
        // console.log(traffic_signs);
        for (var j = 0; j < traffic_signs.length; ++j) {
          //console.log(traffic_signs[j]);
          id = data_layer.signs[i][j].id;
          // console.log(id);
          // console.log(data_layer.signs[i]);
          data_layer.features[type].push({
            //  "id": id,
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": traffic_signs[j]
            },
            "properties": {
              "title": "",
              "icon": id
            }
          });
        }
        // console.log(data_layer.features[type]);
        show_signs(data_layer.features[type], type);
      }
    }
  }

  function add_layer(features, type) {
    map_layer.map.addLayer({
      "id": type,
      "type": "symbol",
      "source": {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": features
        }
      },
      "layout": {
        "icon-image": type,
        "icon-size": 0.05,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true
      }

    });
    map_layer.map.on("click", type, function(e) {
      util.log(e.point)
      var features = map_layer.map.queryRenderedFeatures(e.point, {
        layers: [type]
      });
      if (features.length) { /* features的长度，features是一个数组 */
        // Get coordinates from the symbol and center the map on those coordinates
        id = features[0].properties.icon; /* flyTo  (options, [eventData]) */
        util.log(type + " " + id);
        util.log(features[0].geometry.coordinates);
        if (map_layer.show_pic_flag == true) {
          imgContainer1.removeChild(img1)
          //      imgContainer2.removeChild(img2)
          map_layer.show_pic_flag = false
        }
        img1.src = '../../data/to1/' + id + '.jpg';
        //  img2.src = '../../data/signs/' + id + '_' + type + '.jpg';
        imgContainer1.appendChild(img1);
        //  imgContainer2.appendChild(img2);
        map_layer.show_pic_flag = true;
      }
      //   util.log(type);

    });
  }

  function show_signs(features, type) {
    map_layer.map.on("load", function() {
      //util.log(tl);
      // map_layer.map.loadImage('../res/img/' + type + '.png', function(error, image) {
      //   if (error) throw error;
      //   map_layer.map.addImage(type, image);
      add_layer(features, type);
    });


  }

  var tl_checkbox = document.getElementById('turn_left');
  var tr_checkbox = document.getElementById('turn_right');
  var ut_checkbox = document.getElementById('uturn');
  var p_checkbox = document.getElementById('no_parking');
  tl_checkbox.addEventListener('click', function() {
    type = "turn_left";
    if (tl_checkbox.checked) {
      //  util.log('dddd');
      add_layer(data_layer.features[type], type);

    } else {
      map_layer.map.removeLayer(type);
      map_layer.map.removeSource(type);
    }
  });
  tr_checkbox.addEventListener('click', function() {
    type = "turn_right";
    if (tr_checkbox.checked) {
      add_layer(data_layer.features[type], type);
    } else {
      map_layer.map.removeLayer(type);
      map_layer.map.removeSource(type);
    }
  });
  ut_checkbox.addEventListener('click', function() {
    type = "uturn";
    if (ut_checkbox.checked) {
      add_layer(data_layer.features[type], type);
    } else {
      map_layer.map.removeLayer(type);
      map_layer.map.removeSource(type);
    }
  });
  p_checkbox.addEventListener('click', function() {
    type = "no_parking";
    if (p_checkbox.checked) {
      add_layer(data_layer.features[type], type);
    } else {
      map_layer.map.removeLayer(type);
      map_layer.map.removeSource(type);
    }
  });



});
