(function() {
  'use strict';

  function AllSourcesChartController($element, d3, dc, NdxService, HelperFunctions, Messagebus) {
    this.initializeChart = function() {
      //A rowChart that shows us the importance of the all Sources
      var allSourcesChart = dc.rowChart('#'+$element[0].children[0].attributes.id.value);

      //Dimension of the list of unique Sources present in each event.
      var allSourcesDimension = NdxService.buildDimension(function(d) {
        return HelperFunctions.determineUniqueSources(d);
      });

      //Custom reduce functions to split events up with multiple keys
      function reduceAdd(p, v) {
        var keys = Object.keys(v.mentions);
        keys.forEach(function(key) {
          var mention = v.mentions[key];
          if (mention.perspective) {
            var source = mention.perspective.source;
            var splitSource = source.split(':');
            if (splitSource[0] === 'cite') {
              p[splitSource[1]] = (p[splitSource[1]] || 0) + 1;
            }
          }
        })
        return p;
      }

      function reduceRemove(p, v) {
        var keys = Object.keys(v.mentions);
        keys.forEach(function(key) {
          var mention = v.mentions[key];
          if (mention.perspective) {
            var source = mention.perspective.source;
            var splitSource = source.split(':');
            if (splitSource[0] === 'cite') {
              p[splitSource[1]] = (p[splitSource[1]] || 0) + 1;
            }
          }
        })
        return p;
      }

      function reduceInitial() {
        return {};
      }

      //Apply custom reduce
      var allSourcesClimaxSum = allSourcesDimension.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();

      //Hack to add the all and top functions again
      allSourcesClimaxSum.all = function() {
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
      allSourcesClimaxSum.top = function(n) {
        var newObject = this.all().sort(function(a, b) {
          return b.value - a.value;
        }).slice(0, n);

        return newObject;
      };
      allSourcesClimaxSum.order = function(p) {
        return p;
      };

      //Set up the
      allSourcesChart
      //Size in pixels
        .width(parseInt($element[0].getClientRects()[1].width, 10))
        .height(400)
        .margins({
          top: 10,
          right: 2,
          bottom: 0,
          left: 2
        })

      //Bind data
      .dimension(allSourcesDimension)
        .keyAccessor(function(d) {
          return d.key;
        })
        .group(allSourcesClimaxSum)
        .valueAccessor(function(d) {
          return d.value;
        })

      //The x Axis
      .x(d3.scale.linear())
      .data(function(d) {
        return d.top(20);
      })

      .gap(1)
      .elasticX(true)

      .filterHandler(
        function(dimension, filters) {
          Messagebus.publish('newFilterEvent', [this, filters, dimension]);

          dimension.filter(null);
          if (filters.length === 0) {
            dimension.filter(null);
          } else {
            dimension.filter(function(d) {
              var result = true;
              if (allSourcesChart.filters() !== null) {
                var currentFilters = allSourcesChart.filters();
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
        }.bind(allSourcesChart))

      .xAxis().tickValues([]);

      allSourcesChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.allsourceschart').controller('AllSourcesChartController', AllSourcesChartController);
})();
