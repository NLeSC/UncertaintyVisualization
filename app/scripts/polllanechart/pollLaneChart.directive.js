(function() {
  'use strict';

  function pollLaneChartDirective() {
    return {
      restrict: 'E',
      template: require('./pollLaneChart.directive.html'),
      controller: 'PollLaneChartController',
      controllerAs: 'plcCtrl'
    };
  }

  angular.module('uncertApp.polllanechart').directive('pollLaneChartDirective', pollLaneChartDirective);
})();
