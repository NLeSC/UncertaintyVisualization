(function() {
  'use strict';

  function subwayChartDirective() {
    return {
      restrict: 'E',
      template: require('./subwayChart.directive.html'),
      controller: 'SubwayChartController',
      controllerAs: 'swcCtrl'
    };
  }

  angular.module('uncertApp.subwaychart').directive('subwayChartDirective', subwayChartDirective);
})();
