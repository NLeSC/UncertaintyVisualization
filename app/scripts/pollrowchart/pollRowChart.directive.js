(function() {
  'use strict';

  function pollRowChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/pollrowchart/pollRowChart.directive.html',
      controller: 'PollRowChartController',
      controllerAs: 'prcCtrl'
    };
  }

  angular.module('uncertApp.pollrowchart').directive('pollRowChartDirective', pollRowChartDirective);
})();
