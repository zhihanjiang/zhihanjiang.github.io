var $ = require("jquery");
// var fs = require("fs");
var os = require("os");
var mapstyle;
var points;
var center=[118.131624,24.492368];
var h=0;
var zoom=13;
var mapstyle;
var chart_map;
var url = "../custom_map_config-3.json"/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
var request = new XMLHttpRequest();
request.open("get", url);/*设置请求方法与路径*/
request.send(null);/*不发送数据到服务器*/
request.onload = function () {/*XHR对象获取到返回信息后执行*/
if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
    mapstyle = JSON.parse(request.responseText);
    for(var i=0;i<mapstyle.length;i++){
        console.log(mapstyle[i].name);
    }
    console.log(mapstyle);
    chart_map = echarts.init(document.getElementById('map'), 'white', {renderer: 'canvas'});
    update_map(h);
}}

// fs.readFile('../custom_map_config-3.json', 'utf-8', function(err, data) {
//             mapstyle = JSON.parse(data);
//             chart_map = echarts.init(document.getElementById('map'), 'white', {renderer: 'canvas'});
//             update_map(h);
// });



// 获取元素
var scrollBar = document.getElementById("scrollBar");
var text = document.getElementById("text");
// var note = document.getElementById("note");
// note.innerHTML = "Scroll the bar to get traffic violation heatmap at different time: ";
text.innerHTML = "Scroll the bar to get traffic violation heatmap at different time -- 0:00)";
var bar = scrollBar.children[0];
var mask = scrollBar.children[1];

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
    }
    else{
        center=[104.08,30.7];
        zoom=14;
    }
    update_map(h);
}

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
            that.style.left = "570";
        }
        // 移动的距离为遮罩的宽度
        mask.style.width = that.style.left;
        // 显示百分比
        h = parseInt(parseInt(that.style.left) / 570 * 24)
        update_map(h);
        // console.log("移动了:"+ parseInt(parseInt(that.style.left) / 390 * 100) + "%")
        text.innerHTML = "Scroll the bar to get traffic violation heatmap at different time: "+ h + ":00";
        // 清除拖动 --- 防止鼠标已经弹起时还在拖动
        window.getSelection ? window.getSelection().removeAllRanges():document.selection.empty();
    }
    // 鼠标抬起停止拖动
    document.onmouseup = function(){
        document.onmousemove = null;
    }
}

function update_map(h){
    var url = '../data/bd_xm_'+h.toString()+'.json'/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
    var request = new XMLHttpRequest();
    request.open("get", url);/*设置请求方法与路径*/
    request.send(null);/*不发送数据到服务器*/
    request.onload = function () {/*XHR对象获取到返回信息后执行*/
    if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
        data = JSON.parse(request.responseText);
        points = [].concat.apply([], data.map(function (track) {
            return track.map(function (seg) {
                // console.log(seg.coord.concat([1]));
                return seg.coord.concat([seg.elevation]);
            });
        }));
        console.log(h.toString());
        
        // fs.readFile('../custom_map_config-3.json', 'utf-8', function(err, data) {
        //     mapstyle = JSON.parse(data);
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
                visualMap: {
                    "show": true,
                    "type": "continuous",
                    "min": 0,
                    "max": 40,
                    inRange: {
                        color: ['blue', 'blue', 'green', 'yellow', 'red']
                    },
                    "calculable": true,
                    "inverse": false,
                    "splitNumber": 5,
                    "orient": "vertical",
                    "showLabel": true,
                    "itemWidth": 20,
                    "itemHeight": 140,
                    "borderWidth": 0
                },
                series: [{
                    type: 'heatmap',
                    coordinateSystem: 'bmap',
                    data: points,
                    pointSize: 5,
                    blurSize: 6,
                    "label": {
                        "show": false,
                        "position": "top",
                        "margin": 8
                    },
                    "rippleEffect": {
                        "show": true,
                        "brushType": "stroke",
                        "scale": 2.5,
                        "period": 4
                    }
                }],
                "legend": [{
                    "data": [
                        "traffic violations"
                    ],
                    "selected": {
                        "traffic violations": true
                    },
                    "show": false,
                    "padding": 5,
                    "itemGap": 10,
                    "itemWidth": 25,
                    "itemHeight": 14
                }],
                "tooltip": {
                    "show": true,
                    "trigger": "item",
                    "triggerOn": "mousemove|click",
                    "axisPointer": {
                        "type": "line"
                    },
                    "formatter": function (params) {        return params.name + ' : ' + params.value[2];    },
                    "textStyle": {
                        "fontSize": 14
                    },
                    "borderWidth": 0
                },
                "title": [{
                        "text": "",
                        "padding": 5,
                        "itemGap": 10
                    }],
            });
            // 添加百度地图插件
            // chart_map.on('click',function(params){
            //     console.log(params);
            // });
            chart_map.setOption(option);
            var bmap = chart_map.getModel().getComponent('bmap').getBMap();
        // });
    }}
}

var mean_xm=new Array()
var mean_cd=new Array()
var std_xm=new Array()
var std_cd=new Array()
var thre_xm=new Array()
var thre_cd=new Array()
var loc_xm=new Array()
var loc_cd=new Array()

mean_xm_s='49.318377088305496,42.47704852824185,34.15139220365951,25.941089896579157,19.56189339697693,20.14546539379475,31.279156722354813,41.94156722354813,46.780429594272064,51.529355608591885,48.591169451073995,44.593556085918856,42.70839299920446,46.2933969769292,47.56742243436754,45.785759745425615,42.01197295147177,43.41328560063644,42.0239061256961,48.6,51.453739061256954,50.5656722354813,50.16467780429594,52.81145584725536';
mean_cd_s='15.466959492435336,12.07320644216691,7.841678867740361,4.7566129819424114,4.6389946315275745,4.190531966813079,6.869253294289899,24.85329428989751,44.72630551488531,50.561151781356756,50.772767203513915,50.66251830161054,49.48101512933138,56.45026842362128,59.82288921425085,55.3619326500732,52.29272816007809,51.78199121522694,52.06271351878965,49.2405075646657,45.58516349438751,44.67101024890191,39.571839921913124,29.754514397266963';
std_cd_s='33.240590159356856,26.578070361828242,17.269841771880323,10.758283030446016,11.499973638484317,11.379736263341494,18.060437862683987,53.39686232904565,83.03166445497388,97.98491263683698,101.36555304574802,100.76818161793328,99.60096988628275,112.05507709932061,117.71409368689741,108.31748165908259,104.28498235279245,102.16831512903161,99.922662297049,96.81154952094757,92.23942445929958,90.90610835293437,82.89101683997883,64.02648097101734';
std_xm_s='88.22208994160262,77.85678208897474,65.61629066136476,51.69746916677779,39.89357272889808,38.78595742310343,54.33640068680013,71.447891193627,80.93219675063894,88.53231147501174,83.60492163279541,76.69144522518377,73.41279185752653,79.42262977106702,81.5943195412307,79.02746164336995,75.60676359110754,75.84403555031723,73.01320347144227,83.16068742924499,88.74405148086076,89.07935982703633,89.35105921794516,94.58180988067562';
loc_cd_s='13,17,18,18,23,21,19,14,19,21,22,17,22,17,16,16,17,16,20,14,15,11,11,13,13,11,12,11,18,15,16,20,15,15,18,22,22,28,17,22,16,15,19,17,20,14,16,13,11,13,12,11,15,17,18,19,28,19,17,17,17,17,17,17,22,17,21,22,20,16,21,16,13,13,14,16,22,15,15,23,22,17,23,21,22,28,24,26,23,27,20,24,22,24,21,28,24,28,18,27,27,21,24,10,16,15,24,27,22,27,17,23,23,30,27,24,23,22,21,22,22,19,23,25,26,21,13,8,9,13,15,23,29,22,22,22,16,27,21,19,21,19,20,13,12,16,13,12,23,16,14,19,22,21,24,18,23,22,22,27,24,21,20,20,20,17,11,13,12,13,13,15,21,21,18,20,22,22,28,22,21,22,19,18,19,21,21,21,11,14,20,13,16,16,14,14,18,16,15,19,22,28,29,22,22,22,22,16,18,23,22,22,15,13,12,13,16,13,13,14,18,16,21,21,31,23,24,23,22,16,18,24,18,16,22,18,14,15,16,13,13,13,14,13,20,14,18,21,27,24,26,27,23,24,23,23,23,23,22,23,28,28,28,24,32,34,38,39,43,28,16,14,25,20,21,28,25,22,28,24,24,23,23,24,23,24,22,22,24,21,25,26,24,22,18,8,9,12,13,16,27,22,22,18,22,28,15,22,23,23,18,13,13,13,13,22,20,17,29,21,24,25,26,23,22,17,27,23,19,16,21,20,19,11,17,13,16,13,14,16,19,21,16,24,27,31,23,23,22,23,18,21,18,16,21,17,15,16,16,14,17,13,13,16,24,15,17,22,32,26,29,24,24,18,25,20,19,21,22,19,16,22,20,13,16,17,18,18,24,18,24,21,29,24,18,23,18,17,18,24,20,23,22,23,16,22,18,15,18,15,18,22,19,14,23,23,38,27,27,24,24,22,20,29,29,28,21,24,24,23,23,28,29,39,30,46,36,33,20,15,21,21,26,27,29,22,29,29,30,30,24,24,24,23,23,28,30,23,34,34,29,21,13,8,16,13,20,17,29,27,22,28,24,27,22,22,24,23,21,22,13,17,13,14,18,16,14,27,34,24,28,23,17,17,23,24,22,16,22,16,14,20,21,16,13,14,17,13,13,23,21,21,31,31,28,23,23,17,23,21,23,21,20,20,21,20,21,16,13,13,13,18,26,16,15,22,33,33,24,29,22,20,22,18,24,22,22,23,19,21,22,13,13,13,17,15,23,15,13,28,35,28,24,24,24,22,22,22,24,16,22,23,20,21,18,16,17,18,18,16,22,19,22,22,34,35,27,27,29,29,23,25,25,23,26,24,25,31,28,29,28,25,25,36,33,28,20,10,27,26,22,28,24,23,22,20,28,24,22,24,24,26,22,23,25,28,35,34,27,23,20,8,20,18,19,27,23,27,28,28,27,28,22,23,24,22,23,27,13,17,14,16,26,16,20,24,35,33,27,23,23,29,23,24,24,27,27,22,21,20,19,13,14,18,14,20,25,20,22,25,35,36,30,33,24,30,24,24,21,22,23,22,21,23,22,17,27,17,16,16,25,15,24,24,31,31,29,22,18,30,24,20,24,18,22,25,21,23,22,23';
loc_xm_s='43,31,32,38,46,43,49,62,51,42,55,57,48,46,55,72,78,46,40,62,57,57,47,47,38,27,33,25,26,30,60,61,40,40,57,57,46,45,56,73,52,52,19,40,43,50,51,48,52,42,57,50,52,33,59,53,53,50,55,55,55,46,45,73,67,59,58,58,57,54,41,38,49,48,57,49,52,46,37,53,52,50,55,46,46,45,55,76,66,51,60,58,57,50,62,47,48,29,32,25,30,31,73,62,32,51,56,46,46,46,57,73,67,66,46,59,54,55,42,39,37,27,23,27,26,44,53,61,49,55,57,57,46,57,48,63,70,50,50,47,43,56,39,46,38,29,32,29,39,46,38,62,51,52,57,51,63,60,59,82,70,71,67,68,59,41,55,50,36,30,32,35,31,42,65,75,45,51,63,47,48,55,79,76,72,79,57,61,49,58,44,46,29,51,29,31,26,30,40,35,40,53,46,48,48,48,46,67,56,56,33,43,52,44,41,51,66,53,65,50,61,44,51,54,57,51,46,46,46,45,48,64,70,63,40,57,55,56,40,41,54,44,63,55,67,46,51,46,52,56,45,56,45,54,58,57,69,53,54,54,34,38,47,48,38,28,26,28,29,44,61,55,40,55,56,48,40,56,56,43,60,50,46,58,53,56,48,48,36,36,29,32,31,46,52,60,51,56,46,47,56,47,57,51,68,53,47,44,40,41,38,49,51,31,31,42,33,46,60,59,55,56,47,47,37,37,25,20,35,43,53,45,44,28,14,16,7,4,0,0,0,0,0,0,0,0,0,0,0,0,3,0,4,4,3,3,3,3,3,3,3,3,3,3,3,5,7,23,23,12,14,26,12,20,13,25,27,35,39,38,21,24,19,36,44,39,43,35,43,46,43,44,44,41,36,26,46,34,11,10,29,33,40,6,7,7,14,10,22,21,27,27,25,42,63,45,41,42,40,43,41,42,48,63,62,51,51,56,49,32,46,50,38,46,35,32,44,43,41,61,40,46,46,49,38,41,53,67,70,66,50,52,53,36,47,48,51,38,29,31,33,41,30,43,39,45,36,45,38,47,47,66,59,66,48,43,44,45,47,46,29,33,33,27,29,42,58,42,41,50,48,48,48,57,49,63,68,51,43,45,56,63,49,48,37,40,28,30,25,35,55,37,40,42,47,47,51,48,51,61,73,64,45,57,61,59,52,49,38,28,35,29,33,58,56,61,43,47,42,48,46,47,46,51,67,65,43,39,57,51,43,52,61,54,61,71,38,48,64,48,57,46,46,55,46,55,47,54,61,65,48,57,57,51,42,53,67,73,69,63,51,67,51,58,64,56,45,48,49,46,48,51,68,61,59,59,54,39,60,48,46,28,24,25,27,57,56,46,49,46,46,48,48,48,47,57,70,62,48,56,56,46,56,48,51,26,28,26,33,33,50,45,49,44,46,51,50,52,46,60,58,39,30,21,34,42,19,7,4,3,3,3,3,11,18,38,70,55,32,25,34,33,23,33,58,37,45,48,46,29,38,19,23,19,17,23,23,39,48,56,45,46,45,49,49,58,52,66,60,65,47,30,37,37,46,52,38,36,29,28,28,42,55,47,56,46,45,47,50,53,48,48,58,65,35,39,33,38,30,14';
thre_xm_s='225.76255697151072,198.19061270619133,165.383973526389,129.33602823013473,99.34903885477308,97.71738024000162,139.9519580959551,184.83734961080214,208.64482309554995,228.59397855861536,215.80101271666481,197.9764465362864,189.5339767142575,205.13865651906326,210.75606151682894,203.84068303216551,193.22550013368684,195.1013567012709,188.05031306858064,214.92137485848997,228.94184202297848,228.72439188955394,228.86679624018626,241.9750756086066';
thre_cd_s='81.94813981114905,65.2293471658234,42.38136241150101,26.273179042834442,27.638941908496207,26.950004493496067,42.99012901965787,131.6470189479888,210.78963442483308,246.53097705503072,253.50387329500995,252.1988815374771,248.6829549018969,280.56042262226254,295.2510765880457,271.9968959682384,260.862692865663,256.11862147329015,251.90803811288765,242.86360660656084,230.06401241298667,226.48322695477066,205.3538736018708,157.80747633930164';
temp=mean_xm_s.toString().split(',');
for(var i=0;i<temp.length;++i){
    mean_xm[i]=new Array();
    mean_xm[i]=[i+1,Math.round((parseFloat(temp[i])))];
}
temp=mean_cd_s.toString().split(',');
for(var i=0;i<temp.length;++i){
    mean_cd[i]=new Array();
    mean_cd[i]=[i+1,Math.round(parseFloat(temp[i]))];
}
temp=std_xm_s.toString().split(',');
for(var i=0;i<temp.length;++i){
    std_xm[i]=new Array();
    std_xm[i]=[i+1,Math.round(parseFloat(temp[i]))];
}
temp=std_cd_s.toString().split(',');
for(var i=0;i<temp.length;++i){
    std_cd[i]=new Array();
    std_cd[i]=[i+1,Math.round(parseFloat(temp[i]))];
}
temp=thre_xm_s.toString().split(',');
for(var i=0;i<temp.length;++i){
    thre_xm[i]=new Array();
    thre_xm[i]=[i+1,Math.round(parseFloat(temp[i]))];
}
temp=thre_cd_s.toString().split(',');
for(var i=0;i<temp.length;++i){
    thre_cd[i]=new Array();
    thre_cd[i]=[i+1,Math.round(parseFloat(temp[i]))];
}
temp=loc_xm_s.toString().split(',');
for(var i=0;i<temp.length;++i){
    loc_xm[i]=new Array();
    loc_xm[i]=[i+1,Math.round(parseFloat(temp[i]))];
}
temp=loc_cd_s.toString().split(',');
for(var i=0;i<temp.length;++i){
    loc_cd[i]=new Array();
    loc_cd[i]=[i+1,Math.round(parseFloat(temp[i]))];
}

var chart_line = echarts.init(document.getElementById('line'), 'white', {renderer: 'canvas'});
var option = {
    "animation": true,
    "animationThreshold": 2000,
    "animationDuration": 1000,
    "animationEasing": "cubicOut",
    "animationDelay": 0,
    "animationDurationUpdate": 300,
    "animationEasingUpdate": "cubicOut",
    "animationDelayUpdate": 0,
    "series": [{
            "type": "line",
            "name": "mean_xm",
            "connectNulls": false,
            "symbol": "triangle",
            "symbolSize": 6,
            "showSymbol": true,
            "smooth": false,
            "step": false,
            "data":mean_xm,
            "hoverAnimation": true,
            "label": {
                "show": true,
                "position": "top",
                "margin": 8
            },
            "lineStyle": {
                "show": true,
                "width": 3,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
            },
            "areaStyle": {
                "opacity": 0
            },
            "zlevel": 0,
            "z": 0
        },
        {
            "type": "line",
            "name": "mean_cd",
            "connectNulls": false,
            "symbol": "arrow",
            "symbolSize": 6,
            "showSymbol": true,
            "smooth": false,
            "step": false,
            "data": mean_cd,
            "hoverAnimation": true,
            "label": {
                "show": true,
                "position": "top",
                "margin": 8
            },
            "lineStyle": {
                "show": true,
                "width": 3,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
            },
            "areaStyle": {
                "opacity": 0
            },
            "zlevel": 0,
            "z": 0
        },
        {
            "type": "line",
            "name": "std_xm",
            "connectNulls": false,
            "symbol": "diamond",
            "symbolSize": 6,
            "showSymbol": true,
            "smooth": false,
            "step": false,
            "data": std_xm,
            "hoverAnimation": true,
            "label": {
                "show": true,
                "position": "top",
                "margin": 8
            },
            "lineStyle": {
                "show": true,
                "width": 3,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
            },
            "areaStyle": {
                "opacity": 0
            },
            "zlevel": 0,
            "z": 0
        },
        {
            "type": "line",
            "name": "std_cd",
            "connectNulls": false,
            "symbol": "circle",
            "symbolSize": 6,
            "showSymbol": true,
            "smooth": false,
            "step": false,
            "data": std_cd,
            "hoverAnimation": true,
            "label": {
                "show": true,
                "position": "top",
                "margin": 8
            },
            "lineStyle": {
                "show": true,
                "width": 3,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
            },
            "areaStyle": {
                "opacity": 0
            },
            "zlevel": 0,
            "z": 0
        },
        {
            "type": "line",
            "name": "thre_xm",
            "connectNulls": false,
            "symbol": "rect",
            "symbolSize": 6,
            "showSymbol": true,
            "smooth": false,
            "step": false,
            "data": thre_xm,
            "hoverAnimation": true,
            "label": {
                "show": true,
                "position": "top",
                "margin": 8
            },
            "lineStyle": {
                "show": true,
                "width": 3,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
            },
            "areaStyle": {
                "opacity": 0
            },
            "zlevel": 0,
            "z": 0
        },
        {
            "type": "line",
            "name": "thre_cd",
            "connectNulls": false,
            "symbol": "pin",
            "symbolSize": 6,
            "showSymbol": true,
            "smooth": false,
            "step": false,
            "data":thre_cd,
            "hoverAnimation": true,
            "label": {
                "show": true,
                "position": "top",
                "margin": 8
            },
            "lineStyle": {
                "show": true,
                "width": 3,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
            },
            "areaStyle": {
                "opacity": 0
            },
            "zlevel": 0,
            "z": 0
        }
    ],
    "legend": [
        {
            "data": [
                "mean_xm",
                "mean_cd",
                "std_xm",
                "std_cd",
                "thre_xm",
                "thre_cd"
            ],
            "selected": {
                "mean_xm": true,
                "mean_cd": true,
                "std_xm": true,
                "std_cd": true,
                "thre_xm": true,
                "thre_cd": true
            },
            "show": true,
            "padding": 5,
            "itemGap": 10,
            "itemWidth": 25,
            "itemHeight": 14
        }
    ],
    "tooltip": {
        "show": true,
        "trigger": "item",
        "triggerOn": "mousemove|click",
        "axisPointer": {
            "type": "line"
        },
        "textStyle": {
            "fontSize": 14
        },
        "borderWidth": 0
    },
    "xAxis": [
        {
            "show": true,
            "scale": false,
            "nameLocation": "end",
            "nameGap": 15,
            "gridIndex": 0,
            "inverse": false,
            "offset": 0,
            "splitNumber": 5,
            "minInterval": 0,
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "show": true,
                    "width": 1,
                    "opacity": 1,
                    "curveness": 0,
                    "type": "solid"
                }
            },
            "data": Array(24).fill().map((_,i)=>i+1)
        }
    ],
    "yAxis": [
        {
            "show": true,
            "scale": false,
            "nameLocation": "end",
            "nameGap": 15,
            "gridIndex": 0,
            "inverse": false,
            "offset": 0,
            "splitNumber": 5,
            "minInterval": 0,
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "show": true,
                    "width": 1,
                    "opacity": 1,
                    "curveness": 0,
                    "type": "solid"
                }
            }
        }
    ],
    "title": [
        {
            "text": "The features of traffic violations in Xiamen and Chengdu in a typical day",
            "padding": 5,
            "itemGap": 10,
            x:270,//水平安放位置，默认为'left'，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
            y:270,//垂直安放位置，默认为top，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
            textAlign: 'center',//水平对齐方式，默认根据x设置自动调整，可选为： left' | 'right' | 'center
            textStyle: {//主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
                            fontFamily: 'Arial',
                            fontSize: 12,
                            fontStyle: 'normal',
                            fontWeight: 'bold',
                        }
        }
    ]
};
chart_line.setOption(option);
var chart_violation = echarts.init(document.getElementById('violation'), 'white', {renderer: 'canvas'});
var option = {
    "animation": true,
    "animationThreshold": 2000,
    "animationDuration": 1000,
    "animationEasing": "cubicOut",
    "animationDelay": 0,
    "animationDurationUpdate": 300,
    "animationEasingUpdate": "cubicOut",
    "animationDelayUpdate": 0,
    "series": [
        {
            "type": "line",
            "name": "violation-prone locations (xiamen)",
            "connectNulls": false,
            "symbol": "circle",
            "symbolSize": 6,
            "showSymbol": true,
            "smooth": false,
            "step": false,
            "data":loc_xm,
            "hoverAnimation": true,
            "label": {
                "show": true,
                "position": "top",
                "margin": 8
            },
            "lineStyle": {
                "show": true,
                "width": 2,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
            },
            "areaStyle": {
                "opacity": 0
            },
            "zlevel": 0,
            "z": 0
        },
        {
            "type": "line",
            "name": "violation-prone locations (chengdu)",
            "connectNulls": false,
            "symbol": "triangle",
            "symbolSize": 6,
            "showSymbol": true,
            "smooth": false,
            "step": false,
            "data": loc_cd,
            "hoverAnimation": true,
            "label": {
                "show": true,
                "position": "top",
                "margin": 8
            },
            "lineStyle": {
                "show": true,
                "width": 2,
                "opacity": 1,
                "curveness": 0,
                "type": "solid"
            },
            "areaStyle": {
                "opacity": 0
            },
            "zlevel": 0,
            "z": 0
        }
    ],
    "legend": [
        {
            "data": [
                "violation-prone locations (xiamen)",
                "violation-prone locations (chengdu)"
            ],
            "selected": {
                "violation-prone locations (xiamen)": true,
                "violation-prone locations (chengdu)": true
            },
            "show": true,
            "padding": 5,
            "itemGap": 10,
            "itemWidth": 25,
            "itemHeight": 14
        }
    ],
    "tooltip": {
        "show": true,
        "trigger": "item",
        "triggerOn": "mousemove|click",
        "axisPointer": {
            "type": "line"
        },
        "textStyle": {
            "fontSize": 14
        },
        "borderWidth": 0
    },
    "xAxis": [
        {
            "show": true,
            "scale": false,
            "nameLocation": "end",
            "nameGap": 15,
            "gridIndex": 0,
            "inverse": false,
            "offset": 0,
            "splitNumber": 5,
            "minInterval": 0,
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "show": true,
                    "width": 1,
                    "opacity": 1,
                    "curveness": 0,
                    "type": "solid"
                }
            },
            "data":Array(720).fill().map((_,i)=>i+1)
            }
    ],
    "yAxis": [
        {
            "show": true,
            "scale": false,
            "nameLocation": "end",
            "nameGap": 15,
            "gridIndex": 0,
            "inverse": false,
            "offset": 0,
            "splitNumber": 5,
            "minInterval": 0,
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "show": true,
                    "width": 1,
                    "opacity": 1,
                    "curveness": 0,
                    "type": "solid"
                }
            }
        }
    ],
    "title": [
        {
            "text":"The numbers of traffic violation-prone locations in Xiamen and Chengdu in a month",
            "padding": 5,
            "itemGap": 10,
            x:300,//水平安放位置，默认为'left'，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
                                        y:270,//垂直安放位置，默认为top，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
                                        textAlign: 'center',//水平对齐方式，默认根据x设置自动调整，可选为： left' | 'right' | 'center
            textStyle: {//主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
                            fontFamily: 'Arial',
                            fontSize: 12,
                            fontStyle: 'normal',
                            fontWeight: 'bold',
                        }

        }
    ]
};
chart_violation.setOption(option);


