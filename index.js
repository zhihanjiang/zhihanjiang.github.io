var $ = require("jquery");
var util = require("util");
var fs = require("fs");
var remote = require('electron').remote;
var smalltalk = require("smalltalk");
var ndarray = require("ndarray");
var ops = require("ndarray-ops");
var geojson = require("geojson");
var colormap = require('colormap');
var turf = require("@turf/turf");
var path = require("path");
var _ = require('lodash');
var os = require("os");
var mapstyle;
var points;
var center=[118.131624,24.492368];
var h=0;
var zoom=13;
var mapstyle;
var chart_map;
fs.readFile('../custom_map_config-3.json', 'utf-8', function(err, data) {
            mapstyle = JSON.parse(data);
            chart_map = echarts.init(document.getElementById('map'), 'white', {renderer: 'canvas'});
            update_map(h);
});



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
    fs.readFile('../data/bd_xm_'+h.toString()+'.json', 'utf-8', function(err, data) {
        data = JSON.parse(data);
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
    });
}

var mean_xm=new Array()
var mean_cd=new Array()
var std_xm=new Array()
var std_cd=new Array()
var thre_xm=new Array()
var thre_cd=new Array()
var loc_xm=new Array()
var loc_cd=new Array()
fs.readFile('mean_xm.txt', 'utf-8', function(err, data) {
    temp=data.toString().split(',');
    for(var i=0;i<temp.length;++i){
        mean_xm[i]=new Array();
        mean_xm[i]=[i+1,Math.round((parseFloat(temp[i])))];
    }
    fs.readFile('mean_cd.txt', 'utf-8', function(err, data) {
        temp=data.toString().split(',');
        for(var i=0;i<temp.length;++i){
            mean_cd[i]=new Array();
            mean_cd[i]=[i+1,Math.round(parseFloat(temp[i]))];
        }
        fs.readFile('std_xm.txt', 'utf-8', function(err, data) {
            temp=data.toString().split(',');
            for(var i=0;i<temp.length;++i){
                std_xm[i]=new Array();
                std_xm[i]=[i+1,Math.round(parseFloat(temp[i]))];
            }
            fs.readFile('std_cd.txt', 'utf-8', function(err, data) {
                temp=data.toString().split(',');
                for(var i=0;i<temp.length;++i){
                    std_cd[i]=new Array();
                    std_cd[i]=[i+1,Math.round(parseFloat(temp[i]))];
                }
                fs.readFile('thre_xm.txt', 'utf-8', function(err, data) {
                    temp=data.toString().split(',');
                    for(var i=0;i<temp.length;++i){
                        thre_xm[i]=new Array();
                        thre_xm[i]=[i+1,Math.round(parseFloat(temp[i]))];
                    }
                    fs.readFile('thre_cd.txt', 'utf-8', function(err, data) {
                        temp=data.toString().split(',');
                        for(var i=0;i<temp.length;++i){
                            thre_cd[i]=new Array();
                            thre_cd[i]=[i+1,Math.round(parseFloat(temp[i]))];
                        }
                    });
                    fs.readFile('loc_xm.txt', 'utf-8', function(err, data) {
                        temp=data.toString().split(',');
                        for(var i=0;i<temp.length;++i){
                            loc_xm[i]=new Array();
                            loc_xm[i]=[i+1,Math.round(parseFloat(temp[i]))];
                        }
                        fs.readFile('loc_cd.txt', 'utf-8', function(err, data) {
                            temp=data.toString().split(',');
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
                        });
                    });

                });
            });
        });
    });
});









