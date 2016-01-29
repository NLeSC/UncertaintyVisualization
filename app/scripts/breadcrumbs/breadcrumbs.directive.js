(function() {
  'use strict';

  function breadcrumbsDirective() {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/breadcrumbs/breadcrumbs.directive.html',
      controller: 'BreadcrumbsController',
      controllerAs: 'bc'
    };
  }

  angular.module('uncertApp.breadcrumbs').directive('breadcrumbsDirective', breadcrumbsDirective);
})();
