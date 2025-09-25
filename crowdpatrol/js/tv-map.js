$(function () {
    map();
    function map() {
		var points;
		var center=[118.131624,24.492368];
		var h=0;
		var zoom=13;
		var mapstyle;
		var chart_map;
		var bmap;
		var max_n;
		var min_n=0;
		var city='xm';
		var month=9;
		var hour=8;
		var line;
		var series = [];
		var color = ['#3ed4ff', '#ffa022', '#a6c84c','#FFCCFF','#FFCCCC','#FF9900','#9900FF','#3399CC','#666699','#663366'];
		var cd_id_location;
		var xm_id_location;
		var siming=[189,211,277,284,297,301,302,309,311,313,314,315,317,318,322,327,328,331,337,371,392,393,396,397,410,417,423,427,430,433,439,448,454,458,466,470,474,480,481,486,488,496,498,506,511,523,536,537,539,543,552,570,585,589,592,606,607,618,729,731,732,734,735,738,740,743,745,746,747,751,753,757,758,765,766,767,777,780,790,791,795,802,826,829,830,832];
		var huli=[42,160,170,255,256,259,269,274,279,288,294,298,303,316,524,545,560,566,588,599,620,625,631,634,640,641,642,648,650,651,652,653,656,667,680,687,688,690,691,696,698,699,739,768,776,782,785,788,789,798,799,800,803,804,806,807,808,810,822,833];
		var jinniu=[96,115,342,356,379,380,391,393,403,406,407,409,410,420,422,425,426,427,428,430,434,435,438,441,443,444,460,464,469,474,477,522,619];
		var qingyang=[266,270,276,286,288,297,298,300,301,312,313,315,316,318,319,324,331,333,341,349,363,368,369,378,382,383,520,532,544];
		var chenghua=[287,293,294,306,326,327,339,367,392,402,446,447,450,592,644,646];
		var trajs={'huli':[],'siming':[],'qingyang':[],'chenghua':[],'jinniu':[]};
		var xm_poi = [254, 698, 247, 710, 710];
		var cd_poi = [100, 0, 0, 13, 13];
		var poi = xm_poi;
		var map_type = "heatmap";
		

		read_trajs('huli',hour);
		read_trajs('siming',hour);
		read_trajs('qingyang',hour);
		read_trajs('chenghua',hour);
		read_trajs('jinniu',hour);

		var scroll_width = getComputedStyle(document.getElementById('scrollBar'),null).getPropertyValue('width'); // 获得滑动条的长度

		var url = "data/custom_map_config-3.json"/*json文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
		var request = new XMLHttpRequest();
		var map_div = document.getElementById('map');
		request.open("get", url);/*设置请求方法与路径*/
		request.send(null);/*不发送数据到服务器*/
		request.onload = function () {/*XHR对象获取到返回信息后执行*/
		if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
			mapstyle = JSON.parse(request.responseText);
			chart_map = echarts.init(map_div, 'white', {renderer: 'canvas'});
			update_heatmap(h);
		}}

		// 获取滑动条
		var scrollBar = document.getElementById("scrollBar");
		var text = document.getElementById("text");
		text.innerHTML = "Scroll the bar to get traffic violation heatmap at different time -- 0:00)";
		var bar = scrollBar.children[0];
		var mask = scrollBar.children[1];

		var poi_title = document.getElementById("poi_title") 
		update_center = function(){
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
				poi = xm_poi;
				poi_title.innerHTML = "The POI distribution around traffic violation hotspots in Xiamen";
			}
			else{
				center=[104.09,30.69];
				zoom=14;
				city='cd';
				month=11
				poi = cd_poi;
				poi_title.innerHTML = "The POI distribution around traffic violation hotspots in Chengdu";
			}
			if(map_type == "heatmap"){
				update_heatmap(h);
			}else{
				update_patrol_map();
			}
		}

		document.getElementById("heatmap_btn").addEventListener('click', function(){
			map_div.setAttribute('_echarts_instance_', '');
			chart_map = echarts.init(map_div, 'white', {renderer: 'canvas'});
			map_type = "heatmap";
			h = 0;
			text.innerHTML = "Scroll the bar to get traffic violation heatmap at different time -- 0:00)";
			bar.style.left = 0;
			mask.style.width = 0;
			update_heatmap(h);
		}, false);

		document.getElementById("patrol_btn").addEventListener('click', function(){
			map_div.setAttribute('_echarts_instance_', '');
			chart_map = echarts.init(map_div, 'white', {renderer: 'canvas'});
			map_type = "patrol";
			month = 9;
			hour = 8;
			text.innerHTML = "Scroll the bar to get patrol routes at different time: 2016-9-1 8:00:00";
			bar.style.left = 0;
			mask.style.width = 0;
			update_patrol_map();
		}, false);



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
				}else if(val > parseInt(scroll_width)){
					that.style.left = parseFloat(scroll_width) - 5 + "px";
				}
				// 移动的距离为遮罩的宽度
				mask.style.width = that.style.left;

				if(map_type == "heatmap"){
					h = parseInt(parseInt(that.style.left) / parseInt(scroll_width) * 24);
					text.innerHTML = "Scroll the bar to get traffic violation heatmap at different time: "+ h + ":00";
				}else{
					if(parseInt(that.style.left) % 24 < 14)
						hour=8+parseInt(parseInt(that.style.left)/24)*24;
					else
						hour=14+parseInt(parseInt(that.style.left)/24)*24;
					
					read_trajs('huli',hour);
					read_trajs('siming',hour);
					read_trajs('qingyang',hour);
					read_trajs('chenghua',hour);
					read_trajs('jinniu',hour);

					text.innerHTML = "Scroll the bar to get patrol routes at different time: 2016-"+month.toString()+"-"+ (parseInt(hour/24)+1).toString()+" " + (hour%24).toString() + ":00:00";
				}
				
				// 清除拖动 --- 防止鼠标已经弹起时还在拖动
				window.getSelection ? window.getSelection().removeAllRanges():document.selection.empty();
			}
			// 鼠标抬起停止拖动
			document.onmouseup = function(){
				if(map_type == "heatmap"){
					update_heatmap(h);
				}else{
					update_patrol_map();
				}
				document.onmousemove = null;
				document.onmouseup = null;
			}
		};

		function read_trajs(district,hour){
			trajs[district]=[];
			var url = 'data/'+district+'/'+hour.toString()+'.txt'/*文件url，本地的就写本地的位置，如果是服务器的就写服务器的路径*/
			var request = new XMLHttpRequest();
			request.open("get", url);/*设置请求方法与路径*/
			request.send(null);/*不发送数据到服务器*/
			request.onload = function () {/*XHR对象获取到返回信息后执行*/
				if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
					var data = request.responseText;
					var lines=data.split('\n');
					for(var i=0;i<lines.length-1;++i){
						var items = lines[i].split(',');
						var traj=[];
						for(var j=0;j<items.length;++j){
							traj.push(parseInt(items[j]));
						}
						trajs[district].push(traj);
					}
				}
			}
		}

		function add_trajectories(station,district,trajs_district,data){
			var lines=[];
			// console.log(station);
			// console.log(trajs_district);
			// console.log(data);
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
			// console.log(lines);
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
			// console.log(series);
		}

		// 违法热力图
		max_n = 100;
		function update_heatmap(h){
			var request = new XMLHttpRequest();
			var url = 'data/location/bd_'+h.toString()+'.json';
			request.open("get", url);/*设置请求方法与路径*/
			request.send(null);/*不发送数据到服务器*/
			request.onload = function () {/*XHR对象获取到返回信息后执行*/
				if (request.status == 200) {/*返回状态为200，即为数据获取成功*/
					var data = JSON.parse(request.responseText);
					points = [].concat.apply([], data.map(function (track) {
						return track.map(function (seg) {
							// console.log(seg.coord.concat([1]));
							return seg.coord.concat([seg.elevation]);
						});
					}));
					series = [{
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
					}];
					chart_map.setOption(option = {
						// "animation": true,
						// "animationThreshold": 2000,
						// "animationDuration": 1000,
						// "animationEasing": "cubicOut",
						// "animationDelay": 0,
						// "animationDurationUpdate": 300,
						// "animationEasingUpdate": "cubicOut",
						// "animationDelayUpdate": 0,
						bmap: {
							center: center,
							zoom: zoom,
							roam: true,
							mapStyle: {
								styleJson:mapstyle
							}
						},
						visualMap: {
							"show": true,
							"type": "continuous",
							"min": min_n,
							"max": max_n,
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
						"series": series,
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
					}, true); // 不与之前渲染的合并，第二个参数就需要设为true
					poi_pie();
					bmap = chart_map.getModel().getComponent('bmap').getBMap();
				}
			}
		}

		var hotspots_raw = [[118.1472189787246, 24.516712642084954],
		[118.10722461642423, 24.51771255387376],
		[118.10709692889984, 24.51770281652038],
		[118.13962820903099, 24.504056430011698],
		[118.1396000908191, 24.504318505143633],
		[118.14115957348876, 24.5000102385541],
		[118.14717616879365, 24.516708537105117],
		[118.14907620464342, 24.496494853377467],
		[118.14724402583109, 24.51671510238956],
		[118.16198524937899, 24.51625586972948],
		[118.16516320011549, 24.50943891329458],
		[118.16642752418412, 24.491736427471597],
		[118.1668927274453, 24.491639677384782],
		[118.18333620588585, 24.50926977943263],
		[118.08231019977245, 24.48925605149541],
		[118.15190809658111, 24.49151624550999],
		[118.18389786636189, 24.494931537312407],
		[118.15246737385641, 24.495546570584732],
		[118.08994608140242, 24.498412748398856],
		[118.1454244593262, 24.498148731736624],
		[118.13977166532494, 24.50517451506048],
		[118.18342364727728, 24.50754614632695],
		[118.09582806712146, 24.509434139837875],
		[118.11055347478865, 24.510316305068944],
		[118.12938457095329, 24.511838127362964],
		[118.12933157189059, 24.51216191087471],
		[118.14197953998449, 24.51311031868054],
		[118.12630109728433, 24.51344060881972],
		[118.14465740281507, 24.5135713792965],
		[118.19438322628483, 24.51448709260778],
		[118.14865558418194, 24.514137060720277],
		[118.10319956136303, 24.514910400828448],
		[118.19116862065901, 24.51798537808288],
		[118.12011010239068, 24.527910652192663],
		[118.13830419673207, 24.53335610346757],
		[118.12771108663581, 24.53441493321949],
		[118.14195843703766, 24.53588263759666],
		[118.14169143705654, 24.5361641033552],
		[118.14290183472376, 24.541181051889037],
		[118.15674187590737, 24.543013911797892],
		[118.15662403418015, 24.54336688819754],
		[118.09090087199797, 24.500852459544472],
		[118.10223559639324, 24.51730420628339],
		[118.11552944689221, 24.530667311060846],
		[118.11376500648923, 24.507843316943525],
		[118.11501451090851, 24.520755710456914],
		[118.14374442815286, 24.512373306585506],
		[118.13429394998983, 24.498361841151162],
		[118.15360665396932, 24.495225824274176],
		[118.13650337163959, 24.501663564072373],
		[118.15902724599752, 24.493596067656352],
		[118.15369198098307, 24.49976287067562],
		[118.14069589159219, 24.537663494141334],
		[118.14316439045841, 24.513482200967417],
		[118.16203750549917, 24.521439191432833],
		[118.15384359085508, 24.537029085864773],
		[118.16335846227454, 24.506316943708963],
		[118.18266398856254, 24.503675399595288],
		[118.19949705408979, 24.505227192465803],
		[118.11326699376689, 24.495723871204174],
		[118.1172144863822, 24.48367858589289],
		[118.15064265100897, 24.482902719619407],
		[118.16853159428632, 24.485803671006252],
		[118.1684020727177, 24.48580665607272],
		[118.16753139409376, 24.48567460747827],
		[118.17276981148109, 24.484561723519583],
		[118.17484666449998, 24.48358005545304],
		[118.18011936921764, 24.473813895378836],
		[118.18235176062315, 24.476409924276012],
		[118.18044548450236, 24.477871676789665],
		[118.18228311330434, 24.4764355256204],
		[118.18229528749532, 24.481354678091414],
		[118.18220518456098, 24.481200292716977],
		[118.1838604822939, 24.472280524664257],
		[118.18271254449711, 24.4818704383189],
		[118.1849603920695, 24.475085414049843],
		[118.11488737893158, 24.485191695646353],
		[118.18019854139531, 24.473784713100695],
		[118.16823881896988, 24.488323511780184],
		[118.12627292406799, 24.433746391307835],
		[118.12088888780553, 24.43485062745416],
		[118.09864202955829, 24.441814073299582],
		[118.15736954537883, 24.44132688712309],
		[118.08971187397933, 24.457193596016044],
		[118.08117621821715, 24.46062390047221],
		[118.08677230045961, 24.462046292754316],
		[118.09182100769002, 24.46252077554829],
		[118.09627897516727, 24.462638794941803],
		[118.08593330116607, 24.46339522450657],
		[118.08623403029054, 24.46641437498952],
		[118.0995913187851, 24.469396337345483],
		[118.08578958446672, 24.471851497385735],
		[118.11400460955447, 24.472901390208715],
		[118.11309037298388, 24.475809302823645],
		[118.1037366259242, 24.476753064447625],
		[118.12528121728567, 24.478142091189248],
		[118.11805810587927, 24.480211787720187],
		[118.09048847283967, 24.480882343830114],
		[118.17783707666626, 24.481956083963063],
		[118.11111459875382, 24.482152382525584],
		[118.11614769521312, 24.48336687815505],
		[118.0861038925977, 24.484203256421445],
		[118.19259253215604, 24.486313681554083],
		[118.10259641433905, 24.48716052288167],
		[118.1938064379044, 24.48898798562104],
		[118.10325133698403, 24.490961784767897],
		[118.19421414751875, 24.491475941338276],
		[118.19422917640327, 24.491571084712863],
		[118.1924680369263, 24.491726614524683],
		[118.12455119561443, 24.492775760633663],
		[118.10941424884489, 24.49635316924468],
		[118.12840070831558, 24.49727265074608],
		[118.195004143443, 24.498259251034384],
		[118.14090055669813, 24.497928407593346],
		[118.12110761636768, 24.49936115490777],
		[118.12097456510584, 24.499732621813823],
		[118.13110254995603, 24.504208063343864],
		[118.10696218777751, 24.47469432412744],
		[118.11376640119204, 24.47923700509263],
		[118.08123953086562, 24.46597872860831],
		[118.10494346612224, 24.470931796840123],
		[118.08222292321514, 24.459761070891844],
		[118.0909334305789, 24.48449557025121],
		[118.08559272470545, 24.469571213512857],
		[118.0941269047284, 24.450147910683913],
		[118.08862332117577, 24.466995849379717],
		[118.08959074671334, 24.452817752829066],
		[118.09758126124629, 24.442379111954104],
		[118.09275908850238, 24.475192185059484],
		[118.09451918928711, 24.484521307353912],
		[118.09689444745533, 24.48220563564254],
		[118.0987231061281, 24.463137275998438],
		[118.10257556924158, 24.4850651596614],
		[118.12321281096719, 24.500129347438545],
		[118.10041794036384, 24.492581665119538],
		[118.11470205394855, 24.436930080405705],
		[118.1154870464405, 24.484644846236936],
		[118.12097037662923, 24.49952269264095],
		[118.12376281256368, 24.485356131164497],
		[118.1288155337821, 24.48257167743427],
		[118.14140462444772, 24.497844172348536],
		[118.18457955859034, 24.47198934742878],
		[118.18597817629723, 24.48726028215158],
		[118.19182972867665, 24.476132668929612],
		[118.19431388936796, 24.47769331604384],
		[104.10902879722798, 30.66216173031479],
		[104.11799325572206, 30.662934055376276],
		[104.10736345068288, 30.662911623180538],
		[104.10005052206017, 30.66467757081147],
		[104.10912763091268, 30.667538721547537],
		[104.10902767455569, 30.667543517466424],
		[104.11456590583396, 30.671457417120678],
		[104.11995766886854, 30.676208790237187],
		[104.1152208184455, 30.681039694175904],
		[104.1277659457752, 30.685092866665943],
		[104.0982465143317, 30.701314883732802],
		[104.11335721061766, 30.701948631905413],
		[104.10246015762674, 30.707005652346105],
		[104.08703829958557, 30.713701861646957],
		[104.10572920229359, 30.693040265088797],
		[104.10614690128789, 30.68827273513447],
		[104.07968426863972, 30.691435113517528],
		[104.0796843690569, 30.691436292487246],
		[104.05403683989253, 30.672438889037377],
		[104.05504045093524, 30.674849750146226],
		[104.0544584134447, 30.678899268608387],
		[104.05080411575148, 30.680841486467166],
		[104.05769325799282, 30.68232548634512],
		[104.09544196507633, 30.685390056595455],
		[104.09551917292039, 30.685517445457602],
		[104.0926857554434, 30.68698423476599],
		[104.05124004295118, 30.687954798301238],
		[104.08234669166232, 30.691045076856966],
		[104.07984503657052, 30.69172392572397],
		[104.06551210753669, 30.692009596208063],
		[104.06653260459979, 30.692012222682635],
		[104.07269210676368, 30.69197989002062],
		[104.08919340695908, 30.69251112076785],
		[104.08321955817787, 30.693995788984047],
		[104.08657370123699, 30.6960997325334],
		[104.07975521415067, 30.69621518996716],
		[104.07992453147386, 30.698320709577153],
		[104.08334101258014, 30.70038117111846],
		[104.07273791362765, 30.700629280688595],
		[104.07273793189535, 30.700693315134227],
		[104.069882779141, 30.715174933662894],
		[104.0809131593941, 30.720312757620068],
		[104.05570635734925, 30.724529455701603],
		[104.0541809762401, 30.73127414568072],
		[104.0534015246372, 30.73240506910557],
		[104.07624570988524, 30.700584165440432],
		[104.09691257153803, 30.684786703142493],
		[104.05894124839024, 30.659049348013745],
		[104.06506557156627, 30.659993115532043],
		[104.06510321194787, 30.660648769725814],
		[104.06735587286767, 30.662461511568974],
		[104.06715948668634, 30.662590019430443],
		[104.05101146120109, 30.664271326892525],
		[104.06857908980787, 30.66428887920391],
		[104.06709436105352, 30.66439708042814],
		[104.06905751050512, 30.66608274585677],
		[104.08013110102382, 30.666099893089232],
		[104.07953630193322, 30.66614070494918],
		[104.07745082892792, 30.66620478141614],
		[104.06283064949542, 30.66657668718745],
		[104.06270383647232, 30.666629009852716],
		[104.07162702261361, 30.66760345134488],
		[104.0752966668504, 30.669406287462856],
		[104.05215901453764, 30.669716742092806],
		[104.08038126803247, 30.67187599105008],
		[104.08585253735986, 30.67323758317029],
		[104.08061639277051, 30.67573715456251],
		[104.05813952578984, 30.67691510957083],
		[104.09070409373602, 30.678331243728582],
		[104.07825005171728, 30.678667812381676],
		[104.06440335932596, 30.678976600539755],
		[104.06781250408967, 30.66439241179512],
		[104.07153578591543, 30.662472576332807],
		[104.07065725803797, 30.665335786014655]];
		var hotspots = [];
		for(var i=0;i<hotspots_raw.length;++i){
			hotspots.push({
				name: "point" + i,
				value: hotspots_raw[i]
			})
		}
		// 巡逻路线图和热点图
		function update_patrol_map(){
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

							// console.log(trajs);
							series=[{
								name: 'Hotspot',
								type: 'scatter',
								coordinateSystem: 'bmap',
								data: hotspots,
								encode: {
									value: 2
								},
								label: {
									formatter: '{b}',
									position: 'right',
									show: false
								},
								itemStyle: {
									color: 	'#FF3333'
								},
								symbolSize: 12,
								tooltip: {
									formatter: 'hotspot'
								}
							}];

							add_trajectories(station_huli,huli,trajs['huli'],xm_id_location);
							add_trajectories(station_siming,siming,trajs['siming'],xm_id_location);
							add_trajectories(station_chenghua,chenghua,trajs['chenghua'],cd_id_location);
							add_trajectories(station_jinniu,jinniu,trajs['jinniu'],cd_id_location);
							add_trajectories(station_qingyang,qingyang,trajs['qingyang'],cd_id_location);

							chart_map.setOption(option = {
								// "animation": true,
								// "animationThreshold": 2000,
								// "animationDuration": 1000,
								// "animationEasing": "cubicOut",
								// "animationDelay": 0,
								// "animationDurationUpdate": 300,
								// "animationEasingUpdate": "cubicOut",
								// "animationDelayUpdate": 0,
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
							}, true); // 不与之前渲染的合并，第二个参数就需要设为true
							// 给每个热点添加点击变换街景图
							for(var i=0;i<hotspots.length;++i){
								(function(){
									var point_name = "point" + i;
									var pic_name = (i+1) + "_no_parking.jpg";
									chart_map.on('click', {name: point_name}, function (params) {
										document.getElementById('img').style.backgroundImage= `url(${'images/street_view/' + pic_name})`;
									});
								})();
							}
							poi_pie();
							bmap = chart_map.getModel().getComponent('bmap').getBMap();	
						}
					}
				}
			}
		}
		
		// POI的饼图
		function poi_pie() {
			// 基于准备好的dom，初始化echarts实例
			var chart_poi = echarts.init(document.getElementById('poi_pie'));
			var option = {
				tooltip: {
					trigger: 'item'
				},
				legend: {
					orient: 'vertical',
					left: 'left',
					textStyle:{
						color:'rgba(255,255,255,0.7)'
					}
				},
				series : [
					{
						name: 'POI',
						type: 'pie',
						radius: '80%',
						center: ['65%', '50%' ],
						label: {
							position: 'inner',
							formatter: '{d}%'
						},
						data:[
							{value:poi[0], name:'Business'},
							{value:poi[1], name:'Accommodation'},
							{value:poi[2], name:'Entertainment'},
							{value:poi[3], name:'Infrastructure'},
							{value:poi[4], name:'Tourism'}
				
						],
						emphasis: {
							itemStyle: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}
				]
			};
			// 使用刚指定的配置项和数据显示图表。
			chart_poi.setOption(option);
			window.addEventListener("resize",function(){
				chart_poi.resize();
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

	}
})