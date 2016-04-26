(function() {
  'use strict';

  function PerspectiveLaneChartController($element, d3, dc, colorbrewer, NdxService, HelperFunctions, Messagebus) {
    this.initializeChart = function() {
      var customBubbleChart = dc.bubbleChart('#'+$element[0].children[0].attributes.id.value);

      //The dimension for the customBubbleChart. We use time for x and group for y,
      //and bin everything in the same group number and day.
      var laneTimeDimension = NdxService.buildDimension(function(d) {
        var time = d3.time.format('%Y%m%d').parse(d.time);
        return [time, d.mentions.length];
      });

      //The group for the customBubbleChart. Weneed the climax score to size
      //the bubbles, the rest is for labeling and hover information. We use a
      //custom reduce funtion here to gather all the info we need.
      var laneClimaxGroup = laneTimeDimension.group().reduce(
        //Add something to our temporary collection
        function(p, v) {
          var keys = Object.keys(v.mentions);
          keys.forEach(function(key) {
            var mention = v.mentions[key];
            if (mention.perspective) {
              var source = mention.perspective.source;
              var attribution = mention.perspective.attribution;

              p.sources.push(source);
              p.attribution[source] = attribution;
            }
          });

          // //Sum event values over all events fitting this time and group.
          // p.events[v.event] = (p.events[v.event] || 0) + v.climax;
          //
          // //Sum label values over all events fitting this time and group.
          // if (v.labels) {
          //   v.labels.forEach(function(l) {
          //     p.labels[l] = (p.labels[l] || 0) + 1;
          //   });
          // } else {
          //   p.labels.none = (p.labels.none || 0) + 1;
          // }

          return p;
        },
        //Remove something from our temporary collection, (basically do
        //everything in the add step, but then in reverse).
        function(p, v) {
          var keys = Object.keys(v.mentions);
          keys.forEach(function(key) {
            var mention = v.mentions[key];
            if (mention.perspective) {
              var source = mention.perspective.source;
              var attribution = mention.perspective.attribution;

              p.sources.pop(source);
              p.attribution[source] = attribution;
            }
          });

          return p;
        },
        //Set up the inital data structure.
        function() {
          return {
            sources: [],
            // source: {},
            attribution: {}
          };
        }
      );

      //The group includes a value which tells us how important the group is
      //in the overall storyline. For this graph, we filter out the groups with
      //an importance value <= 1%
      // function filterOnGroupImportance(sourceGroup) {
      //   return {
      //     all: function() {
      //       return sourceGroup.all().filter(function(d) {
      //         var groupNum = parseInt(d.key[0].split(':')[0]);
      //         return groupNum > 1;
      //       });
      //     },
      //     top: function(n) {
      //       return sourceGroup.top(Infinity).filter(function(d) {
      //         var groupNum = parseInt(d.key[0].split(':')[0]);
      //         return groupNum > 1;
      //       }).slice(0, n);
      //     }
      //   };
      // }
      // var filteredLaneClimaxGroup = filterOnGroupImportance(laneClimaxGroup);
      var ordinalGroupScale;

      //Set up the
      customBubbleChart
      //Sizes in pixels
        .width(parseInt($element[0].getClientRects()[1].width, 10))
        .height(400)
        .margins({
          top: 10,
          right: 10,
          bottom: 20,
          left: 20
        })
      .clipPadding(10)

      //Bind data
      .dimension(laneTimeDimension)
      .group(laneClimaxGroup)

      .filterHandler(function(dimension, filters) {
        Messagebus.publish('newFilterEvent', [this, filters, dimension]);

        dimension.filter(null);
        if (filters.length === 0) {
          dimension.filter(null);
        } else {
          dimension.filterFunction(function(d) {
            for (var i = 0; i < filters.length; i++) {
              var filter = filters[i];
              if (filter.isFiltered && filter.isFiltered(d)) {
                return true;
              } else if (filter <= d && filter >= d) {
                return true;
              }
            }
            return false;
          });
        }
        return filters;
      }.bind(customBubbleChart))

      //The time this chart takes to do its animations.
      .transitionDuration(1500)

      //x Axis
      // .xAxisLabel('time')
      .x(d3.time.scale())
        .elasticX(true)
        .renderHorizontalGridLines(true)
        // .xAxisPadding(10)
        .keyAccessor(function(p) {
          //The time of this event
          return p.key[0];
        })

      //y Axis
      .yAxisLabel('Number of Mentions')
      // .y(ordinalGroupScale = d3.scale.ordinal().domain((function() {
      //     //Because we use an ordinal scale here, we have to tell the chart
      //     //which values to expect.
      //     var domain = laneClimaxGroup.all().map(function(d) {
      //       //The group of this event
      //       return (d.key[1]);
      //     });
      //     return domain;
      //   })()).copy())
      .elasticY(true)
      .valueAccessor(function(p) {
        //The group of this event
        return p.key[1];
      })

      .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))

      //Radius of the bubble
      .r(d3.scale.linear().domain(
          [0, d3.max(customBubbleChart.data(), function(e) {
            return e.value.sources.length;
          })]))
        .radiusValueAccessor(function(p) {
          return p.value.sources.length;
        })
        .minRadius(2)
        .maxBubbleRelativeSize(0.015)

      //Everything related to coloring the bubbles
      .colors(colorbrewer.RdYlGn[9])
        // We currently color the bubble using the same values as the radius
        .colorDomain(
          [0, 1])
        .colorAccessor(function(p) {
          var confirmation = 0;
          var denial = 0;
          var uncertain = 0;
          var entries = Object.keys(p.value.attribution).length;

          Object.keys(p.value.attribution).forEach(function(key) {
            if (p.value.attribution[key].indexOf('Confirm') > 0) {
              confirmation += 1;
            } else if (p.value.attribution[key].indexOf('Denial') > 0) {
              denial += 1;
            } else {
              uncertain += 1;
            }
          });

          var result = 0;
          if (entries === 0) {
            result =  0;
          } else {
            result = 0.5 + 0.5*(confirmation / entries) - 0.5*(denial / entries);
          }
          return result;
        })

      //Labels printed just above the bubbles
      .renderLabel(false);
        // .minRadiusWithLabel(0)
        // .label(function(p) {
        //   return '';
        // })

      //Information on hover
      // .renderTitle(true)
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
      // dc.override(customBubbleChart, '_prepareYAxis', function(g) {
      //   this.__prepareYAxis(g);
      //   this.y().rangeBands([this.yAxisHeight(), 0], 0, 1);
      // });


      // dc.override(customBubbleChart, 'onClick', onClickOverride);
      customBubbleChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.perspectivelanechart').controller('PerspectiveLaneChartController', PerspectiveLaneChartController);
})();
