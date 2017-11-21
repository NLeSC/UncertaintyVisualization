(function() {
  'use strict';

  function allAuthorsChartDirective() {
    return {
      restrict: 'E',
      template: require('./allAuthorsChart.directive.html'),
      controller: 'AllAuthorsChartController',
      controllerAs: 'aaucCtrl'
    };
  }

  angular.module('uncertApp.allauthorschart').directive('allAuthorsChartDirective', allAuthorsChartDirective);
})();
