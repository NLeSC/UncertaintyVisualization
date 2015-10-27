(function() {
  'use strict';
  var CHARTWIDTH = 1000;
  var CHARTHEIGHT = 360;
  var ID = 'TODOid';
  var NAME = 'TODOchart';

  function Actor(name, id, group) {
    this.name = name;
    this.id = id;
    this.group = group;
    this.groupPtr = null;
    this.firstScene = null;
    this.groupPositions = {};
    this.groupNamePositions = {};
  }

  function PunchcardController(d3, D3punchcard, _) {
    function filterData(data, actor, timeFormat) {
      var prereqs = function(item) {
        if (!_.has(item, 'time')) {
          return false;
        }
        var hit = false;
        _.forEach(item.actors, function(n) {
          if (hit) {
            return;
          } else {
            hit = _.includes(n, actor.name);
          }
        });
        return hit;
      };

      var retrieveTimestamp = function(item) {
        return d3.time.format(timeFormat)
                      .parse(item.time);
      };

      var splitDate = function(date) {
        return {
          date: date,
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDay()
        };
      };

      // extract timestamps
      // var timestamps = _.map(
      //   _.filter(data, emailPred),
      //   _.compose(splitDate, retrieveTimestamp));

      var timestamps =  _.map(
        _.filter(data, prereqs),
        _.flow(retrieveTimestamp, splitDate));

      // count number of items in each bin
      var tsCounts = _.countBy(timestamps, function(n) {
        return n.date;
      });

      return tsCounts;

      // console.log(tsCounts);

      // map the nested objects to a list of lists containing {key, value}-pairs
      // var dict2List = function(dict) {
      //   return _.map(d3.range(90, 130), function(i) {
      //     return {
      //       key: _.parseInt(i) + 'h',
      //       value: _.get(dict, i.toString(), 0)
      //     };
      //   });
      // };
      //
      // return _.map(_.pairs(tsCounts),
      //   function(kvpair) {
      //     var dayInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      //     return [{key: 'Day', value: dayInWeek[kvpair[0]]}].concat(dict2List(kvpair[1]));
      //   });
    }

    function showGraph ( data ) {
      var flatAscending, upperLimit;

      flatAscending = data.map( function(array) {
        //var value;
        return array.slice(1).map( function ( sliced ) {
          return parseFloat( sliced.value );
        }).filter(function ( element ) {
          return element > 0;
        });

      }).reduce(function(a, b) {
        return a.concat(b);
      }).sort(function(a, b) {
        return a - b;
      } );

      // we find the upper limit quantile in order
      // to not show upper outliers
      upperLimit = d3.quantile( flatAscending, 0.95 );

      new D3punchcard({
        data: data,
        element: '#punchcard',
        upperLimit: upperLimit
      })
      .draw({ width: document.getElementById('punchcard').offsetWidth });
    }

    function readData(filename) {
      var margin = {top: 20, right: 25, bottom: 20, left: 1};
    	var width = CHARTWIDTH - margin.left - margin.right;
	    var height = CHARTHEIGHT - margin.top - margin.bottom;


      d3.json(filename,
        // callback function
        function(error, data) {
          if (error) {
            console.log(error);
          }

          var actors = data.timeline.actors;
          var events = data.timeline.events;

          actors.forEach(function(actor) {
            actor.timestamps = filterData(events, actor, '%Y%m%d');

          });

        var chart = dc.bubbleChart('#chart-container1');

        var ndx = crossfilter(actors),
          openDimension = ndx.dimension(function(d) {
            return parseInt(d.open / 10) * 10;
          }),
          openGroup = openDimension.group(),
          monthDimension = ndx.dimension(function(d) {
            return new Date(new Date(d.date).setDate(1));
          }),
          closeGroup = monthDimension.group().reduce(
            function(p, v) {
              p.push(v.close);
              return p;
            },
            function(p, v) {
              p.splice(p.indexOf(v.close), 1);
              return p;
            },
            function() {
              return [];
            }
          );

        chart
          .width(768)
          .height(480)
          .margins({
            top: 10,
            right: 50,
            bottom: 30,
            left: 50
          })
          .dimension(monthDimension)
          .group(closeGroup)
          .x(d3.time.scale().domain([new Date("11/01/1985"), new Date("6/01/1986")]))
          .round(d3.time.month.round)
          .xUnits(d3.time.months)
          .elasticY(true);

        pie
          .width(140)
          .height(140)
          .radius(70)
          .dimension(openDimension)
          .group(openGroup);

        dc.renderAll();

        });

        // , function(j) {
        // var jActors = j.timeline.actors;
        // var jEvents = j.timeline.events;
        //
        // showGraph(filterData(data, 'email.sentOn', '%Y-%m-%dT%H:%M:%S.%LZ'));


        // var svg = d3.select('#timelineChart').append('text')
        //   .attr('x', 0)
        //   .attr('y', 0)
        //   .attr('dy', '.35em')
        //   .attr('text-anchor', 'end')
        //   .attr('class', 'chart-title')
        //   .attr('transform', null)
        //   .attr('id', ID)
        //   .text(' - ' + name)
        //   .data([{
        //     name: ' - ' + name
        //   }])
        //   .style('display', 'block');
        //
        // var svg = d3.select('#timelineChart').append('svg')
        //   .attr('width', width + margin.left + margin.right)
        //   .attr('height', height + margin.top + margin.bottom)
        //   .attr('class', 'timelineChart')
        //   .attr('id', ID)
        //   .append('g')
        //   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        //
        //   var actors = [];
        //   var groups = [];
        //   var actorMap = []; // maps id to pointer
        //   for (var i = 0; i < jActors.length; i++) {
        //     var nameArray = jActors[i].name.split('/');
        //     var actorName = nameArray[nameArray.length-1];
        //     var group = nameArray[nameArray.length-2];
        //     if (groups.indexOf(group) < 0) {
        //       groups.push(group);
        //     }
        //
        //     actors[actors.length] = new Actor(actorName, jActors[i].name, group);
        //     actorMap[jActors[i].name] = actors[actors.length - 1];
        //   }
        //
        // debugger;
      // });
      //
      // var timeline = function() {
      //   //data
    	// 	var lanes = ['Chinese','Japanese','Korean'],
    	// 		laneLength = lanes.length,
    	// 		items = [{'lane': 0, 'id': 'Qin', 'start': 5, 'end': 205},
    	// 				{'lane': 0, 'id': 'Jin', 'start': 265, 'end': 420},
    	// 				{'lane': 0, 'id': 'Sui', 'start': 580, 'end': 615},
    	// 				{'lane': 0, 'id': 'Tang', 'start': 620, 'end': 900},
    	// 				{'lane': 0, 'id': 'Song', 'start': 960, 'end': 1265},
    	// 				{'lane': 0, 'id': 'Yuan', 'start': 1270, 'end': 1365},
    	// 				{'lane': 0, 'id': 'Ming', 'start': 1370, 'end': 1640},
    	// 				{'lane': 0, 'id': 'Qing', 'start': 1645, 'end': 1910},
    	// 				{'lane': 1, 'id': 'Yamato', 'start': 300, 'end': 530},
    	// 				{'lane': 1, 'id': 'Asuka', 'start': 550, 'end': 700},
    	// 				{'lane': 1, 'id': 'Nara', 'start': 710, 'end': 790},
    	// 				{'lane': 1, 'id': 'Heian', 'start': 800, 'end': 1180},
    	// 				{'lane': 1, 'id': 'Kamakura', 'start': 1190, 'end': 1330},
    	// 				{'lane': 1, 'id': 'Muromachi', 'start': 1340, 'end': 1560},
    	// 				{'lane': 1, 'id': 'Edo', 'start': 1610, 'end': 1860},
    	// 				{'lane': 1, 'id': 'Meiji', 'start': 1870, 'end': 1900},
    	// 				{'lane': 1, 'id': 'Taisho', 'start': 1910, 'end': 1920},
    	// 				{'lane': 1, 'id': 'Showa', 'start': 1925, 'end': 1985},
    	// 				{'lane': 1, 'id': 'Heisei', 'start': 1990, 'end': 1995},
    	// 				{'lane': 2, 'id': 'Three Kingdoms', 'start': 10, 'end': 670},
    	// 				{'lane': 2, 'id': 'North and South States', 'start': 690, 'end': 900},
    	// 				{'lane': 2, 'id': 'Goryeo', 'start': 920, 'end': 1380},
    	// 				{'lane': 2, 'id': 'Joseon', 'start': 1390, 'end': 1890},
    	// 				{'lane': 2, 'id': 'Korean Empire', 'start': 1900, 'end': 1945}],
    	// 		timeBegin = 0,
    	// 		timeEnd = 2000;
      //
    	// 	var m = [20, 15, 15, 120], //top right bottom left
    	// 		w = 960 - m[1] - m[3],
    	// 		h = 500 - m[0] - m[2];
      //
    	// 	//scales
    	// 	var x = d3.scale.linear()
    	// 			.domain([timeBegin, timeEnd])
    	// 			.range([0, w]);
    	// 	var y = d3.scale.linear()
    	// 			.domain([0, laneLength])
    	// 			.range([0, h]);
      //
    	// 	var chart = d3.select('body')
    	// 				.append('svg')
    	// 				.attr('width', w + m[1] + m[3])
    	// 				.attr('height', h + m[0] + m[2])
    	// 				.attr('class', 'chart');
      //
    	// 	chart.append('defs').append('clipPath')
    	// 		.attr('id', 'clip')
    	// 		.append('rect')
    	// 		.attr('width', w)
    	// 		.attr('height', h);
      //
    	// 	var mini = chart.append('g')
    	// 				.attr('transform', 'translate(' + m[3] + ',' + (h + m[0]) + ')')
    	// 				.attr('width', w)
    	// 				.attr('height', h)
    	// 				.attr('class', 'mini');
      //
    	// 	//mini lanes and texts
    	// 	mini.append('g').selectAll('.laneLines')
    	// 		.data(items)
    	// 		.enter().append('line')
    	// 		.attr('x1', m[1])
    	// 		.attr('y1', function(d) {return y(d.lane);})
    	// 		.attr('x2', w)
    	// 		.attr('y2', function(d) {return y(d.lane);})
    	// 		.attr('stroke', 'lightgray');
      //
    	// 	mini.append('g').selectAll('.laneText')
    	// 		.data(lanes)
    	// 		.enter().append('text')
    	// 		.text(function(d) {return d;})
    	// 		.attr('x', -m[1])
    	// 		.attr('y', function(d, i) {return y(i + .5);})
    	// 		.attr('dy', '.5ex')
    	// 		.attr('text-anchor', 'end')
    	// 		.attr('class', 'laneText');
      //
    	// 	//mini item rects
    	// 	mini.append('g').selectAll('miniItems')
    	// 		.data(items)
    	// 		.enter().append('rect')
    	// 		.attr('class', function(d) {return 'miniItem' + d.lane;})
    	// 		.attr('x', function(d) {return x(d.start);})
    	// 		.attr('y', function(d) {return y(d.lane + .5) - 5;})
    	// 		.attr('width', function(d) {return x(d.end - d.start);})
    	// 		.attr('height', 10);
      //
    	// 	//mini labels
    	// 	mini.append('g').selectAll('.miniLabels')
    	// 		.data(items)
    	// 		.enter().append('text')
    	// 		.text(function(d) {return d.id;})
    	// 		.attr('x', function(d) {return x(d.start);})
    	// 		.attr('y', function(d) {return y(d.lane + .5);})



      }
    }
    readData('data/airbus_contextual.timeline.json');
  }

  angular.module('uncertApp.punchcard').controller('PunchcardController', PunchcardController);
})();
