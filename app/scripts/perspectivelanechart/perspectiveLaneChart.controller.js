(function() {
  'use strict';

  function PerspectiveLaneChartController($element, d3, dc, colorbrewer, NdxService, HelperFunctions, Messagebus) {
    this.initializeChart = function() {
      var customBubbleChart = dc.dyndomBubbleChart('#'+$element[0].children[0].attributes.id.value);

      //The dimension for the customBubbleChart. We use time for x and group for y,
      //and bin everything in the same group number and day.
      var laneTimeDimension = NdxService.buildDimension(function(d) {
        var time = d3.time.format('%Y%m%d').parse(d.time);

        return [time, HelperFunctions.determineUniqueSources(d)];
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

            mention.perspective.forEach(function(perspective) {
              var attribution = perspective.attribution;
              var source = perspective.source;
              p.source = source;

              // var splitSource = perspective.source.split(':');
              // if (splitSource[0] === 'cite') {
                p.perspectives = (p.perspectives || 0) + 1;

                var belief = (attribution.belief === 'confirm')? 1 : -1;
                p.belief[source] = (p.belief[source] || 0) + belief;

                var certainty = (attribution.certainty === 'confirm')? 1 : -1;
                p.certainty[source] = (p.certainty[source] || 0) + certainty;

                var possibility = (attribution.possibility === 'confirm')? 1 : -1;
                p.possibility[source] = (p.possibility[source] || 0) + possibility;

                var sentiment = 0;
                if (attribution.sentiment === 'positive') {
                  sentiment += 1;
                } else if (attribution.sentiment === 'negative') {
                  sentiment -= 1;
                }
                p.sentiment[source] = (p.sentiment[source] || 0) + sentiment;

                var when = (attribution.when === 'confirm')? 1 : -1;
                p.when[source] = (p.when[source] || 0) + when;
              // }
            });
          });

          return p;
        },
        //Remove something from our temporary collection, (basically do
        //everything in the add step, but then in reverse).
        function(p, v) {
          var keys = Object.keys(v.mentions);
          keys.forEach(function(key) {
            var mention = v.mentions[key];

            mention.perspective.forEach(function(perspective) {
              var attribution = perspective.attribution;
              var source = perspective.source;
              p.source = source;

              // var splitSource = perspective.source.split(':');
              // if (splitSource[0] === 'cite') {
                p.perspectives = (p.perspectives || 0) - 1;

                var belief = (attribution.belief === 'confirm')? 1 : -1;
                p.belief[source] = (p.belief[source] || 0) - belief;

                var certainty = (attribution.certainty === 'certain')? 1 : -1;
                p.certainty[source] = (p.certainty[source] || 0) - certainty;

                var possibility = (attribution.possibility === 'likely')? 1 : -1;
                p.possibility[source] = (p.possibility[source] || 0) - possibility;

                var sentiment = 0;
                if (attribution.sentiment === 'positive') {
                  sentiment += 1;
                } else if (attribution.sentiment === 'negative') {
                  sentiment -= 1;
                }
                p.sentiment[source] = (p.sentiment[source] || 0) - sentiment;

                var when = (attribution.when === 'now')? 1 : -1;
                p.when[source] = (p.when[source] || 0) - when;
              // }
            });
          });

          return p;
        },
        //Set up the inital data structure.
        function() {
          return {
            perspectives: 0,
            source: '',
            belief: {},
            certainty: {},
            possibility: {},
            sentiment: {},
            when: {}
          };
        }
      );

      var uniqueSources = [];
      laneClimaxGroup.all().map(function(d) {
        d.key[1].forEach(function(key) {
          if (uniqueSources.indexOf(key) < 0) {
            uniqueSources.push(key);
          }
        });
      });

      //Set up the
      customBubbleChart
      //Sizes in pixels
        .width(parseInt($element[0].getClientRects()[1].width, 10))
        .height(800)
        .margins({
          top: 10,
          right: 0,
          bottom: 20,
          left: 100
        })

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
              } else if (filter[0] <= d[0] && filter[0] >= d[0]) {
                if (d[1].indexOf(filter[1]) >= 0) {
                  return true;  
                }
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
        .xAxisPadding(100)
        .keyAccessor(function(p) {
          //The time of this event
          return p.key[0];
        })

      //y Axis
      // .yAxisLabel('group')
      .y(d3.scale.ordinal()
          .domain((function() {
            return uniqueSources;
          })())
        )
        .valueAccessor(function(p) {
          return p.key[1];
        })


      //Radius of the bubble
      .r(d3.scale.linear().domain(
          [0, d3.max(customBubbleChart.data(), function(e) {
            return e.value.perspectives;
          })]))
        .radiusValueAccessor(function(p) {
          return p.value.perspectives;
        })
        .minRadius(2)
        .maxBubbleRelativeSize(0.015)

      //Everything related to coloring the bubbles
      .colors(colorbrewer.RdYlGn[9])
        // We currently color the bubble using the same values as the radius
        .colorDomain(
          [0, 1])
        .colorAccessor(function(p) {
          if (p.value.perspectives > 0) {
            return (0.5*p.value.sentiment[p.value.source]) / p.value.perspectives + 0.5;
          }
          return 0;
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
      dc.override(customBubbleChart, '_prepareYAxis', function(g) {
        this.__prepareYAxis(g);
        this.y().rangeBands([this.yAxisHeight(), 0], 0, 1);
      });


      // dc.override(customBubbleChart, 'onClick', onClickOverride);
      customBubbleChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.perspectivelanechart').controller('PerspectiveLaneChartController', PerspectiveLaneChartController);
})();
