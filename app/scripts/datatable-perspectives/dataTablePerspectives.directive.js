(function() {
  'use strict';

  function datatablePerspectivesDirective() {
    return {
      restrict: 'E',
      template: require('./dataTablePerspectives.directive.html'),
      controller: 'DataTablePerspectivesController',
      controllerAs: 'dtPersCtrl'
    };
  }

  angular.module('uncertApp.datatableperspectives').directive('datatablePerspectivesDirective', datatablePerspectivesDirective);
})();
