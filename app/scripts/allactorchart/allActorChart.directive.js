(function() {
  'use strict';

  function allActorChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/allactorchart/allActorChart.directive.html',
      controller: 'AllActorChartController',
      controllerAs: 'aacCtrl'
    };
  }

  angular.module('uncertApp.allactorchart').directive('allActorChartDirective', allActorChartDirective);
})();
