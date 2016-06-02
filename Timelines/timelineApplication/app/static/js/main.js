	$(document).ready(function() {
		var added_files = [];
		var submitted = false; 
		// upload multiple naf files
		$.ajax({ url: "/init",
			context: document.body,
			complete: function(response) {
				window.handler = response["responseText"];

				$('#form-upload').fileupload({
					dataType: 'json',
					singleFileUploads: false,
					forceIframeTransport: true,
					url: '/upnaf/'+ window.handler,
					add: function (e, data) {

						added_files.push(data);

						$('.thread-reply').unbind('click');    
						$('.thread-reply').on('click', function(e) {
							e.preventDefault();
							data.formData = $('#form-upload').serializeArray();
							var original_data = data;
							var new_data = {files: [], originalFiles: [], paramName: []};
							jQuery.each(added_files, function(index, file) {
								new_data['files'] = jQuery.merge(new_data['files'], file.files);
								new_data['originalFiles'] = jQuery.merge(new_data['originalFiles'], file.originalFiles);
								new_data['paramName'] = jQuery.merge(new_data['paramName'], file.paramName);
							});
							new_data = jQuery.extend({}, original_data, new_data);
							new_data.submit();
						});
					},
					submit: function (e, data) {
						$('#warningMessage').show();
					},
					done: function (e, data) {
						window.inputData = data.result;

						$('#numEvents').html('<p><b>The current number of the Events of the files that have been uploaded is:</b></p>'+ '<b>' +inputData.timeline.events.length+'</b>'); 
						createGraph(inputData);
  						$("#warningMessage").fadeTo(500).slideUp(500);
				},
				send: function (e, data) {
				}
			});
			//upload json file
			$('#json-upload').fileupload({
					dataType: 'json',
					singleFileUploads: false,
					forceIframeTransport: true,
					url: '/upjson/'+ window.handler,
					add: function (e, data) {
						added_files.push(data);

						$('.thread-reply').unbind('click');    
						$('.thread-reply').on('click', function(e) {
							e.preventDefault();
							data.formData = $('#form-upload').serializeArray();
							var original_data = data;
							var new_data = {files: [], originalFiles: [], paramName: []};
							jQuery.each(added_files, function(index, file) {
								new_data['files'] = jQuery.merge(new_data['files'], file.files);
								new_data['originalFiles'] = jQuery.merge(new_data['originalFiles'], file.originalFiles);
								new_data['paramName'] = jQuery.merge(new_data['paramName'], file.paramName);
							});
							new_data = jQuery.extend({}, original_data, new_data);

							new_data.submit();
						});
					},
					submit: function (e, data) {
					},
					done: function (e, data) {
						window.inputData = data.result;
						$('#numEvents').append('<p><b>The current number of the Events of the files that have been uploaded is:'+ inputData.timeline.events.length+'</b></p>'); 
						createGraph(inputData);
				}, // done: function
				send: function (e, data) {
				}
			});
		}}); // ajax
		//main function of creating a graph
		function createGraph(data){

			//http://cloford.com/resources/colours/500col.htm
		    // colorList = [crimson(red), mediumpurple 2, cobalt(blue),lightsteelblue, cornflowerblue, peacock, green 4, lightgoldenrod 1, orange, violetred, sgi salmon, sgi slateblue, 
		    //brown, rosybrown 2, tomato 2 , seashell 4 , burlywood 1, antiquewhite 4, lemonchiffon 3, yellow 4, olivedrab , darkseagreen 4, springgreen 3, lightseagreen, goldenrod 3,palevioletred 1,
		    //banana, gray 39, indian red, hotpink 4, darkorchid 2, mediumslateblue,teal*,  steelblue, deeppink 4, turquoise 4, limegreen, darkorchid 3 ]
		    var colorList = ['#DC143C','#9A32CD','#FFEC8B','#C67171','#9F79EE','#3D59AB','#B0C4DE','#6495ED','#33A1C9','#008B00', '#FF8000','#D02090','#7171C6','#A52A2A',
		    '#EEB4B4','#EE5C42','#8B8682','#FFD39B','#8B8378','#CDC9A5','#8B8B00','#6B8E23','#698B69','#008B45','#20B2AA','#CD9B1D','#FF82AB','#E3CF57','#636363','#B0171F','#8B3A62','#B23AEE',
		    '#7B68EE','#008080','#4682B4','#00868B','#8B0A50','#00868B','#32CD32','#8B475D','#9A32CD']

		    var counter = 0;
		
		    var options = {
		        chart: {
		          type: 'scatter',
		          zoomType: 'xy',
		          height: 800,
		        },
		        title: {
		            text: 'NewsReader Project'
		        },
		        subtitle: {
		          text: 'Groups'
		        },
		        xAxis: {
		            type: 'datetime',
		            dateTimeLabelFormats: {

		                month: '%b \'%y',
		                year: '%Y'
		            },
		          	title:{
		              text: 'Date'
		            },
		            labels:{
		              rotation: -45
		            }
		        },
		        yAxis:{
		            title: {
		              	text: 'Groups'
		        	},
		        	alternateGridColor: '#f3fafd',
	            	startOnTick: false,
	            	endOnTick: false,
		        },
		        tooltip: {
		        	style: {
		        		padding: 10,
		        		fontWeight:'bold',

		        	},
		            shared: true,
		            useHTML:true,
		            // tooltip
		            headerFormat: '<div><table border-collapse:collapse><thead><tr>' + 
		              '<th style = "border-bottom: 2px solid #667b1; color: #039" ' +
		              'colspan = 2>{point.time}</th></tr></thead><tbody>' ,
		            pointFormat: '<tr><td style = "color: {series.color}; vertical-align:middle; border-bottom: 1px solid #e7e7e7 !important;">'+'<b>Event</b>: </div></td> \
		              <td style = "text-align: left; color:#669; border-bottom: 1px solid #e7e7e7 !important;">' +
		              '<b>{point.eventid}</b></td></tr><br/>' +
		              '<tr><td style = "color: {series.color}; vertical-align:middle; border-bottom: 1px solid #e7e7e7 !important;">'+
		              '<b>Time</b>:</td><td style = "text-align: left; color:#669; border-bottom: 1px solid #e7e7e7 !important;">' +
		              '<b>{point.time}</b></td></tr>'+
		              '<tr><td style = "color: {series.color}; vertical-align:middle; border-bottom: 1px solid #e7e7e7 !important;">'+
		              '<b>Related Label</b>:</td><td style = "text-align: left; color:#669; border-bottom: 1px solid #e7e7e7 !important;">' +
		              '<b>{point.label}</b></td></tr>' +
		              '<tr><td style = "color: {series.color}; vertical-align:middle; border-bottom: 1px solid #e7e7e7 !important;">'+
		              '<b>Related Actors</b>:</td><td style = "text-align: left; color:#669; border-bottom: 1px solid #e7e7e7 !important;">' +
		              '<b>{point.actor}</b></td></tr>',
		            footerFormat: '</tbody></table>'
		        },
		        legend: {
		            enabled: false,
		        },
		        plotOptions: {
		            scatter:{
		                marker: {
		                    symbol:'circle',
		                    enabled: true,
		                    states: {
		                       	hover: {
		                        	enabled: true,
		                        	fillColor: 'rgb(100,100,100)',
		                        	radius:10
		                        }
		                    }
		                }
		            },
		            series:{
		            	cursor: 'pointer',
		            	point:{
		            		events:{
		            			// function creating the new graph of one group category
		            			click: function(){
		            				window.selectedGroupName = categories[this.y];

		            				var options_2 = {
								        chart: {
								          type: 'scatter',
								          zoomType: 'xy',
								          width: 500
								        },
								        title: {
								            text: 'NewsReader Project'
								        },
								        subtitle: {
								          text: selectedGroupName
								        },
								        xAxis: {
								            type: 'datetime',
								            dateTimeLabelFormats:{
            									month: '%b %e, %Y'
          									},  // label in x axis will be displayed like Jan 1, 2012
								          	title:{
								              text: 'Date'
								            },
								            labels:{
								              rotation: -45
								            }
								        },
								        yAxis:{
								        	min: 0,
								        	tickInterval: 2,
								            title: {
								              	text: "Climax"
								        	}
								    	},
								    	tooltip: {
								        	style: {
								        		padding: 10,
								        		fontWeight:'bold',

								        	},
								            shared: true,
								            useHTML:true,

								            headerFormat: '<div><table border-collapse:collapse><thead><tr>' + 
								              '<th style = "border-bottom: 2px solid #667b1; color: #039" ' +
								              'colspan = 2>{point.time}</th></tr></thead><tbody>' ,
								            pointFormat: '<tr><td style = "color: {series.color}; vertical-align:middle; border-bottom: 1px solid #e7e7e7 !important;">'+'<b>Event</b>: </div></td> \
								              <td style = "text-align: left; color:#669; border-bottom: 1px solid #e7e7e7 !important;">' +
								              '<b>{point.eventid}</b></td></tr><br/>' +
								              '<tr><td style = "color: {series.color}; vertical-align:middle; border-bottom: 1px solid #e7e7e7 !important;">'+
								              '<b>Time</b>:</td><td style = "text-align: left; color:#669; border-bottom: 1px solid #e7e7e7 !important;">' +
								              '<b>{point.time}</b></td></tr>'+
								              '<tr><td style = "color: {series.color}; vertical-align:middle; border-bottom: 1px solid #e7e7e7 !important;">'+
								              '<b>Related Label</b>:</td><td style = "text-align: left; color:#669; border-bottom: 1px solid #e7e7e7 !important;">' +
								              '<b>{point.label}</b></td></tr>' +
								              '<tr><td style = "color: {series.color}; vertical-align:middle; border-bottom: 1px solid #e7e7e7 !important;">'+
								              '<b>Related Actors</b>:</td><td style = "text-align: left; color:#669; border-bottom: 1px solid #e7e7e7 !important;">' +
								              '<b>{point.actor}</b></td></tr>',
								            footerFormat: '</tbody></table>'
								        },
								        legend: {
								            enabled: false,
								        }
								    }
								    //get only the data that have the selected group
		             				var returnedData = $.grep(data['timeline']['events'], function (element, index) {
		             					
		             					var groupName = element.group
    					 				return groupName === window.selectedGroupName;
									 });

		             				function radius(eventSpecifier){
		    							if(parseInt(eventSpecifier.size) < 20){
		    								var size = parseInt(eventSpecifier.size) + 3;
		    							}
		    							return size;
		    						}

		             				var groupSeries = {name:"Groups" ,data: [] };

		             				for (i in returnedData){
	      								value = returnedData[i];
	      								var climax = parseInt(value.climax)	

	      								dateString = value.time;
									    var year, month, day;
									      
								        if(dateString!='NOTIMEANCHOR'){
								        	year = dateString.substring(0,4);
								        	month = dateString.substring(4,6);
								        	day = dateString.substring(6,8);
								      	}
									    
									    var date = Date.UTC(year, month-1, day); 
									    var read_time = new Date(date);
									    var read_month = read_time.getMonth() + 1;
									    var read_day = read_time.getDate();
									    var read_year = read_time.getFullYear();
									    var ReadableTime = read_day + "/" + read_month + "/" + read_year;

									    
		      							groupSeries.data.push({ x: date,
										                        y: climax,
										                        eventid: value.event,
										                        actor: actors(value,"tooltip"),
										                        label: labels(value),
										                        time: ReadableTime,
										                        radius: radius(value),
										                        fillColor: '#191970' });
				                    }

				                    options_2.series = [];
				                    options_2.series.push(groupSeries);
				                    //pop up modal
			                        $('#myModal').modal({
										backdrop: true,
										keyboard: true
									}).css({
										position: 'fixed',
									    'border-radius': '10px',
									    display: 'none',
  										'max-height': 'calc(100% - 100px)',
									    top: '50%',
    									left: '50%',
    									right: 'auto',
    									bottom: 'auto',
  										transform: 'translate(-50%, -50%)',
										width: 1000,
										'z-index': 990,
									});
									$('#myModal').modal('show'); 
									var chart = $('#myModalBody').highcharts(options_2);
					
				                    
		            			
		            				}

		            			}
		            		}
		            	}
		        },
		    	series: []
			};

			var categories = [];
		    var series = {name:"Groups" ,data: [] };
		    var actorCategories=[];
		    var uniqueActorsCategories = [];
		   
		    //returns the unique values
		    function onlyUnique(value, index, self) { 
		        return self.indexOf(value) === index;
		    }

		    //get the actors of each event
		    function actors(eventSpecifier, usage) {
		      var actors = [];
		      var uniqueActors = [];

		      for(i in eventSpecifier.actors){
		      	for(j in eventSpecifier.actors[i]){
		        	var actor = eventSpecifier.actors[i][j].toString();
		        	var nameOfActor = actor.match(/[^\/]*$/);
		        	actors.push(String(nameOfActor));
		    	}
		      }
		      uniqueActors = actors.filter(onlyUnique).sort();
		      if(usage == "selection"){
		      	return uniqueActors;
		      }else if(usage == "tooltip"){
		      	var actorsText = "";
		      	for (var act in uniqueActors){
		      		actorsText += uniqueActors[act] + "<br/>";
		      	}
		      	return actorsText;
		      }
		    }
		    // get the labels of each category
		    function labels(eventSpecifier) {
		      var labels = [];
		      for(i in eventSpecifier.labels){
		        var label = eventSpecifier.labels[i].toString();
		        labels.push(String(label));
		      }
		      labelsText = "";
		      for (var lbl in labels){
		      	labelsText += labels[lbl] + "<br/>";
		      }

		     return labelsText;
		    }

		    // specify and returns the radius of each event
		    function radius(eventSpecifier){
		    	if(parseInt(eventSpecifier.size) < 20){
		    		var size = parseInt(eventSpecifier.size) + 3;
		    	}
		    	return size;
		    }

		    // sort map locations by name
			var sortedEvents = data['timeline']['events'].sort(function(a,b){
    										return a.group.localeCompare(b.group);
    										});
			for (i in sortedEvents){
	      		value = sortedEvents[i]

		      	if (categories.indexOf(value.group)== -1){
		        	categories.push(value.group);
		      	}

			    dateString = value.time;
			    var year, month, day;
			      
		        if(dateString!='NOTIMEANCHOR'){
		        	year = dateString.substring(0,4);
		        	month = dateString.substring(4,6);
		        	day = dateString.substring(6,8);
		      	}
			    
			    var date = Date.UTC(year, month-1, day); 
			    var read_time = new Date(date);
			    var read_month = read_time.getMonth() + 1;
			    var read_day = read_time.getDate();
			    var read_year = read_time.getFullYear();
			    var ReadableTime = read_day + "/" + read_month + "/" + read_year;

		    
			    for(n in value.actors){
			    	for(m in value.actors[n]){
			    		var actr = String(value.actors[n][m]);
			        	if (actorCategories.indexOf(actr)==-1){
			            	var actrStr = actr.toString()
			            	var nameOfActor = actrStr.match(/[^\/]*$/);
			            	actorCategories.push(String(nameOfActor));
			        	}
			       }
			    }

			    series.data.push({  x: date,
			                        y:categories.indexOf(value.group),
			                        eventid: value.event,
			                        actor: actors(value, "tooltip"),
			                        actorList: actors(value, "selection"),
			                        label: labels(value),
			                        time: ReadableTime,
			                        radius: radius(value),
			                        fillColor: '#191970' });

		    };


		    var uniqueActorsCategories = actorCategories.filter(onlyUnique);
		    uniqueActorsCategories.sort();
		    options.series.push(series);
		    options.yAxis.categories = categories;
		    var chart = $('#container_2').highcharts(options);

		    var $firstChoice = $("#first-choice");
		    $firstChoice.empty();
		    for(i in uniqueActorsCategories){
		        $firstChoice.append("<option value ="+ uniqueActorsCategories[i] + ">" + uniqueActorsCategories[i] + "</option>");
		    }

		    //updates the color of a point if it has as an actor the selected one 
			$('#first-choice').change(function(){
    			var chart = $('#container_2').highcharts();
    			var selectedActor = this.value;
    		  	for (i in chart.series[0].data){
        			value = chart.series[0].data[i];
        			for(j in value.actorList){
            			var actr = String(value.actorList[j]);
            			if (actr == String(selectedActor)){
                			chart.series[0].data[i].update({fillColor: colorList[counter], radius:10 });  
            			}
        			}
    			}
    			counter = counter+1;
    			chart.redraw();
			});

		} //createGraph

		// load a static json file example and print the graph (calling the function createGraph)
		$("#jsonExample").click(function() {
			$.getJSON('./static/Json/contextual.timeline.json', function(data) {
				$('#numEvents').html('<p><b>The current number of the Events of the files that have been uploaded is:</b></p>'+ '<b>' +data.timeline.events.length+'</b>'); 
				createGraph(data);

				});
		});

		// load a naf file example and print the graph (calling the function createGraph)
		$("#nafExample").click(function() {
			$('#warningMessage').show();
			$.ajax({
				url: "/getnaf",
				type : 'POST',
				dataType: 'json',
				success: function(data) {
        			$('#numEvents').html('<p><b>The current number of the Events of the files that have been uploaded is:</b></p>'+ '<b>' +data.timeline.events.length+'</b>'); 
        			createGraph(data)
        			$("#warningMessage").fadeTo(500).slideUp(500);
    			}
			});
		});

		//load and print the json file in new tab in the browzer 
		$("#jsonStructureExample").click(function() {
			$.getJSON('./static/Json/contextual.timeline.json', function(response) {
				//json = JSON.stringify(response,null,4); 
				window.open('data:application/json;' + (window.btoa?'base64,'+btoa(JSON.stringify(response,null,4)):JSON.stringify(response,null,4)));
			});
		});
		//load and print the naf file in new tab in the browzer 
		$("#nafStructureExample").click(function() {
			$.ajax({
				url: "./static/naf/1173_Internal_emails_expose_Boeing-Air_Force_contract_discussions.xml",
				type : 'GET',
				dataType: 'text',
				success: function(xml) {
					window.open('data:application/xml;' + (window.btoa?'base64,'+btoa(xml):xml));
    			}
			});
		});

		$('.alert .close').on('click', function(e) {
    		$(this).parent().hide();
		});

	
}); // document.ready