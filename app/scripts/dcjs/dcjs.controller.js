(function() {
  'use strict';

  function DcjsController(d3, dc, crossfilter, colorbrewer, Messagebus) {
    this.queryResult = '';

    Messagebus.subscribe('received query result', function(event, jsonData) {
      console.log('DcjsController received data');

      this.queryResult = JSON.stringify(jsonData, null, 2); // spacing level = 2

      // jsonData.results.bindings.forEach(function(source) {
      //   console.log(source.label.value);
      // });

    }.bind(this));

    this.init = function(element) {
      var width = 900;
      var height = 250;

      var container = element.children[0];
      // var gainOrLossChart = dc.pieChart('#gain-loss-chart');
      // var fluctuationChart = dc.barChart('#fluctuation-chart');
      // var quarterChart = dc.pieChart('#quarter-chart');
      // var dayOfWeekChart = dc.rowChart('#day-of-week-chart');
      // var moveChart = dc.lineChart('#monthly-move-chart');
      // var volumeChart = dc.barChart('#monthly-volume-chart');
      var yearlyBubbleChart = dc.bubbleChart('#'+container.id);
      // var nasdaqCount = dc.dataCount('.dc-data-count');
      // var nasdaqTable = dc.dataTable('.dc-data-table');

      d3.csv('data/ndx.csv', function(data) {
        // Since its a csv file we need to format the data a bit.
        var dateFormat = d3.time.format('%m/%d/%Y');
        var numberFormat = d3.format('.2f');

        data.forEach(function(d) {
          d.dd = dateFormat.parse(d.date);
          d.month = d3.time.month(d.dd); // pre-calculate month for better performance
          d.close = +d.close; // coerce to number
          d.open = +d.open;
        });

        //### Create Crossfilter Dimensions and Groups

        //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
        var ndx = crossfilter(data);

        // Dimension by year
        var yearlyDimension = ndx.dimension(function(d) {
          return d3.time.year(d.dd).getFullYear();
        });
        // Maintain running tallies by year as filters are applied or removed
        var yearlyPerformanceGroup = yearlyDimension.group().reduce(
          /* callback for when data is added to the current filter results */
          function(p, v) {
            ++p.count;
            p.absGain += v.close - v.open;
            p.fluctuation += Math.abs(v.close - v.open);
            p.sumIndex += (v.open + v.close) / 2;
            p.avgIndex = p.sumIndex / p.count;
            p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
            p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
            return p;
          },
          /* callback for when data is removed from the current filter results */
          function(p, v) {
            --p.count;
            p.absGain -= v.close - v.open;
            p.fluctuation -= Math.abs(v.close - v.open);
            p.sumIndex -= (v.open + v.close) / 2;
            p.avgIndex = p.count ? p.sumIndex / p.count : 0;
            p.percentageGain = p.avgIndex ? (p.absGain / p.avgIndex) * 100 : 0;
            p.fluctuationPercentage = p.avgIndex ? (p.fluctuation / p.avgIndex) * 100 : 0;
            return p;
          },
          /* initialize p */
          function() {
            return {
              count: 0,
              absGain: 0,
              fluctuation: 0,
              fluctuationPercentage: 0,
              sumIndex: 0,
              avgIndex: 0,
              percentageGain: 0
            };
          }
        );

        //### Define Chart Attributes
        // Define chart attributes using fluent methods. See the
        // [dc.js API Reference](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md) for more information
        //

        //#### Bubble Chart

        //Create a bubble chart and use the given css selector as anchor. You can also specify
        //an optional chart group for this chart to be scoped within. When a chart belongs
        //to a specific group then any interaction with the chart will only trigger redraws
        //on charts within the same chart group.
        // <br>API: [Bubble Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#bubble-chart)

        yearlyBubbleChart /* dc.bubbleChart('#yearly-bubble-chart', 'chartGroup') */
        // (_optional_) define chart width, `default = 200`
          .width(width)
          // (_optional_) define chart height, `default = 200`
          .height(height)
          // (_optional_) define chart transition duration, `default = 750`
          .transitionDuration(1500)
          .margins({
            top: 10,
            right: 50,
            bottom: 30,
            left: 40
          })
          .dimension(yearlyDimension)
          //The bubble chart expects the groups are reduced to multiple values which are used
          //to generate x, y, and radius for each key (bubble) in the group
          .group(yearlyPerformanceGroup)
          // (_optional_) define color function or array for bubbles: [ColorBrewer](http://colorbrewer2.org/)
          .colors(colorbrewer.RdYlGn[9])
          //(optional) define color domain to match your data domain if you want to bind data or color
          .colorDomain([-500, 500])
          //##### Accessors

        //Accessor functions are applied to each value returned by the grouping

        // `.colorAccessor` - the returned value will be passed to the `.colors()` scale to determine a fill color
        .colorAccessor(function(d) {
            return d.value.absGain;
          })
          // `.keyAccessor` - the `X` value will be passed to the `.x()` scale to determine pixel location
          .keyAccessor(function(p) {
            return p.value.absGain;
          })
          // `.valueAccessor` - the `Y` value will be passed to the `.y()` scale to determine pixel location
          .valueAccessor(function(p) {
            return p.value.percentageGain;
          })
          // `.radiusValueAccessor` - the value will be passed to the `.r()` scale to determine radius size;
          //   by default this maps linearly to [0,100]
          .radiusValueAccessor(function(p) {
            return p.value.fluctuationPercentage;
          })
          .maxBubbleRelativeSize(0.3)
          .x(d3.scale.linear().domain([-2500, 2500]))
          .y(d3.scale.linear().domain([-100, 100]))
          .r(d3.scale.linear().domain([0, 4000]))
          //##### Elastic Scaling

        //`.elasticY` and `.elasticX` determine whether the chart should rescale each axis to fit the data.
        .elasticY(true)
          .elasticX(true)
          //`.yAxisPadding` and `.xAxisPadding` add padding to data above and below their max values in the same unit
          //domains as the Accessors.
          .yAxisPadding(100)
          .xAxisPadding(500)
          // (_optional_) render horizontal grid lines, `default=false`
          .renderHorizontalGridLines(true)
          // (_optional_) render vertical grid lines, `default=false`
          .renderVerticalGridLines(true)
          // (_optional_) render an axis label below the x axis
          .xAxisLabel('Index Gain')
          // (_optional_) render a vertical axis lable left of the y axis
          .yAxisLabel('Index Gain %')
          //##### Labels and  Titles

        //Labels are displayed on the chart for each bubble. Titles displayed on mouseover.
        // (_optional_) whether chart should render labels, `default = true`
        .renderLabel(true)
          .label(function(p) {
            return p.key;
          })
          // (_optional_) whether chart should render titles, `default = false`
          .renderTitle(true)
          .title(function(p) {
            return [
              p.key,
              'Index Gain: ' + numberFormat(p.value.absGain),
              'Index Gain in Percentage: ' + numberFormat(p.value.percentageGain) + '%',
              'Fluctuation / Index Ratio: ' + numberFormat(p.value.fluctuationPercentage) + '%'
            ].join('\n');
          })
          //#### Customize Axes

        // Set a custom tick format. Both `.yAxis()` and `.xAxis()` return an axis object,
        // so any additional method chaining applies to the axis, not the chart.
        .yAxis().tickFormat(function(v) {
          return v + '%';
        });

        //#### Rendering

        //simply call `.renderAll()` to render all charts on the page
        dc.renderAll();
        /*
        // Or you can render charts belonging to a specific chart group
        dc.renderAll('group');
        // Once rendered you can call `.redrawAll()` to update charts incrementally when the data
        // changes, without re-rendering everything
        dc.redrawAll();
        // Or you can choose to redraw only those charts associated with a specific chart group
        dc.redrawAll('group');
        */

      });
    };
  }

  angular.module('uncertApp.dcjs').controller('DcjsController', DcjsController);
})();
