(function() {
  'use strict';

  function PunchcardController(d3, dc, crossfilter, colorbrewer) {
    //A renderlet that makes the text in the rowCharts to which it is applied more
    //readable by changing the text color based on the background color.
    var textRenderlet = function(_chart) {
      function setStyle(selection) {
        var rects = selection.select('rect');
        var texts = selection.select('text');

        var colors = [];
        rects.each( function(){
          colors.push(d3.select(this).attr('fill'));
        });

        texts.each( function(){
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

    //A renderlet as a helper function for the groupChart, to add the symbols
    //from the series chart (and adjust the positions to accomodate them)
    var symbolScale = d3.scale.ordinal().range(d3.svg.symbolTypes);
    var symbolRenderlet = function(_chart) {
      //For each row in the chart
      _chart.selectAll('g.row').each(function() {
        //Append a path element
        d3.select(this).append('path')
          //Bind he data so we can use it for determining the symbol shape
          .data(d3.select(this).data())
          .attr('class','symbol')
          .attr('opacity', '1')
          //Get the color from the chart
          .attr('fill', _chart.getColor)
          //Position correctly, the Y attribute is a magic number
          .attr('transform', function() {
            return 'translate(' + 3 + ',' + 3.710526315789474 + ')';
          })
          //Determine the symbol from the data. Use the same symbol scale as the
          //series chart
          .attr('d', function(d) {
            var symbol = d3.svg.symbol();
            symbol.size(15);
            symbol.type(symbolScale(d.key));
            return symbol();
          });

        //Reposition the rectangles to make room for the symbol
        d3.select(this).select('rect')
          .attr('transform', function() {
            return 'translate(' + 10 + ',' + 0 + ')';
          });
      });
    };

    function readData(filename) {
      //We use d3 to read our JSON file
      d3.json(filename,
        function(error, data) {
          if (error) {
            console.log(error);
          }

          // var actors = data.timeline.actors;

          //Crossfilter initialization
          var events = data.timeline.events;
          var ndx = crossfilter(events);
          // var all = ndx.groupAll();


          //The row Chart which shows how important the groups are in terms of climax scores
          var groupRowChart = dc.rowChart('#rowchart_groups');

          //A dimension which consists of all the different group numbers
          var groupDimension = ndx.dimension(function(d) {
            return d.group;
          });

          //We sum the climax scores for the groups.
          var climaxSumPerGroup = groupDimension.group();

          ///The group includes a value which tells us how important the group is
          //in the overall storyline. For this graph, we filter out the groups with
          //an importance value <= 1%
          function filterGroupsOnImportance(sourceGroup) {
            return {
              all:function () {
                return sourceGroup.all().filter(function(d) {
                  var groupNum = parseInt(d.key.split(':')[0]);
                  return  groupNum > 1;
                });
              },
              top:function(n) {
                return sourceGroup.top(Infinity).filter(function(d) {
                  var groupNum = parseInt(d.key.split(':')[0]);
                  return  groupNum > 1;
                }).slice(0,n);
              }
            };
          }
          var filteredGroups = filterGroupsOnImportance(climaxSumPerGroup);

          //Set up the
          groupRowChart
            //Size in pixels
            .margins({
              top: 20,
              right: 0,
              bottom: 20,
              left: 0
            })
            .width(parseInt(d3.select('#rowchart_groups').style('width'), 10))
            .height(400)

            //A smaller-than-default gap between bars
            .gap(2)

            //Use an ordinal color scale
            .colors(d3.scale.category20c())
            //Use a custom accessor
            .colorAccessor(function(d) {
              var splitString = d.key.split(':');
              var valueApproximation = - (10000 * parseInt(splitString[0]) + 10*splitString[1].charCodeAt(2) + splitString[1].charCodeAt(3));
              return valueApproximation;
            })

            //Bind data
            .dimension(groupDimension)
            .group(filteredGroups)

            //Order by key string (reverse, so we had to invent some shenanigans)
            //This is done explicitly to match the laneChart ordering.
            .ordering(function(d) {
              var splitString = d.key.split(':');
              var valueApproximation = - (10000 * parseInt(splitString[0]) + 10*splitString[1].charCodeAt(2) + splitString[1].charCodeAt(3));
              return valueApproximation;
            })

            //The x Axis
            .x(d3.scale.linear())
            .elasticX(true)
            .xAxis().tickValues([]);

          //Use a renderlet function to add the colored symbols to the legend (defined above)
          groupRowChart.on('renderlet', symbolRenderlet);
          groupRowChart.render();


          //The customSeriesChart
          var customSeriesChart = dc.customSeriesChart('#timeline');

          //The dimension for the customSeriesChart. We use time for x and group
          //for the series, and bin everything having the same group number, day
          //and climax score.
          var timeDimension = ndx.dimension(function(d) {
            var group = d.group;
            var time = d3.time.format('%Y%m%d').parse(d.time);
            var climax = d.climax;
            return [group, time, climax];
          });

          //Sum the climax scores of every event that adheres to the 'bin' of the
          //dimension
          var climaxSumGroup = timeDimension.group().reduceSum(function(d) {
            return +d.climax;
          });

          //A subChart is needed to assign a symbol per group
          var subChart1 = function(c) {
            var subScatter = dc.scatterPlot(c)
              //Use the global symbol scale to determine the symbol to be used
              .symbol(function(d) {
                return symbolScale(d.key[0]);
              })
              .symbolSize(6)
              .highlightedSize(10)

              //Use the color scheme of the groupRowChart
              .colors(groupRowChart.colors())
              //re-use the custom color accessor from the group chart
              .colorAccessor(function(d) {
                var splitString = d.key[0].split(':');
                var valueApproximation = - (10000 * parseInt(splitString[0]) + 10*splitString[1].charCodeAt(2) + splitString[1].charCodeAt(3));
                return valueApproximation;
              });

            return subScatter;
          };

          //Set up the
          customSeriesChart
            //Sizes in pixels
            .width(parseInt(d3.select('#timeline').style('width'), 10))
            .height(200)
            .margins({
              top: 10,
              right: 10,
              bottom: 20,
              left: 20
            })
            .brushOn(true)
            .clipPadding(10)
            .dimension(timeDimension)
            .group(climaxSumGroup)
            .shareColors(false)

            //A subchart is needed to render the different series as different
            //symbols, it is defined above.
            .chart(subChart1)
            .seriesAccessor(function(d) {
              //Tell dc how to access the data for the series (group)
              return d.key[0];
            })

            //All x Axis stuff
            // .xAxisLabel('time')
            .x(d3.time.scale())
            .elasticX(true)
            .keyAccessor(function(d) {
              //Tell dc how to access the data for the time
              return d.key[1];
            })

            //All y Axis stuff
            .yAxisLabel('climax score sum')
            .y(d3.scale.linear())
            .elasticY(true)
            .renderHorizontalGridLines(true)
            .valueAccessor(function(d) {
              return d.value;
            })

            //A custom filterhandler is needed to make us able to brush
            //horizontally _and_ vertically
            .filterHandler(function(dimension, filter) {
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
              return filter; // set the actual filter value to the new value
            });
          customSeriesChart.render();


          //The customBubbleChart aka timelineChart aka laneChart
          var customBubbleChart = dc.customBubbleChart('#laneChart');

          //The dimension for the customBubbleChart. We use time for x and group for y,
          //and bin everything in the same group number and day.
          var laneTimeDimension = ndx.dimension(function(d) {
            var time = d3.time.format('%Y%m%d').parse(d.time);
            var group = d.group;
            return [group, time];
          });

          //The group for the customBubbleChart. Weneed the climax score to size
          //the bubbles, the rest is for labeling and hover information. We use a
          //custom reduce funtion here to gather all the info we need.
          var laneClimaxGroup = laneTimeDimension.group().reduce(
            //Add something to our temporary collection
            function(p, v) {
              //Climax score summed for all events with the same time(day) and group(number).
              p.climax = p.climax + v.climax;

              //To get the 'main' actor, we cheat and currently only get the first
              //propbank A0 actor listed. We then assign this group's climax score
              //to it and sum that over all events matching this time and group.
              //TODO: fix this
              //1. Get the propbank A0 actors for this event.
              var actor0 = v.actors['pb/A0'];
              var actor0Name;
              if (actor0 === undefined || actor0 === '') {
                //2a. Clean data (fill missing values with 'unknown')
                actor0Name = 'unknown';
              } else {
                //2b. Split the string and get only the last part of it, the rest we
                //consider 'fluff'
                var parts = actor0[0].split('/');
                actor0Name = parts[parts.length-1];
              }
              //3. Sum actor values over all events fitting this time and group.
              if (p.actors[actor0Name] === undefined) {
                p.actors[actor0Name] = v.climax;
              } else {
                p.actors[actor0Name] = p.actors[actor0Name] + v.climax;
              }

              //Sum label values over all events fitting this time and group.
              v.labels.forEach(function(l) {
                if (p.labels[l] === undefined) {
                  p.labels[l] = v.climax;
                } else {
                  p.labels[l] = p.labels[l] + v.climax;
                }
              });

              return p;
            },
            //Remove something from our temporary collection, (basically do
            //everything in the add step, but then in reverse).
            function(p, v) {
              p.climax = p.climax - v.climax;

              var actor0 = v.actors['pb/A0'];
              if (actor0 === undefined || actor0 === '') {
                actor0 = 'unknown';
              }
              var parts = actor0[0].split('/');
              var actor0Name = parts[parts.length-1];
              if (p.actors[actor0Name] === undefined) {
                p.actors[actor0Name] = -v.climax;
              } else {
                p.actors[actor0Name] = p.actors[actor0Name] - v.climax;
              }

              v.labels.forEach(function(l) {
                if (p.labels[l] === undefined) {
                  p.labels[l] = -v.climax;
                } else {
                  p.labels[l] = p.labels[l] - v.climax;
                }
              });

              return p;
            },
            //Set up the inital data structure.
            function() {
              return {climax: 0, actors: {}, labels: {}};
            }
          );

          //The group includes a value which tells us how important the group is
          //in the overall storyline. For this graph, we filter out the groups with
          //an importance value <= 1%
          function filterOnGroupImportance(sourceGroup) {
            return {
              all:function () {
                return sourceGroup.all().filter(function(d) {
                  var groupNum = parseInt(d.key[0].split(':')[0]);
                  return  groupNum > 1;
                });
              },
              top:function(n) {
                return sourceGroup.top(Infinity).filter(function(d) {
                  var groupNum = parseInt(d.key[0].split(':')[0]);
                  return  groupNum > 1;
                }).slice(0,n);
              }
            };
          }
          var filteredLaneClimaxGroup = filterOnGroupImportance(laneClimaxGroup);
          var ordinalGroupScale;

          //Set up the
          customBubbleChart
            //Sizes in pixels
            .width(parseInt(d3.select('#laneChart').style('width'), 10))
            .height(400)
            .margins({
              top: 10,
              right: 0,
              bottom: 20,
              left: 0
            })

            //Bind data
            .dimension(laneTimeDimension)
            .group(filteredLaneClimaxGroup)

            //The time this chart takes to do its animations.
            .transitionDuration(1500)

            //x Axis
            // .xAxisLabel('time')
            .x(d3.time.scale())
            .elasticX(true)
            .xAxisPadding(100)
            .keyAccessor(function(p) {
              //The time of this event
              return p.key[1];
            })

            //y Axis
            // .yAxisLabel('group')
            .y(ordinalGroupScale = d3.scale.ordinal().domain((function() {
              //Because we use an ordinal scale here, we have to tell the chart
              //which values to expect.
              var domain = filteredLaneClimaxGroup.all().map(function(d) {
                //The group of this event
                return(d.key[0]);
              });
              return domain;
            })()).copy()
            )
            .valueAccessor(function(p) {
              //The group of this event
              return p.key[0];
            })

            //Radius of the bubble
            .r(d3.scale.linear().domain(
              //We assume a climax value in the domain [ 0 , n ]
              [0, d3.max(customBubbleChart.data(), function (e) {
                    return e.value.climax;
                  })]))
            .radiusValueAccessor(function(p) {
              return p.value.climax;
            })
            .minRadius(2)
            .maxBubbleRelativeSize(0.015)

            //Everything related to coloring the bubbles
            .colors(colorbrewer.RdYlGn[9])
            // We currently color the bubble using the same values as the radius
            .colorDomain(
              [0, d3.max(customBubbleChart.data(), function (e) {
                return e.value.climax;
              })])
            .colorAccessor(function(d) {
              return d.value.climax;
            })

            //Labels printed just above the bubbles
            .renderLabel(true)
            .minRadiusWithLabel(0)
            .label(function(p) {
              var mostImportantLabel;
              var climaxScoreOfMostImportantLabel = -1;
              //Get the most important label (highest climax score)
              var labels = Object.keys(p.value.labels);
              labels.forEach(function(l) {
                if (p.value.labels[l] > climaxScoreOfMostImportantLabel) {
                  mostImportantLabel = l;
                  climaxScoreOfMostImportantLabel = p.value.labels[l];
                }
              });
              return mostImportantLabel.toString(); //p.key;
            })

            //Information on hover
            .renderTitle(true)
            .title(function(p) {
              //Get the most important actor (highest climax score)
              var mostImportantActor = '';
              var climaxScoreOfMostImportantActor = -1;
              var actors = Object.keys(p.value.actors);
              actors.forEach(function(a) {
                if (p.value.actors[a] > climaxScoreOfMostImportantActor) {
                  mostImportantActor = a;
                  climaxScoreOfMostImportantActor = p.value.actors[a];
                }
              });

              //List all individual labels and their climax scores
              var labels = Object.keys(p.value.labels);
              var labelString = '';
              labels.forEach(function(l) {
                labelString += p.value.labels[l] + ' : ' + l.toString() + '\n';
              });
              return p.key[1] + '\n' + 'Group:'+ p.key[0] + '\n' + labelString +  mostImportantActor + '\n' + 'Climax: ' + p.value.climax;
            });

          //A hack to make the customBubbleChart filter out 0-value bubbles while determining the x-axis range
          dc.override(customBubbleChart, 'xAxisMin', function() {
            var min = d3.min(customBubbleChart.data(), function (e) {
              if (customBubbleChart.radiusValueAccessor()(e) > 0) {
                return customBubbleChart.keyAccessor()(e);
              }
            });
            return dc.utils.subtract(min, customBubbleChart.xAxisPadding());
          });

          dc.override(customBubbleChart, 'xAxisMax', function() {
            var max = d3.max(customBubbleChart.data(), function (e) {
              if (customBubbleChart.radiusValueAccessor()(e) > 0) {
                return customBubbleChart.keyAccessor()(e);
              }
            });
            return dc.utils.add(max, customBubbleChart.xAxisPadding());
          });

          //A hack to make the bubbleChart accept ordinal values on the y Axis
          dc.override(customBubbleChart, '_prepareYAxis', function(g) {
            this.__prepareYAxis(g);
            this.y().rangeBands([this.yAxisHeight(), 0], 0, 1);
          });

          customBubbleChart.render();


          //A rowChart that shows us the importance of the propbank A0 actors
          var actorA0rowChart = dc.rowChart('#rowchart_firstAction');

          var actorA0Dimension = ndx.dimension(function(d) {
            //1. Get the propbank A0 actors for this event.
            var actor0 = d.actors['pb/A0'];
            var actor0Names = [];
            if (actor0 === undefined || actor0 === '') {
              //2a. Clean data (fill missing values with 'unknown')
              actor0Names = ['unknown'];
            } else {
              actor0.forEach(function(a) {
                //2b. Split the string and get only the last part of it, the rest we
                //consider 'fluff'
                var parts = a.split('/');
                actor0Names.push(parts[parts.length-1]);
              });
            }
            return actor0Names;
          });

          var climaxSumPerActorA0 = actorA0Dimension.group().reduceSum(function(d) {
            return +d.climax;
          });

          // var fakeClimaxSumPerActorA0 = {
          //   all: function() {
          //     var hash = climaxSumPerActorA0.value();
          //     var result = [];
          //     for (var kv in hash) {
          //       result.push({
          //         key: kv,
          //         value: hash[kv]
          //       });
          //     }
          //     return result;
          //   }
          // };

          //Set up the
          actorA0rowChart
            //Size in pixels
            .width(parseInt(d3.select('#rowchart_firstAction').style('width'), 10))
            .height(480)

            //Bind data
            .dimension(actorA0Dimension)
            .group(climaxSumPerActorA0)

            //The x Axis
            .x(d3.scale.linear())
            .elasticX(true)

            //We use this custom data and ordering functions to sort the data and
            //limit to the top 20 (in climax scores)
            .data(function(d) {
              return d.order(function(d) {
                return d;
              }).top(20);
            })
            .ordering(function(d) {
              return -d;
            });

          // actorA0rowChart.on('renderlet', textRenderlet);
          actorA0rowChart.render();


          //A rowChart that shows us the importance of the propbank A1 actors
          var actorA1rowChart = dc.rowChart('#rowchart_secondAction');

          //In defining this dimension, we cheat a little by only pulling the
          //first A1 actor. TODO: fix this
          var actorA1Dimension = ndx.dimension(function(d) {
            //1. Get the propbank A0 actors for this event.
            var actor1 = d.actors['pb/A1'];
            var actor1Name;
            if (actor1 === undefined || actor1 === '') {
              //2a. Clean data (fill missing values with 'unknown')
              actor1Name = 'unknown';
            } else {
              //2b. Split the string and get only the last part of it, the rest we
              //consider 'fluff'
              var parts = actor1[0].split('/');
              actor1Name = parts[parts.length-1];
            }
            return actor1Name;
          });

          //Reduce (bin) over the dimension and sum the climax scores
          var climaxSumPerActorA1 = actorA1Dimension.group().reduceSum(function(d) {
            return +d.climax;
          });
          // var countPerActorA1 = actorA1Dimension.group();

          actorA1rowChart
            //Size in pixels
            .width(parseInt(d3.select('#rowchart_secondAction').style('width'), 10))
            .height(480)

            //Bind data
            .dimension(actorA1Dimension)
            .group(climaxSumPerActorA1)

            //The x Axis
            .x(d3.scale.linear())
            .elasticX(true)

            //We use this custom data and ordering functions to sort the data and
            //limit to the top 20 (in climax scores)
            .data(function(d) {
              return d.order(function(d) {
                return d;
              }).top(20);
            })
            .ordering(function(d) {
              return -d;
            });

          // actorA1rowChart.on('renderlet', textRenderlet);
          actorA1rowChart.render();

          //Now, build a table with the filtered results
          var dataTable = dc.dataTable('#dataTable');

          //These parameters should make for fairly unique events
          var idDimension = ndx.dimension(function(d) {
            return [d.group, d.time, d.labels];
          });

          //Set up the
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
        }
      );
    }

    readData('data/airbus_contextual.timeline.json');
  }

  angular.module('uncertApp.punchcard').controller('PunchcardController', PunchcardController);
})();
