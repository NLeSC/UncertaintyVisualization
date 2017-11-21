(function() {
  'use strict';

  function perspectiveFiltersDirective() {
    return {
      restrict: 'E',
      template: require('./perspectiveFilters.directive.html'),
      controller: 'PerspectiveFiltersController',
      controllerAs: 'pfCtrl'
    };
  }

  angular.module('uncertApp.perspectivefilters').directive('perspectiveFiltersDirective', perspectiveFiltersDirective);
})();
