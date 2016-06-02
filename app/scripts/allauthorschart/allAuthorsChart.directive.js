(function() {
  'use strict';

  function allAuthorsChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/allauthorschart/allAuthorsChart.directive.html',
      controller: 'AllAuthorsChartController',
      controllerAs: 'aaucCtrl'
    };
  }

  angular.module('uncertApp.allauthorschart').directive('allAuthorsChartDirective', allAuthorsChartDirective);
})();
