(function() {
  'use strict';

  function GroupRowChartController($element, d3, dc, NdxService, HelperFunctions, Messagebus) {
    var symbolRenderlet = function(_chart) {
      //For each row in the chart
      _chart.selectAll('g.row').each(function() {
        //Append a path element
        d3.select(this).append('path')
          //Bind he data so we can use it for determining the symbol shape
          .data(d3.select(this).data())
          .attr('class', 'symbol')
          .attr('opacity', '1')
          //Get the color from the chart
          .attr('fill', _chart.getColor)
          //Position correctly, the Y attribute is a magic number
          .attr('transform', function() {
            return 'translate(' + d3.select(this.parentNode).select('rect')[0][0].getAttribute('height') / 4 + ',' + d3.select(this.parentNode).select('rect')[0][0].getAttribute('height') / 4 + ')';
          })
          //Determine the symbol from the data. Use the same symbol scale as the
          //series chart
          .attr('d', function(d) {
            var symbol = d3.svg.symbol();
            symbol.size(d3.select(this.parentNode).select('rect')[0][0].getAttribute('height'));
            symbol.type(HelperFunctions.symbolScale(d.key));
            return symbol();
          }.bind(this));

        //Reposition the rectangles to make room for the symbol
        d3.select(this).select('rect')
          .attr('transform', function() {
            return 'translate(' + d3.select(this.parentNode).select('rect')[0][0].getAttribute('height') / 2 + ',' + 0 + ')';
          });
      });
    };

    this.initializeChart = function() {
      var groupRowChart = dc.rowChart('#'+$element[0].children[0].attributes.id.value);

      var groupDimension = NdxService.buildDimension(function(d) {
        return d.group;
      });

      //We sum the climax scores for the groups.
      var climaxSumPerGroup = groupDimension.group();

      ///The group includes a value which tells us how important the group is
      //in the overall storyline. For this graph, we filter out the groups with
      //an importance value <= 1%
      function filterGroupsOnImportance(sourceGroup) {
        return {
          all: function() {
            return sourceGroup.all().filter(function(d) {
              var groupNum = parseInt(d.key.split(':')[0]);
              return groupNum > 1;
            });
          },
          top: function(n) {
            return sourceGroup.top(Infinity).filter(function(d) {
              var groupNum = parseInt(d.key.split(':')[0]);
              return groupNum > 1;
            }).slice(0, n);
          }
        };
      }
      var filteredGroups = filterGroupsOnImportance(climaxSumPerGroup);

      //Set up the
      groupRowChart
      //Size in pixels
        .margins({
          top: 20,
          right: 0,
          bottom: 20,
          left: 0
        })
        .width(parseInt($element[0].getClientRects()[1].width, 10))
        .height(400)

      //A smaller-than-default gap between bars
      .gap(2)

      .keyAccessor(function(d) {
        return d.key;
      })

      //Use an ordinal color scale
      .colors(d3.scale.category20c())
      //Use a custom accessor
      .colorAccessor(function(d) {
        var splitString = d.key.split(':');
        var valueApproximation = -(10000 * parseInt(splitString[0]) + 10 * splitString[1].charCodeAt(2) + splitString[1].charCodeAt(3));
        return valueApproximation;
      })

      //Bind data
      .dimension(groupDimension)
        .group(filteredGroups)

      .filterHandler(HelperFunctions.customDefaultFilterHandler.bind(groupRowChart))

      //Order by key string (reverse, so we had to invent some shenanigans)
      //This is done explicitly to match the laneChart ordering.
      .ordering(function(d) {
        var splitString = d.key.split(':');
        var valueApproximation = -(10000 * parseInt(splitString[0]) + 10 * splitString[1].charCodeAt(2) + splitString[1].charCodeAt(3));
        return valueApproximation;
      })

      //The x Axis
      .x(d3.scale.linear())
        .elasticX(true)
        .xAxis().tickValues([]);

      //Use a renderlet function to add the colored symbols to the legend (defined above)
      groupRowChart.on('renderlet', symbolRenderlet);

      HelperFunctions.setGroupColors(groupRowChart.colors());

      // dc.override(groupRowChart, 'onClick', onClickOverride);
      groupRowChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.grouprowchart').controller('GroupRowChartController', GroupRowChartController);
})();
