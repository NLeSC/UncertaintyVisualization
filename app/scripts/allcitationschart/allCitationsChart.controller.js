(function() {
  'use strict';

  function AllCitationsChartController($element, d3, dc, NdxService, HelperFunctions, Messagebus) {
    this.initializeChart = function() {
      //A rowChart that shows us the importance of the all Citations
      var allCitationsChart = dc.rowChart('#'+$element[0].children[0].attributes.id.value);

      //Dimension of the list of unique Citations present in each event.
      var allCitationsDimension = NdxService.buildDimension(function(d) {
        return HelperFunctions.determineUniqueCitationSources(d);
      });

      //Custom reduce functions to split events up with multiple keys
      function reduceAdd(p, v) {
        var keys = Object.keys(v.mentions);
        keys.forEach(function(key) {
          var mention = v.mentions[key];

          mention.perspective.forEach(function(perspective) {
            var splitSource = perspective.source.split(':');
            if (splitSource[0] === 'cite') {
              p[splitSource[1]] = (p[splitSource[1]] || 0) + 1;
            }
          });
        })
        return p;
      }

      function reduceRemove(p, v) {
        var keys = Object.keys(v.mentions);
        keys.forEach(function(key) {
          var mention = v.mentions[key];

          mention.perspective.forEach(function(perspective) {
            var splitSource = perspective.source.split(':');
            if (splitSource[0] === 'cite') {
              p[splitSource[1]] = (p[splitSource[1]] || 0) - 1;
            }
          });
        })
        return p;
      }

      function reduceInitial() {
        return {};
      }

      //Apply custom reduce
      var allCitationsClimaxSum = allCitationsDimension.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();

      //Hack to add the all and top functions again
      allCitationsClimaxSum.all = function() {
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
      allCitationsClimaxSum.top = function(n) {
        var newObject = this.all().sort(function(a, b) {
          return b.value - a.value;
        }).slice(0, n);

        return newObject;
      };
      allCitationsClimaxSum.order = function(p) {
        return p;
      };

      //Set up the
      allCitationsChart
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
      .dimension(allCitationsDimension)
        .keyAccessor(function(d) {
          return d.key;
        })
        .group(allCitationsClimaxSum)
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
            dimension.filterFunction(function(d) {
              for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                if (filter.isFiltered && filter.isFiltered(d)) {
                  return true;
                } else if (d === filter || d.indexOf(filter) >= 0) {
                  return true;
                }
              }
              return false;
            });
          }
          return filters;
        }.bind(allCitationsChart))

      .xAxis().tickValues([]);

      allCitationsChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.allcitationschart').controller('AllCitationsChartController', AllCitationsChartController);
})();
