(function() {
  'use strict';

  function PollLaneChartController($element, d3, dc, colorbrewer, NdxService, HelperFunctions, Messagebus) {
    this.initializeChart = function() {
      var customBubbleChart = dc.customBubbleChart('#'+$element[0].children[0].attributes.id.value);
      var timeMin = undefined;
      var timeMax = undefined;

      //The dimension for the customBubbleChart. We use time for x and group for y,
      //and bin everything in the same group number and day.
      var laneTimeDimension = NdxService.pollDimension(function(d) {
        var time = d3.time.format('%Y%m%d').parse(d.time);

        if (timeMin && timeMax) {
          if (time < timeMin) {
            timeMin = time;
          }
          if (time > timeMax) {
            timeMax = time;
          }
        } else {
          timeMin = time;
          timeMax = time;
        }

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


          return p;
        },
        //Remove something from our temporary collection, (basically do
        //everything in the add step, but then in reverse).
        function(p, v) {
          p.climax = p.climax - v.climax;


          return p;
        },
        //Set up the inital data structure.
        function() {
          return {
            climax: 0,
            events: {},
            actors: {},
            labels: {}
          };
        }
      );

      //The group includes a value which tells us how important the group is
      //in the overall storyline. For this graph, we filter out the groups with
      //an importance value <= 1%
      function filterOnGroupImportance(sourceGroup) {
        return {
          all: function() {
            return sourceGroup.all().filter(function(d) {
              var groupNum = parseInt(d.key[0].split(':')[0]);
              return groupNum > 1;
            });
          },
          top: function(n) {
            return sourceGroup.top(Infinity).filter(function(d) {
              var groupNum = parseInt(d.key[0].split(':')[0]);
              return groupNum > 1;
            }).slice(0, n);
          }
        };
      }
      var filteredLaneClimaxGroup = filterOnGroupImportance(laneClimaxGroup);
      var ordinalGroupScale;

      //Set up the
      customBubbleChart
      //Sizes in pixels
        .width(parseInt($element[0].getClientRects()[1].width, 10))
        .height(100)
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
      .x(d3.time.scale().domain([timeMin, timeMax]))
        // .elasticX(true)
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
            return (d.key[0]);
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
          [0, d3.max(customBubbleChart.data(), function(e) {
            return e.value.climax;
          })]))
        .radiusValueAccessor(function(p) {
          return p.value.climax;
        })
        .minRadius(1)
        .maxBubbleRelativeSize(0.01)

      //Everything related to coloring the bubbles
      .colors(colorbrewer.RdYlGn[9])
        // We currently color the bubble using the same values as the radius
        .colorDomain(
          [0, d3.max(customBubbleChart.data(), function(e) {
            return e.value.climax;
          })])
        .colorAccessor(function(d) {
          return d.value.climax;
        })

      //Labels printed just above the bubbles
      .renderLabel(false)
      //   .minRadiusWithLabel(0)
      //   .label(function(p) {
      //     var mostImportantLabel;
      //     var climaxScoreOfMostImportantLabel = -1;
      //     //Get the most important label (highest climax score)
      //     var labels = Object.keys(p.value.labels);
      //     labels.forEach(function(l) {
      //       if (p.value.labels[l] > climaxScoreOfMostImportantLabel) {
      //         mostImportantLabel = l;
      //         climaxScoreOfMostImportantLabel = p.value.labels[l];
      //       }
      //     });
      //     return mostImportantLabel.toString(); //p.key;
      //   })

      //Information on hover
      .renderTitle(false)
      //   .title(function(p) {
      //     var formattedTime = p.key[1].getDay() + '/' + p.key[1].getMonth() + '/' + p.key[1].getFullYear();
      //
      //     //Get the events
      //     var events = Object.keys(p.value.events);
      //     var eventString = '';
      //     events.forEach(function(e) {
      //       eventString += p.value.events[e] + ' : ' + e.toString() + '\n';
      //     });
      //
      //     //Get the actors
      //     var actors = Object.keys(p.value.actors);
      //     var actorString = '';
      //     actors.forEach(function(a) {
      //       actorString += p.value.actors[a] + ' : ' + a.toString() + '\n';
      //     });
      //
      //     //List all individual labels and their climax scores
      //     var labels = Object.keys(p.value.labels);
      //     var labelString = '';
      //     labels.forEach(function(l) {
      //       labelString += p.value.labels[l] + ' : ' + l.toString() + '\n';
      //     });
      //
      //     var titleString =
      //       '\n-----Labels-----\n' +
      //       labelString +
      //       '\n-----Actors-----\n' +
      //       actorString +
      //       '\n-----Time-------\n' +
      //       formattedTime +
      //       '\n-----Group------\n' +
      //       p.key[0];
      //     return titleString;
      //   });

      //A hack to make the customBubbleChart filter out 0-value bubbles while determining the x-axis range
      dc.override(customBubbleChart, 'xAxisMin', function() {
        var min = d3.min(customBubbleChart.data(), function(e) {
          if (customBubbleChart.radiusValueAccessor()(e) > 0) {
            return customBubbleChart.keyAccessor()(e);
          }
        });
        return dc.utils.subtract(min, customBubbleChart.xAxisPadding());
      });

      dc.override(customBubbleChart, 'xAxisMax', function() {
        var max = d3.max(customBubbleChart.data(), function(e) {
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

      dc.override(customBubbleChart, 'onClick', function(d) {
      });

      // dc.override(customBubbleChart, 'onClick', onClickOverride);
      customBubbleChart.render();

      Messagebus.subscribe('newFilterEvent', function(event, filterData) {
        var minDate;
        var maxDate;

        if (filterData.filters) {
          filterData[0].filters().forEach(function(f) {
            if (f.filterType === 'RangedTwoDimensionalFilter') {
              minDate = f[0][0];
              maxDate = f[1][0];
            }
          });
        }


        if (minDate && maxDate) {
          customBubbleChart.x(d3.time.scale().domain([minDate, maxDate]));
        } else {
          customBubbleChart.x(d3.time.scale().domain([timeMin, timeMax]));
        }

      });
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.polllanechart').controller('PollLaneChartController', PollLaneChartController);
})();
