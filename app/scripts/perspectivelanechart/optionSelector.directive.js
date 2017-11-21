(function() {
  'use strict';

  function perspectiveLaneChartOptionSelectorDirective() {
    return {
      restrict: 'E',
      template: require('./optionSelector.directive.html'),
      controller: 'PerspectiveLaneChartOptionSelectorController',
      controllerAs: 'plcOsCtrl'
    };
  }

  angular.module('uncertApp.perspectivelanechart').directive('perspectiveLaneChartOptionSelectorDirective', perspectiveLaneChartOptionSelectorDirective);
})();
