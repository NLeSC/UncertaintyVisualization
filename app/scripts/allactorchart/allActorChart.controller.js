(function() {
  'use strict';

  function AllActorChartController($window, $element, uncertConf, d3, dc, NdxService, HelperFunctions, Messagebus) {
    this.initializeChart = function() {
      //A rowChart that shows us the importance of the all actors
      var allActorChart = dc.rowChart('#'+$element[0].children[1].attributes.id.value);

      //Dimension of the list of unique actors present in each event.
      var allActorsDimension = NdxService.buildDimension(function(d) {
        return HelperFunctions.determineUniqueActors(d);
      });

      //Custom reduce functions to split events up with multiple keys
      function reduceAdd(p, v) {
        if (v.actors) {
          var keys = Object.keys(v.actors);
          keys.forEach(function(key) {
            var keysActors = v.actors[key];
            keysActors.forEach(function(keysActor) {
              var actorLabel = key + ' : ' + keysActor;
              p[actorLabel] = (p[actorLabel] || 0) + 1;
            });
          });
        } else {
          p['no actors'] = (p['no actors'] || 0) + 1;
        }
        return p;
      }

      function reduceRemove(p, v) {
        if (v.actors) {
            var keys = Object.keys(v.actors);
            keys.forEach(function(key) {
              var keysActors = v.actors[key];
              keysActors.forEach(function(keysActor) {
                var actorLabel = key + ' : ' + keysActor;
                p[actorLabel] = (p[actorLabel] || 0) - 1;
              });
            });
          } else {
            p['no actors'] = (p['no actors'] || 0) - 1;
          }
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
        }).slice(0, n);

        return newObject;
      };
      allActorsClimaxSum.order = function(p) {
        return p;
      };

      var newChartRows = Math.max(1, Math.min(allActorsClimaxSum.top(Infinity).length, uncertConf.CHART_DIMENSIONS.relationsChartMaxRows));
      var newHeight = HelperFunctions.determineRelationsChartHeight(newChartRows);

      //Set up the
      allActorChart
      //Size in pixels
        .width(Math.min($window.innerWidth, 1280) * (1/12) - 16)
        .height(newHeight)
        .margins({
          top: 10,
          right: 2,
          bottom: 0,
          left: 2
        })

      //Bind data
      .dimension(allActorsDimension)
        .keyAccessor(function(d) {
          return d.key;
        })
        .group(allActorsClimaxSum)
        .valueAccessor(function(d) {
          return d.value;
        })

      //The x Axis
      .x(d3.scale.linear())
      .data(function(d) {
        return d.top(50);
      })

      .gap(uncertConf.CHART_DIMENSIONS.relationsChartGapHeight)
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
        }.bind(allActorChart))

      .xAxis().tickValues([]);

      //Set the actor colors in the helperfunctions so we can re-use this color scheme
      HelperFunctions.setActorColors(allActorChart.colors());

      allActorChart.render();
    };

    NdxService.ready.then(function() {
      this.initializeChart();
    }.bind(this));

    Messagebus.subscribe('data loaded', function() {
      NdxService.ready.then(function() {
        this.initializeChart();
      }.bind(this));
    }.bind(this));
  }

  angular.module('uncertApp.allactorchart').controller('AllActorChartController', AllActorChartController);
})();
