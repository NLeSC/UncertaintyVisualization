(function() {
  'use strict';

  function laneChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/lanechart/laneChart.directive.html',
      controller: 'LaneChartController',
      controllerAs: 'lcCtrl'
    };
  }

  angular.module('uncertApp.lanechart').directive('laneChartDirective', laneChartDirective);
})();
