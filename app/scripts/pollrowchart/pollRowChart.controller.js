(function() {
  'use strict';

  function PollRowChartController($element, d3, dc, NdxService, HelperFunctions, Messagebus, uncertConf) {

    this.initializeChart = function() {
      var groupRowChart = dc.rowChart('#'+$element[0].children[0].attributes.id.value);

      var groupDimension = NdxService.pollDimension(function(d) {
        return d.group;
      });

      //We sum the climax scores for the groups.
      var climaxSumPerGroup = groupDimension.group();

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
      .group(climaxSumPerGroup)

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
      if (uncertConf.POLLS) {
        this.initializeChart();
      }
    }.bind(this));
  }

  angular.module('uncertApp.pollrowchart').controller('PollRowChartController', PollRowChartController);
})();
