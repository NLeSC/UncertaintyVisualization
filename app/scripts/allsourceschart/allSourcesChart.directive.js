(function() {
  'use strict';

  function allSourcesChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/allsourceschart/allSourcesChart.directive.html',
      controller: 'AllSourcesChartController',
      controllerAs: 'ascCtrl'
    };
  }

  angular.module('uncertApp.allsourceschart').directive('allSourcesChartDirective', allSourcesChartDirective);
})();
