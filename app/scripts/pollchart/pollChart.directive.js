(function() {
  'use strict';

  function pollChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/pollchart/pollChart.directive.html',
      controller: 'PollChartController',
      controllerAs: 'pcCtrl'
    };
  }

  angular.module('uncertApp.pollchart').directive('pollChartDirective', pollChartDirective);
})();
