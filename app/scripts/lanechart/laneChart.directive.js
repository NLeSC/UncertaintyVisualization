(function() {
  'use strict';

  function laneChartDirective() {
    return {
      restrict: 'E',
      template: require('./laneChart.directive.html'),
      controller: 'LaneChartController',
      controllerAs: 'lcCtrl'
    };
  }

  angular.module('uncertApp.lanechart').directive('laneChartDirective', laneChartDirective);
})();
