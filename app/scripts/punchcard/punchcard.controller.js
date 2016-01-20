(function() {
  'use strict';

  function PunchcardController(DataService, d3, dc, crossfilter, colorbrewer) {
    //Helper function to get unique elements of an array
    var arrayUnique = function(a) {
        return a.reduce(function(p, c) {
            if (p.indexOf(c) < 0) {
              p.push(c);
            }
            return p;
        }, []);
    };

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

    var findMine = function(sources, uri) {
      var result;
      sources.forEach(function(source) {
        if (source.uri.localeCompare(uri) === 0) {
          result = source;
        }
      });
      return result;
    };

    var mentionToHtml = function(d, sources) {
      var result = [];
      var raw = d.mentions;
      raw.forEach(function(mention) {
        var uri = mention.uri[0];
        if (mention.uri[1] !== undefined) {
          console.log('unparsed mention here');
        }
        var charStart = parseInt(mention.char[0]);
        var charEnd = parseInt(mention.char[1]);

        var found = findMine(sources, uri);

        // var meta = raw[i+1].split('=');
        // var sentence = meta[meta.length-1];
        result.push({
          charStart:charStart,
          charEnd:charEnd,
          text:found.text
        });
      });
      var html = '';
      result.forEach(function(phrase) {
        var pre = phrase.text.substring(phrase.charStart-30,phrase.charStart);
        var word = phrase.text.substring(phrase.charStart, phrase.charEnd);
        var post = phrase.text.substring(phrase.charEnd ,phrase.charEnd+30);

        html += pre + '<span class=\'highlighted-mention\'>'+word+'</span>' + post + '</BR>\n';
      });
      return html;

    };

    var mentionToTxt = function(d, sources) {
      var result = [];
      var raw = d.mentions;
      raw.forEach(function(mention) {
        var uri = mention.uri[0];
        if (mention.uri[1] !== undefined) {
          console.log('unparsed mention here');
        }
        var charStart = parseInt(mention.char[0]);
        var charEnd = parseInt(mention.char[1]);

        var found = findMine(sources, uri);

        // var meta = raw[i+1].split('=');
        // var sentence = meta[meta.length-1];
        result.push({
          charStart:charStart,
          charEnd:charEnd,
          text:found.text
        });
      });
      var txt = '';
      result.forEach(function(phrase) {
        var pre = phrase.text.substring(phrase.charStart-30,phrase.charStart);
        var word = phrase.text.substring(phrase.charStart, phrase.charEnd);
        var post = phrase.text.substring(phrase.charEnd ,phrase.charEnd+30);

        txt += pre + word + post + '\n';
      });
      return txt;
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
            return 'translate(' + d3.select(this.parentNode).select('rect')[0][0].getAttribute('height')/4 + ',' + d3.select(this.parentNode).select('rect')[0][0].getAttribute('height')/4 + ')';
          })
          //Determine the symbol from the data. Use the same symbol scale as the
          //series chart
          .attr('d', function(d) {
            var symbol = d3.svg.symbol();
            symbol.size(d3.select(this.parentNode).select('rect')[0][0].getAttribute('height'));
            symbol.type(symbolScale(d.key));
            return symbol();
          });

        //Reposition the rectangles to make room for the symbol
        d3.select(this).select('rect')
          .attr('transform', function() {
            return 'translate(' + d3.select(this.parentNode).select('rect')[0][0].getAttribute('height')/2 + ',' + 0 + ')';
          });
      });
    };

    function allPossibleCases(array) {
      if (array.length === 1) {
        return [array[0]];
      } else {
        var result = [];
        result.push(array);

        var theRest = allPossibleCases(array.slice(1));
        if (theRest.length === 1) {
          result.push(array[0]);
        } else {
          for (var i = 0; i < theRest.length; i++) {
            for (var j = 0; j < array.length; j++) {
              result.push([array[j], theRest[i]]);
              result.push([theRest[i], array[j]]);
            }
          }
        }

        return result;
      }
    }

    this.readData = function() {
      //We use d3 to read our JSON file
      var data = DataService.getData();
        // function(error, data) {
        //   if (error) {
        //     console.log(error);
        //   }

          // var actors = data.timeline.actors;

          //Crossfilter initialization
          var events = data.timeline.events;
          var sources = data.timeline.sources;
          var ndx = crossfilter(events);
          // var all = ndx.groupAll();
          //


          //A rowChart that shows us the importance of the all actors
          var allActorChart = dc.rowChart('#rowchart_allActors');

          //Dimension of the list of unique actors present in each event.
          var allActorsDimension = ndx.dimension(function(d) {
            var concatenatedActors = [];

            var keys = Object.keys(d.actors);
            keys.forEach(function (key) {
              var keysActors = d.actors[key];
              keysActors.forEach(function(keysActor) {
                var splitString = keysActor.split(':');
                var category = splitString[0];
                var entity = splitString[1];
                if (category === 'nwr-non-entities' || category === 'ne') {
                  // concatenatedActors.push(category);
                } else {
                  concatenatedActors.push(category + ':' + entity);
                }

              });
            });
            var uniqueActors = arrayUnique(concatenatedActors);

            return uniqueActors;
          });

          //Custom reduce functions to split events up with multiple keys
          function reduceAdd(p, v) {
            var keys = Object.keys(v.actors);
            keys.forEach (function(key) {
              var actors = v.actors[key];
              actors.forEach(function (actor) {
                var splitString = actor.split(':');
                var category = splitString[0];
                if (category === 'nwr-non-entities' || category === 'ne') {

                } else {
                  p[actor] = (p[actor] || 0) + 1;
                }
              });
            });
            return p;
          }

          function reduceRemove(p, v) {
            var keys = Object.keys(v.actors);
            keys.forEach (function(key) {
              var actors = v.actors[key];
              actors.forEach(function (actor) {
                var splitString = actor.split(':');
                var category = splitString[0];
                if (category === 'nwr-non-entities' || category === 'ne') {

                } else {
                  p[actor] = (p[actor] || 0) - 1;
                }
              });
            });
            return p;
          }

          function reduceInitial() {
            return {};
          }

          //Apply custom reduce
          var allActorsClimaxSum = allActorsDimension.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();

          //Hack to add the all and top functions again
          allActorsClimaxSum.all = function() {
            var newObject = [];
            for (var key in this) {
              if (this.hasOwnProperty(key) && key !== 'all' && key !== 'top' && key !== 'order') {
                newObject.push({
                  key: key,
                  value: this[key]
                });
              }
            }
            return newObject;
          };
          allActorsClimaxSum.top = function(n) {
            var newObject = this.all().sort(function(a, b) {
              return b.value - a.value;
            }).slice(0,n);

            return newObject;
          };

          //Set up the
          allActorChart
            //Size in pixels
            .width(parseInt(d3.select('#rowchart_allActors').style('width'), 10))
            .height(400)
            .margins({
              top: 10,
              right: 0,
              bottom: 20,
              left: 0
            })

            //Bind data
            .dimension(allActorsDimension)
            .keyAccessor(function (d) {
              return d.key;
            })
            .group(allActorsClimaxSum)
            .valueAccessor(function (d) {
              return d.value;
            })

            //The x Axis
            .x(d3.scale.linear())
            .elasticX(true)

            .filterHandler(function(dimension, filters) {
              // var newFilters = [];

              dimension.filter(null);
              if (filters.length === 0) {
                dimension.filter(null);
              } else {
                dimension.filter(function(d) {
                  var result = true;
                  if (allActorChart.filters() !== null) {
                    var currentFilters = allActorChart.filters();
                    currentFilters.forEach(function(f) {
                      if (d.indexOf(f) < 0) {
                        result = false;
                      }
                    });
                  }
                  return result;
                });
              }
              return filters;
            })

            .xAxis().tickValues([]);

          allActorChart.render();


          //The row Chart which shows how important the groups are in terms of climax scores
          var subwayChart = dc.subwayChart('#subwayChart');

          //The dimension for the subwayChart. We use time for x and group for y,
          //and bin everything in the same group number and day.

          //Dimension of the list of unique actors present in each event.
          var subwayDimension = ndx.dimension(function(d) {
            var time = d3.time.format('%Y%m%d').parse(d.time);

            var concatenatedActors = [];

            var keys = Object.keys(d.actors);
            keys.forEach(function (key) {
              var keysActors = d.actors[key];
              keysActors.forEach(function(keysActor) {
                var splitString = keysActor.split(':');
                var category = splitString[0];
                var entity = splitString[1];
                if (category === 'nwr-non-entities' || category === 'ne') {
                  // concatenatedActors.push(category);
                } else {
                  concatenatedActors.push(category + ':' + entity);
                }

              });
            });
            var uniqueActors = arrayUnique(concatenatedActors);

            return [time, uniqueActors];
          });

          var subwayGroup = subwayDimension.group().reduce(
            //Add something to our temporary collection
            function(p, v) {
              //Climax score summed for all events with the same time(day) and group(number).
              p.count = p.count + 1;

              //Sum label values over all events fitting this time and group.
              v.labels.forEach(function(l) {
                p.labels[l] = (p.labels[l] || 0) + p.count;
              });

              //Push mentions over all events fitting this time and group.
              v.mentions.forEach(function(m) {
                p.mentions.push(m);
              });

              return p;
            },
            //Remove something from our temporary collection, (basically do
            //everything in the add step, but then in reverse).
            function(p, v) {
              p.count = p.count - 1;

              v.labels.forEach(function(l) {
                p.labels[l] = (p.labels[l] || 0) - p.count;
              });

              //Push mentions over all events fitting this time and group.
              v.mentions.forEach(function(m) {
                p.mentions.pop(m);
              });

              return p;
            },
            //Set up the inital data structure.
            function() {
              return {count: 0, labels: {}, mentions:[]};
            }
          );

          var uniqueActors = [];
          subwayGroup.all().map(function(d) {
            d.key[1].forEach(function (key) {
              if (uniqueActors.indexOf(key) < 0) {
                uniqueActors.push(key);
              }
            });
          });

          //Set up the
          subwayChart
            //Sizes in pixels
            .width(parseInt(d3.select('#subwayChart').style('width'), 10))
            .height(400)
            .margins({
              top: 10,
              right: 0,
              bottom: 20,
              left: 150
            })

            //Bind data
            .dimension(subwayDimension)
            .group(subwayGroup)

            //The time this chart takes to do its animations.
            .transitionDuration(1500)

            //x Axis
            // .xAxisLabel('time')
            .x(d3.time.scale())
            .elasticX(true)
            .xAxisPadding(100)
            .keyAccessor(function(p) {
              //The time of this event
              return p.key[0];
            })

            //y Axis
            // .yAxisLabel('group')
            .y(d3.scale.ordinal()
              .domain((function() {
                return uniqueActors;
              })())
            )
            .valueAccessor(function(p) {
              return p.key[1];
            })

            //Radius of the bubble
            .r(d3.scale.linear())
            .elasticRadius(true)
            .radiusValueAccessor(function(p) {
              if (p.value.count >0) {
                return p.key[1].length;
              } else {
                return 0;
              }
            })
            .minRadius(5)
            .maxBubbleRelativeSize(0.015)

            //Labels printed just above the bubbles
            .renderLabel(true)
            .minRadiusWithLabel(0)
            .label(function(p) {
              var mostImportantLabel;
              var scoreOfMostImportantLabel = -1;
              //Get the most important label (highest climax score)
              var labels = Object.keys(p.value.labels);
              labels.forEach(function(l) {
                if (p.value.labels[l] > scoreOfMostImportantLabel) {
                  mostImportantLabel = l;
                  scoreOfMostImportantLabel = p.value.labels[l];
                }
              });
              return mostImportantLabel.toString(); //p.key;
            })

            //Information on hover
            .renderTitle(true)
            .title(function(p) {
              var formattedTime = p.key[0].getDay() + '/' + p.key[0].getMonth() + '/' + p.key[0].getFullYear();

              //Get the actors
              var actors = p.key[1];
              var actorString = '';
              actors.forEach(function(a) {
                actorString += a + '\n';
              });

              var labelString = '';
              var labels = Object.keys(p.value.labels);
              labels.forEach(function(l) {
                labelString += l + '\n';
              });

              var titleString = '\n---Actors-------\n' +
                                actorString +
                                '\n---Labels-------\n' +
                                labelString +
                                '\n---Mentions-----\n' +
                                mentionToTxt(p.value, sources);
              return titleString;
            });

          //A hack to make the customBubbleChart filter out 0-value bubbles while determining the x-axis range
          dc.override(subwayChart, 'xAxisMin', function() {
            var min = d3.min(subwayChart.data(), function (e) {
              if (subwayChart.radiusValueAccessor()(e) > 0) {
                return subwayChart.keyAccessor()(e);
              }
            });
            return dc.utils.subtract(min, subwayChart.xAxisPadding());
          });

          dc.override(subwayChart, 'xAxisMax', function() {
            var max = d3.max(subwayChart.data(), function (e) {
              if (subwayChart.radiusValueAccessor()(e) > 0) {
                return subwayChart.keyAccessor()(e);
              }
            });
            return dc.utils.add(max, subwayChart.xAxisPadding());
          });

          //A hack to make the bubbleChart accept ordinal values on the y Axis
          dc.override(subwayChart, '_prepareYAxis', function(g) {
            this.__prepareYAxis(g);
            this.y().rangeBands([this.yAxisHeight(), 0], 0, 1);
          });

          dc.override(subwayChart, 'fadeDeselectedArea', function() {
            if (subwayChart.hasFilter()) {
              subwayChart.selectAll('g.' + subwayChart.BUBBLE_NODE_CLASS).each(function(d) {
                if (subwayChart.isSelectedNode(d)) {
                  subwayChart.highlightSelected(this);
                } else {
                  subwayChart.fadeDeselected(this);
                }
              });

              // subwayChart.selectAll('g.subway-line').each(function(d) {
              //   if (subwayChart.hasFilter(d.lineID)) {
              //     subwayChart.highlightSelected(this);
              //   } else {
              //     subwayChart.fadeDeselected(this);
              //   }
              // });
            } else {
              subwayChart.selectAll('g.' + subwayChart.BUBBLE_NODE_CLASS).each(function() {
                subwayChart.resetHighlight(this);
              });
            }
          });

          subwayChart.render();












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

              var keys = Object.keys(v.actors);
              keys.forEach(function (key) {
                var keysActors = v.actors[key];
                keysActors.forEach(function(keysActor) {
                  var actorLabel = key + ' : ' + keysActor;
                  p.actors[actorLabel] = (p.actors[actorLabel] || 0) + v.climax;
                });
              });

              //Sum event values over all events fitting this time and group.
              p.events[v.event] = (p.events[v.event] || 0) + v.climax;

              //Sum label values over all events fitting this time and group.
              v.labels.forEach(function(l) {
                p.labels[l] = (p.labels[l] || 0) + v.climax;
              });

              return p;
            },
            //Remove something from our temporary collection, (basically do
            //everything in the add step, but then in reverse).
            function(p, v) {
              p.climax = p.climax - v.climax;

              var keys = Object.keys(v.actors);
              keys.forEach(function (key) {
                var keysActors = v.actors[key];
                keysActors.forEach(function(keysActor) {
                  var actorLabel = key + ' : ' + keysActor;
                  p.actors[actorLabel] = (p.actors[actorLabel] || 0) - v.climax;
                });
              });

              p.events[v.event] = (p.events[v.event] || 0) - v.climax;

              v.labels.forEach(function(l) {
                p.labels[l] = (p.labels[l] || 0) - v.climax;
              });

              return p;
            },
            //Set up the inital data structure.
            function() {
              return {climax: 0, events: {}, actors: {}, labels: {}};
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
            })()).copy())
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
              var formattedTime = p.key[1].getDay() + '/' + p.key[1].getMonth() + '/' + p.key[1].getFullYear();

              //Get the events
              var events = Object.keys(p.value.events);
              var eventString = '';
              events.forEach(function(e) {
                eventString += p.value.events[e] + ' : ' + e.toString() + '\n';
              });

              //Get the actors
              var actors = Object.keys(p.value.actors);
              var actorString = '';
              actors.forEach(function(a) {
                actorString += p.value.actors[a] + ' : ' + a.toString() + '\n';
              });

              //List all individual labels and their climax scores
              var labels = Object.keys(p.value.labels);
              var labelString = '';
              labels.forEach(function(l) {
                labelString += p.value.labels[l] + ' : ' + l.toString() + '\n';
              });

              var titleString =
                                '\n-----Labels-----\n' +
                                labelString +
                                '\n-----Actors-----\n' +
                                actorString +
                                '\n-----Time-------\n' +
                                formattedTime +
                                '\n-----Group------\n' +
                                p.key[0];
              return titleString;
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
              { label:'GroupName',
                format: function(d) {
                  return d.groupName;
                }
              },
              { label:'Time',
                format: function(d) {
                  var time = d3.time.format('%Y%m%d').parse(d.time);
                  return time.getDay() + '/' + time.getMonth() + '/' + time.getFullYear();
                }
              },
              { label:'Climax Score',
                format: function(d) {
                  return d.climax;
                }
              },
              { label:'Mentions',
                format: function(d) {
                  return mentionToHtml(d, sources);
                }
              },
              { label:'Labels',
                format: function(d) {
                  return d.labels;
                }
              }
            ]);
          dataTable.render();
        // }
      // );
    };

    DataService.ready.then(this.readData);
    // readData('data/contextual.timeline10-12-eso.json');
  }

  angular.module('uncertApp.punchcard').controller('PunchcardController', PunchcardController);
})();
