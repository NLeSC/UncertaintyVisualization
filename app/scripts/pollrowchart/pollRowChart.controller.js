(function() {
  'use strict';

  function PollRowChartController($element, d3, dc, NdxService, HelperFunctions, Messagebus) {

    this.initializeChart = function() {
      var groupRowChart = dc.rowChart('#'+$element[0].children[0].attributes.id.value);

      var groupDimension = NdxService.pollDimension(function(d) {
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
        .height(100)

      //A smaller-than-default gap between bars
      .gap(2)

      .keyAccessor(function(d) {
        return d.key;
      })

      //Bind data
      .dimension(groupDimension)
      .group(filteredGroups)

      //The x Axis
      .x(d3.scale.linear())
        .elasticX(true)
        .xAxis().tickValues([]);


      dc.override(groupRowChart, 'onClick', function(d) {
      });

      // dc.override(groupRowChart, 'onClick', onClickOverride);
      groupRowChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.pollrowchart').controller('PollRowChartController', PollRowChartController);
})();
