(function() {
  'use strict';

  function PerspectiveLaneChartController($window, $element, d3, dc, colorbrewer, NdxService, HelperFunctions, Messagebus) {
    this.perspectiveOption = 'sentiment';

    this.initializeChart = function() {
      this.customBubbleChart = dc.dyndomBubbleChart('#'+$element[0].children[0].attributes.id.value);

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
            p.climax = (p.climax || 0) + v.climax;

            mention.perspective.forEach(function(perspective) {
              var attribution = perspective.attribution;
              var source = perspective.source;

              p.sources[source] = (p.sources[source] || 0) + 1;

              p.perspectives = (p.perspectives || 0) + 1;

              var belief = 0;
              if (attribution.belief === 'confirm') {
                belief += 1;
              } else if (attribution.belief === 'denial') {
                belief -= 1;
              }
              p.belief[source] = (p.belief[source] || 0) + belief;

              var certainty = 0;
              if (attribution.certainty === 'certain') {
                certainty += 1;
              } else if (attribution.certainty === 'uncertain') {
                certainty -= 1;
              }
              p.certainty[source] = (p.certainty[source] || 0) + certainty;

              var possibility = 0;
              if (attribution.possibility === 'likely') {
                possibility += 1;
              } else if (attribution.possibility === 'unlikely') {
                possibility -= 1;
              }
              p.possibility[source] = (p.possibility[source] || 0) + possibility;

              var sentiment = 0;
              if (attribution.sentiment === 'positive') {
                sentiment += 1;
              } else if (attribution.sentiment === 'negative') {
                sentiment -= 1;
              }
              p.sentiment[source] = (p.sentiment[source] || 0) + sentiment;

              var when = 0; //Reversed on request
              if (attribution.when === 'past') {
                when -= 1;
              } else if (attribution.when === 'future') {
                when += 1;
              }
              p.when[source] = (p.when[source] || 0) + when;
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
            p.climax = (p.climax || 0) - v.climax;

            mention.perspective.forEach(function(perspective) {
              var attribution = perspective.attribution;
              var source = perspective.source;

              p.sources[source] = (p.sources[source] || 0) - 1;

              p.perspectives = (p.perspectives || 0) - 1;

              var belief = 0;
              if (attribution.belief === 'confirm') {
                belief += 1;
              } else if (attribution.belief === 'denial') {
                belief -= 1;
              }
              p.belief[source] = (p.belief[source] || 0) - belief;

              var certainty = 0;
              if (attribution.certainty === 'certain') {
                certainty += 1;
              } else if (attribution.certainty === 'uncertain') {
                certainty -= 1;
              }
              p.certainty[source] = (p.certainty[source] || 0) - certainty;

              var possibility = 0;
              if (attribution.possibility === 'likely') {
                possibility += 1;
              } else if (attribution.possibility === 'unlikely') {
                possibility -= 1;
              }
              p.possibility[source] = (p.possibility[source] || 0) - possibility;

              var sentiment = 0;
              if (attribution.sentiment === 'positive') {
                sentiment += 1;
              } else if (attribution.sentiment === 'negative') {
                sentiment -= 1;
              }
              p.sentiment[source] = (p.sentiment[source] || 0) - sentiment;

              var when = 0; //Reversed on request
              if (attribution.when === 'past') {
                when += 1;
              } else if (attribution.when === 'future') {
                when -= 1;
              }
              p.when[source] = (p.when[source] || 0) - when;
            });
          });

          return p;
        },
        //Set up the inital data structure.
        function() {
          return {
            perspectives: 0,
            climax: 0,
            sources: {},
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
      this.customBubbleChart
      //Sizes in pixels
        .width($window.innerWidth * (8/12) * (10/12) - 32 - 8)//parseInt($element[0].getClientRects()[1].width, 10))
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
      }.bind(this.customBubbleChart))

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
          [0, d3.max(this.customBubbleChart.data(), function(e) {
            return e.value.climax;
          })]))
        .radiusValueAccessor(function(p) {
          return p.value.climax;
        })
        .minRadius(2)
        .maxBubbleRelativeSize(0.015)

      //Everything related to coloring the bubbles
      .colors(colorbrewer.RdBu[9])
        .colorDomain(
          [0, 1])
        .colorAccessor(function(p) {
          if (p.value.perspectives > 0) {
            return (0.5*p.value[this.perspectiveOption][p.key[1]]) / p.value.perspectives + 0.5;
          }
          return 0;
        }.bind(this))

      //Labels printed just above the bubbles
      .renderLabel(false)
        // .minRadiusWithLabel(0)
        // .label(function(p) {
        //   return '';
        // })
      .legend(dc.legend().x(400).y(10).itemHeight(13).gap(5))

      //Information on hover
      .renderTitle(true)
        .title(function(p) {
          var formattedTime = p.key[0].getDate() + '/' + (p.key[0].getMonth()+1) + '/' + p.key[0].getFullYear() + '\n';
          var formattedKey = p.key[1] + ' in ' + p.value.sources[p.key[1]]+ ' articles.\n';

          //Get the events
          var sources = Object.keys(p.value.sources);
          var sourcesString = '';
          sources.forEach(function(s) {
            if (s !== p.key[1]) {
              sourcesString += s + ' : ' + p.value.sources[s] + '\n';
            }
          });

          var belief = p.value.belief[p.key[1]];
          var beliefString = 'confirm';
          if (belief < 0) {
            beliefString = 'deny';
          }

          var certainty = p.value.certainty[p.key[1]];
          var certaintyString = 'certain';
          if (certainty < 0) {
            certaintyString = 'uncertain';
          }

          var possibility = p.value.possibility[p.key[1]];
          var possibilityString = 'likely';
          if (possibility < 0) {
            possibilityString = 'unlikely';
          }

          var sentiment = p.value.sentiment[p.key[1]];
          var sentimentString = 'neutral';
          if (sentiment < 0) {
            sentimentString = 'negative';
          } else if (sentiment > 0) {
            sentimentString = 'positive';
          }

          var when = p.value.when[p.key[1]];
          var whenString = 'now';
          if (when < 0) {
            whenString = 'past';
          } else if (when > 0) {
            whenString = 'future';
          }


          // //Get the actors
          // var actors = Object.keys(p.value.actors);
          // var actorString = '';
          // actors.forEach(function(a) {
          //   actorString += p.value.actors[a] + ' : ' + a.toString() + '\n';
          // });
          //
          // //List all individual labels and their climax scores
          // var labels = Object.keys(p.value.labels);
          // var labelString = '';
          // labels.forEach(function(l) {
          //   labelString += p.value.labels[l] + ' : ' + l.toString() + '\n';
          // });

          var titleString =
            formattedTime + '\n' +
            formattedKey + '\n' +
            '\n---- Other Sources for this event ----\n' +
            sourcesString +
            '\n----- Perspective on this event ------\n' +
            'belief     : ' + beliefString + '\n' +
            'certainty  : ' + certaintyString + '\n' +
            'possibility: ' + possibilityString + '\n' +
            'sentiment  : ' + sentimentString + '\n' +
            'when       : ' + whenString + '\n';
          return titleString;
        }.bind(this));

      //A hack to make the customBubbleChart filter out 0-value bubbles while determining the x-axis range
      dc.override(this.customBubbleChart, 'xAxisMin', function() {
        var min = d3.min(this.customBubbleChart.data(), function(e) {
          if (this.customBubbleChart.radiusValueAccessor()(e) > 0) {
            return this.customBubbleChart.keyAccessor()(e);
          }
        }.bind(this));
        return dc.utils.subtract(min, this.customBubbleChart.xAxisPadding());
      }.bind(this));

      dc.override(this.customBubbleChart, 'xAxisMax', function() {
        var max = d3.max(this.customBubbleChart.data(), function(e) {
          if (this.customBubbleChart.radiusValueAccessor()(e) > 0) {
            return this.customBubbleChart.keyAccessor()(e);
          }
        }.bind(this));
        return dc.utils.add(max, this.customBubbleChart.xAxisPadding());
      }.bind(this));

      //A hack to make the bubbleChart accept ordinal values on the y Axis
      dc.override(this.customBubbleChart, '_prepareYAxis', function(g) {
        this.customBubbleChart.__prepareYAxis(g);
        this.customBubbleChart.y().rangeBands([this.customBubbleChart.yAxisHeight(), 0], 0, 1);
      }.bind(this));


      // dc.override(customBubbleChart, 'onClick', onClickOverride);
      this.customBubbleChart.render();
    }.bind(this);

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));

    Messagebus.subscribe('newPerspectiveOption', function(event, value) {
      this.perspectiveOption = value;
      this.customBubbleChart.redraw();
    }.bind(this));
  }

  angular.module('uncertApp.perspectivelanechart').controller('PerspectiveLaneChartController', PerspectiveLaneChartController);
})();
