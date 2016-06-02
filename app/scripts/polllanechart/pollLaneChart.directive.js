(function() {
  'use strict';

  function pollLaneChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/polllanechart/pollLaneChart.directive.html',
      controller: 'PollLaneChartController',
      controllerAs: 'plcCtrl'
    };
  }

  angular.module('uncertApp.polllanechart').directive('pollLaneChartDirective', pollLaneChartDirective);
})();
