var $ = require("jquery");
var util = require("util");
// var fs = require("fs");
var os = require("os");
var mapstyle;
var center=[118.131624,24.492368];
// var center=[104.09,30.69];
var zoom=13;
var month=9;
var mapstyle;
var chart_map;
var bmap
var line;
var station;
var series = [];
var color = ['#3ed4ff', '#ffa022', '#a6c84c','#FFCCFF','#FFCCCC','#FF9900','#9900FF','#3399CC','#666699','#663366'];
var cd_id_location;
var xm_id_location;
var siming=[189,211,277,284,297,301,302,309,311,313,314,315,317,318,322,327,328,331,337,371,392,393,396,397,410,417,423,427,430,433,439,448,454,458,466,470,474,480,481,486,488,496,498,506,511,523,536,537,539,543,552,570,585,589,592,606,607,618,729,731,732,734,735,738,740,743,745,746,747,751,753,757,758,765,766,767,777,780,790,791,795,802,826,829,830,832];
var huli=[42,160,170,255,256,259,269,274,279,288,294,298,303,316,524,545,560,566,588,599,620,625,631,634,640,641,642,648,650,651,652,653,656,667,680,687,688,690,691,696,698,699,739,768,776,782,785,788,789,798,799,800,803,804,806,807,808,810,822,833];
var jinniu=[96,115,342,356,379,380,391,393,403,406,407,409,410,420,422,425,426,427,428,430,434,435,438,441,443,444,460,464,469,474,477,522,619];
var qingyang=[266,270,276,286,288,297,298,300,301,312,313,315,316,318,319,324,331,333,341,349,363,368,369,378,382,383,520,532,544];
var chenghua=[287,293,294,306,326,327,339,367,392,402,446,447,450,592,644,646];



// 2016-09-14 14:00
// var trajs_huli = [[26,31,31,31],[29,33,33,33],[31,54,51,51],[33,56,50,50],[37,43,38,38],[49,49,49,49],[50,50,54,54],[53,53,53,53],[55,55,55,55],[60,28,28,29]];
// var trajs_siming = [[23,23,23,23],[55,55,55,55],[58,80,80,80],[61,61,61,61],[63,63,63,63],[65,65,65,65],[67,70,67,67],[75,75,75,75],[78,78,78,78],[80,76,76,76]];

var hour = 8;  // 14 

var trajs={'huli':[],'siming':[],'qingyang':[],'chenghua':[],'jinniu':[]};

read_trajs('huli',hour);
read_trajs('siming',hour);
read_trajs('qingyang',hour);
read_trajs('chenghua',hour);
read_trajs('jinniu',hour);

// fs.readFile('data/custom_map_config.json', 'utf-8', function(err, data) {
//             mapstyle = JSON.parse(data);
//             chart_map = echarts.init(document.getElementById('map'), 'white', {renderer: 'canvas'});
//             update_map();
// });

var url = "data/custom_map_config.json"/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
var request = new XMLHttpRequest();
request.open("get", url);/*设置请求方法与路径*/
request.send(null);/*不发送数据到服务器*/
request.onload = function () {/*XHR对象获取到返回信息后执行*/
if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
    mapstyle = JSON.parse(request.responseText);
    chart_map = echarts.init(document.getElementById('map'), 'white', {renderer: 'canvas'});
    update_map();
}}

// 获取元素
var scrollBar = document.getElementById("scrollBar");
var text = document.getElementById("text");
// var note = document.getElementById("note");
// note.innerHTML = "Scroll the bar to get traffic violation heatmap at different time: ";
text.innerHTML = "Scroll the bar to get patrol routes at different time: 2016-"+month.toString()+"-" +(parseInt(hour/24)+1).toString()+" " + (hour%24).toString() + ":00:00";
var bar = scrollBar.children[0];
var mask = scrollBar.children[1];

// 拖动原理
bar.onmousedown = function(event){
    var event = event || window.event;
    var leftVal = event.clientX - this.offsetLeft;
    // 拖动放到down的里面
    var that = this;
    document.onmousemove = function(event){
        var event = event || window.event;
        that.style.left = event.clientX - leftVal + "px";
        // 限制条件
        var val = parseInt(that.style.left);
        if(val < 0){
            that.style.left = 0;
        }else if(val > 560){
            that.style.left = "720";
        }
        // 移动的距离为遮罩的宽度
        mask.style.width = that.style.left;
        // 显示百分比
        if(parseInt(that.style.left) % 24 < 14)
            hour=8+parseInt(parseInt(that.style.left)/24)*24;
        else
            hour=14+parseInt(parseInt(that.style.left)/24)*24;
        // hour = parseInt(parseInt(that.style.left) / 24 * 24)

        read_trajs('huli',hour);
        read_trajs('siming',hour);
        read_trajs('qingyang',hour);
        read_trajs('chenghua',hour);
        read_trajs('jinniu',hour);

        // console.log("移动了:"+ parseInt(parseInt(that.style.left) / 390 * 100) + "%")
        text.innerHTML = "Scroll the bar to get patrol routes at different time: 2016-"+month.toString()+"-"+ (parseInt(hour/24)+1).toString()+" " + (hour%24).toString() + ":00:00";
        // 清除拖动 --- 防止鼠标已经弹起时还在拖动
        window.getSelection ? window.getSelection().removeAllRanges():document.selection.empty();
    }
    // 鼠标抬起停止拖动
    document.onmouseup = function(){
        update_map();
        document.onmousemove = null;
    }
}


function read_trajs(district,hour){
    trajs[district]=[];
    var url = 'data/'+district+'/'+hour.toString()+'.txt'/*文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
    var request = new XMLHttpRequest();
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
    if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
        data = request.responseText;
        var lines=data.split('\n');
        for(var i=0;i<lines.length-1;++i){
            var items = lines[i].split(',');
            var traj=[];
            for(var j=0;j<items.length;++j){
                traj.push(parseInt(items[j]));
            }
            trajs[district].push(traj);
        }
    }}
    // fs.readFile('data/'+district+'/'+hour.toString()+'.txt', 'utf-8', function(err, data) {
    //     if(err)
    //         console.log(err);
    //     var lines=data.split('\n');
    //     for(var i=0;i<lines.length-1;++i){
    //         var items = lines[i].split(',');
    //         var traj=[];
    //         for(var j=0;j<items.length;++j){
    //             traj.push(parseInt(items[j]));
    //         }
    //         trajs[district].push(traj);
    //     }
    // });
}


function update_center(){
    var radios = document.getElementsByName("city");
    var value = 0;
    for(var i=0;i<radios.length;i++){
        if(radios[i].checked == true){
            value = radios[i].value;
        }
    }
    if(value=='0'){
        center=[118.131624,24.492368];
        zoom=13;
        city='xm';
        month=9;
    }
    else{
        center=[104.09,30.69];
        zoom=13;
        city='cd';
        month=11;
    }
    update_map();
}

function add_trajectories(station,district,trajs_district,data){
    var lines=[];
    console.log(station)
    console.log(trajs_district);
    console.log(data);
    for(var i=0;i<trajs_district.length;++i){
        var traj=trajs_district[i];
        // console.log(traj);
        line = {
                "fromName": "station",
                "toName": district[traj[0]-2].toString(),
                "value": 1,
                "coords": [station,gcj02tobd09(wgs84togcj02(convert(data[district[traj[0]-2].toString()])))]           
            }
        prior = (traj[0]-1).toString();
        // console.log(district[traj[0]-1]);
        prior_coords = gcj02tobd09(wgs84togcj02(convert(data[district[traj[0]-2].toString()])));
        lines.push(line);
        for(var j=1;j<traj.length;++j){
            line = {
                "fromName": prior,
                "toName": district[traj[0]-2].toString(),
                "value": 1,
                "coords": [prior_coords,gcj02tobd09(wgs84togcj02(convert(data[district[traj[j]-2].toString()])))]           
            }
            lines.push(line)
            prior = (traj[j]-1).toString();
            prior_coords = gcj02tobd09(wgs84togcj02(convert(data[district[traj[j]-2].toString()])));
       }
        line = {
            "fromName": prior,
            "toName": "station",
            "value": 1,
            "coords": [prior_coords,station]           
        }
        lines.push(line);
    }
    console.log(lines);
    for(var i=0;i<10;++i){
        series.push({
            name: lines[0+i*5]["toName"],
            type: 'lines',
            zlevel: 1,
            coordinateSystem: 'bmap',
            effect: {
                show: true,
                period: 6,
                trailLength: 0.7,
                color: color[i],
                    // symbol: planePath,
                symbolSize: 5
            },
            lineStyle: {
                normal: {
                    color: color[i],
                    width: 1,
                    curveness: 0.2
                }
            },
            data: lines.slice(0+i*5,5+i*5)
        });
    }
    series.push({
        name: 'station',
        type: 'scatter',
        coordinateSystem: 'bmap',
        data: [{
            name:'station',
            value: station.concat(200)

        }],
        symbolSize: 20,
        label: {
            formatter: '{b}',
            position: 'right'
        },
        itemStyle: {
            color: 'yellow',
            opacity: 1
        },
        emphasis: {
            label: {
                show: true
            }
        }
    });
    console.log(series);
}

function update_map(){
    var url = 'data/xm_id_location.json'/*文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
    var request = new XMLHttpRequest();
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
        if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
            xm_id_location = JSON.parse(request.responseText);
            url = 'data/cd_id_location.json';
            request = new XMLHttpRequest();
            request.open("get", url);/*设置请求方法与路径*/
            request.send(null);/*不发送数据到服务器*/
            request.onload = function () {/*XHR对象获取到返回信息后执行*/
                if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
                    cd_id_location = JSON.parse(request.responseText);
                    var station_huli = gcj02tobd09(wgs84togcj02([118.14016493427229,24.50554125938183]));
                    var station_siming = gcj02tobd09(wgs84togcj02([118.11517209082679,24.433350761026777]));

                    var station_chenghua = gcj02tobd09([104.1074977100,30.6808106100]);
                    var station_jinniu = gcj02tobd09(wgs84togcj02([104.0858402898076,30.684704083680735]));
                    var station_qingyang = gcj02tobd09(wgs84togcj02([104.00205407460498,30.703784841605867]));

                    console.log(trajs);

                    series=[];

                    add_trajectories(station_huli,huli,trajs['huli'],xm_id_location);
                    add_trajectories(station_siming,siming,trajs['siming'],xm_id_location);
                    add_trajectories(station_chenghua,chenghua,trajs['chenghua'],cd_id_location);
                    add_trajectories(station_jinniu,jinniu,trajs['jinniu'],cd_id_location);
                    add_trajectories(station_qingyang,qingyang,trajs['qingyang'],cd_id_location);
                    
                    update(center,zoom,series);
                    bmap = chart_map.getModel().getComponent('bmap').getBMap();
                }
            }
        }
    }

    // fs.readFile('data/xm_id_location.json', 'utf-8', function(err, data) {
    //     xm_id_location = JSON.parse(data);
    //     fs.readFile('data/cd_id_location.json', 'utf-8', function(err, data) {
    //         // console.log(err)
    //         cd_id_location = JSON.parse(data);
    //         var station_huli = gcj02tobd09(wgs84togcj02([118.14016493427229,24.50554125938183]));
    //         var station_siming = gcj02tobd09(wgs84togcj02([118.11517209082679,24.433350761026777]));

    //         var station_chenghua = gcj02tobd09([104.1074977100,30.6808106100]);
    //         var station_jinniu = gcj02tobd09(wgs84togcj02([104.0858402898076,30.684704083680735]));
    //         var station_qingyang = gcj02tobd09(wgs84togcj02([104.00205407460498,30.703784841605867]));

    //         console.log(trajs);

    //         series=[];

    //         add_trajectories(station_huli,huli,trajs['huli'],xm_id_location);
    //         add_trajectories(station_siming,siming,trajs['siming'],xm_id_location);
    //         add_trajectories(station_chenghua,chenghua,trajs['chenghua'],cd_id_location);
    //         add_trajectories(station_jinniu,jinniu,trajs['jinniu'],cd_id_location);
    //         add_trajectories(station_qingyang,qingyang,trajs['qingyang'],cd_id_location);
            
    //         update(center,zoom,series);
    //         bmap = chart_map.getModel().getComponent('bmap').getBMap();
    //     });
    // });
}

function update(center,zoom,series){
    chart_map.setOption(option = {
                "animation": true,
                "animationThreshold": 2000,
                "animationDuration": 1000,
                "animationEasing": "cubicOut",
                "animationDelay": 0,
                "animationDurationUpdate": 300,
                "animationEasingUpdate": "cubicOut",
                "animationDelayUpdate": 0,
                bmap: {
                    center: center,
                    zoom: zoom,
                    roam: true,
                    "mapStyle": {
                    "styleJson":mapstyle
                    }
                },
                "series": series,
                "tooltip": {
                    "trigger": "item"
                },
                "title": [{
                        "text": "",
                        "padding": 5,
                        "itemGap": 10
                    }]
            });
}


//定义一些常量
var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;

function bd09togcj02(bd_lon, bd_lat) { 
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return [gg_lng, gg_lat]
}
/**
* 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
* 即谷歌、高德 转 百度
* @param lng
* @param lat
* @returns {*[]}
*/
function gcj02tobd09([lng, lat]) { 
    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
    var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
    var bd_lng = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    return [bd_lng, bd_lat]
}
/**
* WGS84转GCj02
* @param lng
* @param lat
* @returns {*[]}
*/
function wgs84togcj02([lng, lat]) { 
    if (out_of_china(lng, lat)) {
        return [lng, lat]
    }
    else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        var mglat = lat + dlat;
        var mglng = lng + dlng;
        return [mglng, mglat]
    }
}
/**
* GCJ02 转换为 WGS84
* @param lng
* @param lat
* @returns {*[]}
*/
function gcj02towgs84(lng, lat) {
  //util.log(lng);
    if (out_of_china(lng, lat)) {
        return [lng, lat];
    }
    else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        mglat = lat + dlat;
        mglng = lng + dlng;
      //  util.log([lng * 2 - mglng, lat * 2 - mglat]);
        return [lng * 2 - mglng, lat * 2 - mglat];
    }
}
function transformlat(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret
}

function transformlng(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret
}

/**
 * 判断是否在国内，不在国内则不做偏移
 * @param lng
 * @param lat
 * @returns {boolean}
 */
function out_of_china(lng, lat) {
    return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
}

function convert(data) {
    return [parseFloat(data[0]),parseFloat(data[1])];
}
