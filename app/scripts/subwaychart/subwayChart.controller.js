(function() {
  'use strict';

  function SubwayChartController($scope, $window, $element, d3, dc, NdxService, colorbrewer, HelperFunctions, Messagebus) {
    // var mentionToTxt = function(d) {
    //   var raw = d.mentions;
    //
    //   var txt = '';
    //   raw.forEach(function(mention) {
    //     var pre = mention.snippet[0].substring(0, mention.snippet_char[0]);
    //     var word = mention.snippet[0].substring(mention.snippet_char[0],mention.snippet_char[1]);
    //     var post = mention.snippet[0].substring(mention.snippet_char[1], mention.snippet[0].length);
    //
    //     txt += pre + word + post + '\n';
    //   }.bind(this));
    //
    //   return txt;
    // }.bind(this);

    this.initializeChart = function() {
      var subwayChart = dc.subwayChart($element[0].children[0]);

      //The dimension for the subwayChart. We use time for x and group for y,
      //and bin everything in the same group number and day.
      var subwayDimension = NdxService.buildDimension(function(d) {
        var time = d3.time.format('%Y%m%d').parse(d.time);

        return [time, HelperFunctions.determineUniqueActors(d)];
      });

      var subwayGroup = subwayDimension.group().reduce(
        //Add something to our temporary collection
        function(p, v) {
          //Climax score summed for all events with the same time(day) and group(number).
          p.count = p.count + 1;

          //Sum label values over all events fitting this time and group.
          if (v.labels) {
            v.labels.forEach(function(l) {
              p.labels[l] = (p.labels[l] || 0) + p.count;
            });
          } else {
            p.labels.none = (p.labels.none || 0) + p.count;
          }


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

          if (v.labels) {
            v.labels.forEach(function(l) {
              p.labels[l] = (p.labels[l] || 0) - p.count;
            });
          } else {
            p.labels.none = (p.labels.none || 0) - p.count;
          }

          //Push mentions over all events fitting this time and group.
          v.mentions.forEach(function(m) {
            p.mentions.pop(m);
          });

          return p;
        },
        //Set up the inital data structure.
        function() {
          return {
            count: 0,
            labels: {},
            mentions: []
          };
        }
      );

      var uniqueActors = [];
      subwayGroup.all().map(function(d) {
        d.key[1].forEach(function(key) {
          if (uniqueActors.indexOf(key) < 0) {
            uniqueActors.push(key);
          }
        });
      });

      //Set up the
      subwayChart
      //Sizes in pixels
        .width(Math.min($window.innerWidth, 1280) * (7/12) - 16)
        .height(1000)
        .margins({
          top: 10,
          right: 0,
          bottom: 20,
          left: 150
        })

      //Bind data
      .dimension(subwayDimension)
        .group(subwayGroup)

      .filterHandler(HelperFunctions.customDefaultFilterHandler.bind(subwayChart))

      //The time this chart takes to do its animations.
      .transitionDuration(1500)

      //x Axis
      .x(d3.time.scale())
        .elasticX(true)
        .xAxisPadding(100)
        .keyAccessor(function(p) {
          //The time of this event
          return p.key[0];
        })

      //y Axis
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
          if (p.value.count > 0) {
            return p.key[1].length;
          } else {
            return 0;
          }
        })
        .minRadius(5)
        .maxBubbleRelativeSize(0.015)

      //Use the color scheme of the groupRowChart
      .colors(d3.scale.ordinal().range(HelperFunctions.getOrdinalColors()))
      .colorAccessor(function(d) {
        return d;
      })

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
            HelperFunctions.mentionToTxt(p.value);
          return titleString;
        }.bind(this));

      //A hack to make the customBubbleChart filter out 0-value bubbles while determining the x-axis range
      dc.override(subwayChart, 'xAxisMin', function() {
        var min = d3.min(subwayChart.data(), function(e) {
          if (subwayChart.radiusValueAccessor()(e) > 0) {
            return subwayChart.keyAccessor()(e);
          }
        });
        return dc.utils.subtract(min, subwayChart.xAxisPadding());
      });

      dc.override(subwayChart, 'xAxisMax', function() {
        var max = d3.max(subwayChart.data(), function(e) {
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
        } else {
          subwayChart.selectAll('g.' + subwayChart.BUBBLE_NODE_CLASS).each(function() {
            subwayChart.resetHighlight(this);
          });
        }
      });

      //Disable the onClick handler for this chart
      dc.override(subwayChart, 'onClick', function() {
      });

      subwayChart.on('preRedraw', function(chart) {
        chart.width(Math.min(100,parseInt($element[0].clientWidth, 10)));
      });

      subwayChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.sources = NdxService.getData().timeline.sources;
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.subwaychart').controller('SubwayChartController', SubwayChartController);
})();
