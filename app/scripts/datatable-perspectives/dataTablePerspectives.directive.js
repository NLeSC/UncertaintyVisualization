(function() {
  'use strict';

  function datatablePerspectivesDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/datatable-perspectives/dataTablePerspectives.directive.html',
      controller: 'DataTablePerspectivesController',
      controllerAs: 'dtPersCtrl'
    };
  }

  angular.module('uncertApp.datatableperspectives').directive('datatablePerspectivesDirective', datatablePerspectivesDirective);
})();
