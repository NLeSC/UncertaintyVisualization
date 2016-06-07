(function() {
  'use strict';

  function perspectiveFiltersDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/perspectivefilters/perspectiveFilters.directive.html',
      controller: 'PerspectiveFiltersController',
      controllerAs: 'pfCtrl'
    };
  }

  angular.module('uncertApp.perspectivefilters').directive('perspectiveFiltersDirective', perspectiveFiltersDirective);
})();
