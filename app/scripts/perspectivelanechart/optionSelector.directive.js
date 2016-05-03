(function() {
  'use strict';

  function perspectiveLaneChartOptionSelectorDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/perspectivelanechart/optionSelector.directive.html',
      controller: 'PerspectiveLaneChartOptionSelectorController',
      controllerAs: 'plcOsCtrl'
    };
  }

  angular.module('uncertApp.perspectivelanechart').directive('perspectiveLaneChartOptionSelectorDirective', perspectiveLaneChartOptionSelectorDirective);
})();
