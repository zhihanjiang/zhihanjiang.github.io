
$(function () {
    violation_line();

    // var myChart = echarts.getInstanceByDom($("#map_1")[0]);
    // myChart.on('click', {name: 'village1'}, function (params) {
    //     bike(week_bike[0]);
    //     building(building_data[0]);
    //     document.getElementById('img').style.backgroundImage= `url(${'images/village/village1.png'})`;
    //     document.getElementById('wordcloud').style.backgroundImage= `url(${'images/wordcloud/wordcloud1.png'})`;
    //     document.getElementById('uv_name').innerText = 'village1';
    //     document.getElementById('rp').innerText ='15875';
    //     document.getElementById('fp').innerText ='7516';
    // });
    
    function violation_line(){
        var loc_xm=new Array()
        var loc_cd=new Array()
        var loc_cd_s='13,15,13,14,15,13,16,17,15,20,20,20,19,18,20,17,16,17,20,17,13,16,13,12,13,14,9,13,11,10,12,19,17,20,20,17,20,20,20,20,19,19,23,14,15,16,19,13,13,13,15,13,14,10,13,18,22,21,21,20,18,21,21,19,18,19,25,19,18,17,15,16,15,12,16,12,13,12,12,24,22,21,20,17,18,22,22,21,24,17,20,22,21,21,20,22,21,19,23,16,12,15,22,18,20,18,20,24,20,21,21,22,17,25,25,22,18,21,18,19,18,16,19,19,16,14,14,11,11,14,15,16,16,17,23,21,19,23,17,15,20,19,14,11,14,7,13,7,6,9,13,19,19,22,20,19,21,20,20,23,22,19,19,15,17,17,12,11,11,12,14,12,10,14,13,23,17,19,23,23,21,22,21,19,21,21,22,18,15,18,21,11,12,9,15,14,15,13,13,22,21,23,26,22,19,21,21,20,22,24,22,19,17,18,19,13,11,13,13,14,12,14,17,26,21,24,21,23,17,21,23,19,23,21,21,18,19,18,16,14,11,15,17,14,10,8,10,24,22,22,26,21,20,21,22,17,22,25,19,21,23,22,23,19,25,17,27,20,17,18,14,19,16,17,20,19,20,20,23,21,24,22,24,22,20,18,23,19,17,17,26,17,17,16,9,16,16,14,17,20,18,18,21,22,22,25,23,20,14,17,17,18,15,11,15,14,10,12,14,22,18,24,23,20,21,18,20,19,22,22,19,16,17,16,15,15,14,9,16,14,11,14,16,25,23,24,22,20,21,20,21,23,23,23,27,21,17,16,20,14,16,12,18,17,19,13,13,25,27,25,23,19,17,22,20,22,22,19,24,18,17,19,19,14,15,16,18,15,19,13,13,25,22,24,22,19,19,23,21,22,21,21,27,20,15,17,22,14,18,10,23,16,11,13,14,26,29,28,23,20,20,21,23,24,24,25,24,22,22,19,27,21,22,19,23,21,19,14,18,18,19,17,20,21,19,20,22,23,21,25,24,25,21,19,23,22,22,21,24,22,17,13,15,16,14,19,18,17,22,20,20,22,24,24,26,20,20,22,18,17,14,11,11,10,10,12,11,28,24,23,20,19,17,23,23,20,20,19,21,14,15,17,20,13,16,14,15,14,11,11,12,25,28,22,26,21,21,21,20,21,20,23,23,18,18,18,15,13,11,13,14,11,13,14,12,26,26,23,24,19,17,20,18,19,23,23,26,21,18,19,19,14,12,13,13,16,12,12,14,28,24,26,23,18,19,17,19,22,23,23,23,19,18,18,19,18,14,15,16,16,12,11,16,26,27,27,25,22,20,23,22,20,24,24,25,22,21,19,23,20,21,18,25,21,17,17,13,19,17,17,17,25,16,22,20,22,23,29,22,22,18,18,19,20,15,20,23,24,21,16,16,14,16,20,16,19,19,18,23,22,21,26,25,19,19,19,20,17,15,16,16,13,15,14,16,25,27,29,24,20,19,23,25,22,22,26,22,17,16,17,21,16,18,15,13,14,10,16,15,28,26,27,25,24,21,22,24,22,22,19,22,18,17,18,17,16,14,17,16,16,13,11,22,29,24,28,26,19,20,22,21,21,23,23,25,19,17,20,24,20';
        var loc_xm_s='10,11,11,11,14,11,11,14,14,20,21,17,19,16,18,21,22,20,18,17,14,13,18,12,11,9,12,11,15,7,17,17,16,20,18,16,16,16,19,20,18,15,12,5,13,13,16,13,11,12,13,14,17,14,13,17,20,19,17,16,16,15,19,20,24,22,22,16,15,15,15,14,13,14,13,15,16,14,15,17,17,18,16,17,19,16,18,21,24,24,20,16,16,12,18,14,11,11,12,11,15,9,13,17,15,18,17,19,24,17,19,22,25,20,22,15,15,16,17,12,12,13,11,9,15,10,12,15,19,18,20,18,19,19,18,21,21,22,20,15,17,15,17,10,11,11,10,15,12,12,12,17,26,23,24,24,25,23,25,26,27,26,26,21,19,16,17,13,11,14,14,13,14,15,13,21,25,26,27,26,25,24,26,25,25,28,25,20,19,18,18,12,11,12,10,10,11,12,9,14,18,18,19,19,18,18,17,24,23,20,15,15,15,15,16,13,16,16,14,13,16,13,12,19,22,19,16,19,17,20,19,21,22,17,20,17,16,13,16,11,12,14,15,13,18,13,12,18,22,18,16,20,14,15,16,20,18,19,19,14,13,13,16,13,9,10,13,10,16,9,12,15,17,18,20,20,18,15,21,19,25,22,19,16,15,16,13,15,12,10,11,16,16,15,11,16,19,15,20,19,19,18,16,18,23,22,20,12,16,16,17,16,14,12,12,14,13,11,12,12,17,19,18,15,15,13,11,12,8,12,17,16,15,16,10,8,6,2,1,1,2,0,2,3,3,2,2,2,2,1,2,7,9,8,9,6,8,6,5,3,3,3,2,2,3,3,4,9,8,10,9,11,8,10,12,13,14,14,17,13,12,15,8,10,15,10,9,13,16,13,12,22,17,9,12,13,13,9,12,8,17,18,10,7,10,9,6,10,9,10,12,10,11,13,13,19,24,17,20,21,21,18,19,20,21,20,18,15,14,16,16,16,10,9,13,11,15,13,13,22,20,19,18,16,22,16,16,18,24,23,22,15,20,17,17,13,10,10,11,9,11,14,8,13,14,15,15,18,18,15,17,23,21,20,19,18,14,14,11,10,12,10,10,10,8,11,13,15,14,18,26,21,21,19,22,23,23,17,15,18,17,15,14,13,13,11,11,11,12,11,11,15,14,19,17,18,17,15,18,18,20,21,18,17,13,16,17,15,13,10,11,13,11,13,15,19,15,14,20,17,13,15,21,24,23,21,16,18,15,16,15,12,16,14,13,14,15,15,13,21,18,18,20,17,19,16,21,20,22,21,19,22,14,15,9,15,13,12,12,14,15,17,14,19,17,17,18,19,15,14,20,21,25,21,19,17,15,16,13,16,11,13,11,11,11,11,12,14,15,19,20,19,16,12,16,21,19,19,17,17,16,15,16,15,13,11,11,11,13,12,8,16,16,16,18,17,18,17,16,21,14,17,13,12,16,17,13,7,8,4,2,4,4,6,10,15,18,18,18,18,14,11,13,18,18,16,20,15,14,12,12,9,9,9,9,10,11,8,11,16,14,18,26,21,24,16,17,22,24,22,17,15,14,14,14,16,12,12,10,8,12,13,12,15,17,15,17,18,18,17,17,17,19,20,13,13,13,13,10,16';
        var temp=loc_xm_s.toString().split(',');
        for(var i=0;i<temp.length;++i){
            loc_xm[i]=new Array();
            loc_xm[i]=[i+1,Math.round(parseFloat(temp[i]))];
        }
        temp=loc_cd_s.toString().split(',');
        for(var i=0;i<temp.length;++i){
            loc_cd[i]=new Array();
            loc_cd[i]=[i+1,Math.round(parseFloat(temp[i]))];
        }
        var chart_violation = echarts.init(document.getElementById('violation'));
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
                        "width": 1,
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
                        "width": 1,
                        "opacity": 1,
                        "curveness": 0,
                        "type": "solid",
                        "color": "#87CEFA"
                    },
                    itemStyle: {
                        color: '#87CEFA'
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
                    "itemHeight": 14,
                    textStyle:{
                        color:'rgba(255,255,255,0.7)'
                    }
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
                    "data":Array(720).fill().map((_,i)=>i+1),
                    "axisLine": {
                        "lineStyle":{
                            "color": 'rgba(255,255,255,0.7)'
                        }
                    }
                    },
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
                    },
                    "axisLine": {
                        "lineStyle":{
                            "color": 'rgba(255,255,255,0.7)'
                        }
                    }
                }
            ]
        //     "title": [
        //         {
        //             "text":"The numbers of traffic violation-prone locations in Xiamen and Chengdu in a month",
        //             "padding": 5,
        //             "itemGap": 10,
        //             x:300,//水平安放位置，默认为'left'，可选为：'center' | 'left' | 'right' | {number}（x坐标，单位px）
        //                                         y:270,//垂直安放位置，默认为top，可选为：'top' | 'bottom' | 'center' | {number}（y坐标，单位px）
        //                                         textAlign: 'center',//水平对齐方式，默认根据x设置自动调整，可选为： left' | 'right' | 'center
        //             textStyle: {//主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
        //                             fontFamily: 'Arial',
        //                             fontSize: 12,
        //                             fontStyle: 'normal',
        //                             fontWeight: 'bold',
        //                         }
        
        //         }
        //     ]
        };
        chart_violation.setOption(option);
        window.addEventListener("resize",function(){
            chart_violation.resize();
        });
    }
    
})



		
		
		


		









