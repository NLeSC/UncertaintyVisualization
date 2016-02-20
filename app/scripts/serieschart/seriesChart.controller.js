(function() {
  'use strict';

  function SeriesChartController($element, d3, dc, NdxService, HelperFunctions, Messagebus) {
    this.initializeChart = function() {
      var customSeriesChart = dc.customSeriesChart('#'+$element[0].children[0].attributes.id.value);

      var timeDimension = NdxService.buildDimension(function(d) {
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
            return HelperFunctions.symbolScale(d.key[0]);
          })
          .symbolSize(6)
          .highlightedSize(10)

        //Use the color scheme of the groupRowChart
        .colors(HelperFunctions.getGroupColors())
          //re-use the custom color accessor from the group chart
          .colorAccessor(function(d) {
            var splitString = d.key[0].split(':');
            var valueApproximation = -(10000 * parseInt(splitString[0]) + 10 * splitString[1].charCodeAt(2) + splitString[1].charCodeAt(3));
            return valueApproximation;
          });

        return subScatter;
      };

      //Set up the
      customSeriesChart
      //Sizes in pixels
        .width(parseInt($element[0].getClientRects()[1].width, 10))
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
        Messagebus.publish('newFilterEvent', [this, filter, dimension]);

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
      }.bind(customSeriesChart));


      customSeriesChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.serieschart').controller('SeriesChartController', SeriesChartController);
})();
