(function() {
  'use strict';

  function viewRelationsDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/viewrelations/view.relations.directive.html',
      controller: 'ViewRelationsController',
      controllerAs: 'i'
    };
  }

  angular.module('uncertApp.viewrelations')
    .directive('viewRelationsDirective', viewRelationsDirective);
})();
