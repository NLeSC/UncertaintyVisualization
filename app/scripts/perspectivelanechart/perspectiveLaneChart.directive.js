(function() {
  'use strict';

  function perspectiveLaneChartDirective() {
    return {
      restrict: 'E',
      template: require('./perspectiveLaneChart.directive.html'),
      controller: 'PerspectiveLaneChartController',
      controllerAs: 'plcCtrl'
    };
  }

  angular.module('uncertApp.perspectivelanechart').directive('perspectiveLaneChartDirective', perspectiveLaneChartDirective);
})();
