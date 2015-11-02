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

  function PunchcardController(d3, dc, crossfilter, D3punchcard, _) {

    var textRenderlet = function(_chart) {
      function setStyle(selection) {
        var rects = selection.select('rect');
        var texts = selection.select('text');

        var colors = [];
        rects.each( function(){
          colors.push(d3.select(this).attr('fill'));
        });

        texts.each( function(d, i){
          d3.select(this).style('fill', function() {
            return 'black';
          });
        });
      }
      // set the fill attribute for the bars
      setStyle(_chart
        .selectAll('g.row'), 'layer'
      );
    };

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

      var retrieveTimestampAndScores = function(item) {
        var time = d3.time.format(timeFormat)
          .parse(item.time);
        var climax = item.climax;
        return {
          'date': time,
          'score': climax
        };
      };

      // var splitDate = function(date) {
      //   return {
      //     date: date,
      //     year: date.getFullYear(),
      //     month: date.getMonth(),
      //     day: date.getDay()
      //   };
      // };

      // extract timestamps
      // var timestamps = _.map(
      //   _.filter(data, emailPred),
      //   _.compose(splitDate, retrieveTimestamp));

      var timestamps = _.map(
        _.filter(data, prereqs), retrieveTimestampAndScores);
      // _.flow(retrieveTimestamp, splitDate));

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

    // function showGraph ( data ) {
    //   var flatAscending, upperLimit;
    //
    //   flatAscending = data.map( function(array) {
    //     //var value;
    //     return array.slice(1).map( function ( sliced ) {
    //       return parseFloat( sliced.value );
    //     }).filter(function ( element ) {
    //       return element > 0;
    //     });
    //
    //   }).reduce(function(a, b) {
    //     return a.concat(b);
    //   }).sort(function(a, b) {
    //     return a - b;
    //   } );
    //
    //   // we find the upper limit quantile in order
    //   // to not show upper outliers
    //   upperLimit = d3.quantile( flatAscending, 0.95 );
    //
    //   new D3punchcard({
    //     data: data,
    //     element: '#punchcard',
    //     upperLimit: upperLimit
    //   })
    //   .draw({ width: document.getElementById('punchcard').offsetWidth });
    // }

    function readData(filename) {
      var margin = {
        top: 20,
        right: 25,
        bottom: 20,
        left: 1
      };
      // var width = CHARTWIDTH - margin.left - margin.right;
      // var height = CHARTHEIGHT - margin.top - margin.bottom;


      d3.json(filename,
        // callback function
        function(error, data) {
          if (error) {
            console.log(error);
          }

          var actors = data.timeline.actors;
          var events = data.timeline.events;

          var ndx = crossfilter(events);
          var all = ndx.groupAll();

          var timeDimension = ndx.dimension(function(d) {
            var group = d.group.split(':')[0];
            var time = d3.time.format('%Y%m%d').parse(d.time);
            var climax = d.climax;
            return [group, time, climax];
          });

          var climaxSumGroup = timeDimension.group().reduceSum(function(d) {
            return +d.climax;
          });

          var symbolScale = d3.scale.ordinal().range(d3.svg.symbolTypes);

          var subChart1 = function(c) {
            return dc.scatterPlot(c)
              .symbol(function(d) {
                return symbolScale(d.key[0]);
              })
              .symbolSize(8)
              .highlightedSize(10);
          };

          var customSeriesChart = dc.customSeriesChart('#timeline');

          customSeriesChart
            .width(768)
            .height(480)
            // .chart(subChart1)
            .chart(subChart1)
            .x(d3.time.scale().domain([new Date(1995, 0, 1), new Date(2025, 0, 1)]))
            .renderHorizontalGridLines(true)
            .seriesAccessor(function(d) {
              return d.key[0];
            })
            .keyAccessor(function(d) {
              return d.key[1];
            })
            .valueAccessor(function(d) {
              return d.value;
            })
            .filterHandler(function(dimension, filter){
              dimension.filterFunction(function(d) {
                var result = true;
                filter.forEach(function(f) {
                  if (result === true) {
                    if ((d[1] < Math.min(f[0][0], f[1][0]) || d[1] > Math.max(f[0][0], f[1][0])) ||
                        (d[2] < Math.min(f[0][1], f[1][1]) || d[2] > Math.max(f[0][1], f[1][1]))) {
                      result = false;
                    }
                  }
                });
                return result;
              });
              // dimension.filter(filter);
              return filter; // set the actual filter value to the new value
            })
            // .keyAccessor(function(d) {return d.key; })
            // .valueAccessor(function(d) {return d.value; })
            .elasticY(true)
            .brushOn(true)
            .clipPadding(10)
            .xAxisLabel('time')
            .yAxisLabel('climax score sum')
            .dimension(timeDimension)
            .group(climaxSumGroup);
          customSeriesChart.render();




          var yearlyBubbleChart = dc.bubbleChart('#laneChart');

          var laneTimeDimension = ndx.dimension(function(d) {
            var time = d3.time.format('%Y%m%d').parse(d.time);
            var group = d.group.split(':')[0];
            return [time,group];
          });

          var laneClimaxGroup = laneTimeDimension.group().reduceSum(function(d) {
            return +d.climax;
          });

          yearlyBubbleChart
            .width(1400)
            .height(400)
            .margins({
              top: 10,
              right: 50,
              bottom: 30,
              left: 40
            })
            .dimension(laneTimeDimension)
            .group(laneClimaxGroup)
            .transitionDuration(1500)
            // .colors(["#a60000", "#ff0000", "#ff4040", "#ff7373", "#67e667", "#39e639", "#00cc00"])
            // .colorDomain([-12000, 12000])
            // .colorAccessor(function(d) {
            //   return d.value.absGain;
            // })
            .keyAccessor(function(p) {
              return p.key[0];
            })
            .valueAccessor(function(p) {
              return p.key[1];
            })
            .radiusValueAccessor(function(p) {
              return p.value;
            })
            .minRadius(2)
            .maxBubbleRelativeSize(0.01)
            .x(d3.time.scale().domain([new Date(1995, 0, 1), new Date(2025, 0, 1)]))
            .y(d3.scale.linear().domain([0, 125]))
            .r(d3.scale.linear().domain([0, 140]))
            .elasticY(false)
            .yAxisPadding(100)
            .elasticX(false)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .renderLabel(true)
            .renderTitle(true)
            .label(function(p) {
              return ' '; //p.key;
            })
            .title(function(p) {
              return p.key + '\n' + 'Climax: ' + p.value;
            })
            .xAxisLabel('time')
            .yAxisLabel('group')
            .yAxis().tickFormat(function(v) {
              return v;
            });

          yearlyBubbleChart.render();
          // var laneChart = dc.laneChart('#laneChart');
          // laneChart
          //   .x(d3.time.scale().domain([new Date(1995, 0, 1), new Date(2025, 0, 1)]))
          //   .width(768)
          //   .height(480)
          //   .keyAccessor(function(d) {
          //     return d.key;
          //   })
          //   .valueAccessor(function(d) {
          //     return d.value;
          //   })
          //   .dimension(laneTimeDimension)
          //   .group(laneClimaxSumGroup);










          var timeDimension2 = ndx.dimension(function(d) {
            // var group = d.group;
            var time = d3.time.format('%Y%m%d').parse(d.time);
            // return [group, time];
            return time;
          });

          var climaxSumGroup2 = timeDimension2.group();
          // .reduceSum(function(d) {
          //   return +d.climax;
          // });

          // var symbolScale2 = d3.scale.ordinal().range(d3.svg.symbolTypes);




          // var composite = dc.customCompositeChart('#timeline2');
          //
          // composite
          //   .width(768)
          //   .height(480)
          //   .x(d3.time.scale().domain([new Date(1995, 0, 1), new Date(2025, 0, 1)]))
          //   .renderHorizontalGridLines(true)
          //
          //   .compose([
          //     dc.lineChart(composite)
          //       .dimension(timeDimension2)
          //       .group(climaxSumGroup2)
          //       .colors('navy')
          //       .dashStyle([2,2])
          //       .keyAccessor(function(d) {
          //         return d.key;
          //       })
          //       .valueAccessor(function(d) {
          //         return +d.value;
          //       }),
          //     dc.customScatterPlot(composite)
          //       .dimension(timeDimension2)
          //       .group(climaxSumGroup2)
          //       // .colors(d3.scale.category20c())
          //       // .colorAccessor(function(d, i) {
          //       //   return d.key;
          //       // })
          //       // .symbol(function(d) {
          //       //   return symbolScale2(d.key[0]);
          //       // })
          //       .symbolSize(8)
          //       .highlightedSize(10)
          //       .keyAccessor(function(d) {
          //         return d.key;
          //       })
          //       .valueAccessor(function(d) {
          //         return +d.value;
          //       })
          //     ])
          //   // .keyAccessor(function(d) {return d.key; })
          //   // .valueAccessor(function(d) {return d.value; })
          //   .elasticY(true)
          //   .brushOn(true)
          //   .clipPadding(10)
          //   .xAxisLabel('time')
          //   .yAxisLabel('climax score sum');
          // composite.render();




          var groupDimension = ndx.dimension(function(d) {
            return d.group.split(':')[0];
          });
          var countPerGroup = groupDimension.group();

          var rowChart1 = dc.rowChart('#rowchart_groups');
          rowChart1
            .x(d3.scale.linear())
            .data(function(d) {
              return d.order(function(d) {
                return d;
              }).top(20);
            })
            .ordering(function(d) {
              return -d;
            })
            .width(768)
            .height(480)
            .elasticX(true)
            .dimension(groupDimension)
            .group(countPerGroup);

          rowChart1.on('renderlet', textRenderlet);
          rowChart1.render();

          var actorA0Dimension = ndx.dimension(function(d) {
            var actor0 = d.actors['pb/A0'];
            if (actor0 === undefined || actor0 === '') {
              actor0 = 'unknown';
            }
            var parts = actor0[0].split('/');
            return parts[parts.length-1];
          });
          var countPerActorA0 = actorA0Dimension.group();

          var rowChart2 = dc.rowChart('#rowchart_firstAction');
          rowChart2
            .x(d3.scale.linear())
            .data(function(d) {
              return d.order(function(d) {
                return d;
              }).top(20);
            })
            .ordering(function(d) {
              return -d;
            })
            .width(768)
            .height(480)
            .elasticX(true)
            .dimension(actorA0Dimension)
            .group(countPerActorA0);

          rowChart2.on('renderlet', textRenderlet);
          rowChart2.render();

          var actorA1Dimension = ndx.dimension(function(d) {
            var actor0 = d.actors['pb/A1'];
            if (actor0 === undefined || actor0 === '') {
              actor0 = 'unknown';
            }
            var parts = actor0[0].split('/');
            return parts[parts.length-1];
          });
          var countPerActorA1 = actorA1Dimension.group();

          var rowChart3 = dc.rowChart('#rowchart_secondAction');
          rowChart3
            .x(d3.scale.linear())
            .data(function(d) {
              return d.order(function(d) {
                return d;
              }).top(20);
            })
            .ordering(function(d) {
              return -d;
            })
            .width(768)
            .height(480)
            .elasticX(true)
            .dimension(actorA1Dimension)
            .group(countPerActorA1);

          rowChart3.on('renderlet', textRenderlet);
          rowChart3.render();

          var idDimension = ndx.dimension(function(d) {
            return [d.group, d.time, d.labels];
          });

          var dataTable = dc.dataTable('#dataTable');
          dataTable
            .size(25)
            .width(1200)
            .dimension(idDimension)
            .group(function () {
              return '';
            }).sortBy(function(d){
              return d.time;
            })
            .order(d3.ascending)
            .columns([
              { label:'Group',
                format: function(d) {
                  return d.group;
                }
              },
              { label:'Time',
                format: function(d) {
                  return d.time;
                }
              },
              { label:'Climax Score',
                format: function(d) {
                  return d.climax;
                }
              },
              { label:'A0',
                format: function(d) {
                  return d.actors['pb/A0'];
                }
              },
              { label:'A1',
                format: function(d) {
                  return d.actors['pb/A1'];
                }
              },
              { label:'Labels',
                format: function(d) {
                  return d.labels;
                }
              }
            ]);
          dataTable.render();
          // dc.renderAll();
        }
      );
    }

    readData('data/airbus_contextual.timeline.json');
  }

  angular.module('uncertApp.punchcard').controller('PunchcardController', PunchcardController);
})();
