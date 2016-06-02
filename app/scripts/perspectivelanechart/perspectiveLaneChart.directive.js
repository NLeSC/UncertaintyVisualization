(function() {
  'use strict';

  function perspectiveLaneChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/perspectivelanechart/perspectiveLaneChart.directive.html',
      controller: 'PerspectiveLaneChartController',
      controllerAs: 'plcCtrl'
    };
  }

  angular.module('uncertApp.perspectivelanechart').directive('perspectiveLaneChartDirective', perspectiveLaneChartDirective);
})();
