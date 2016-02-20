(function() {
  'use strict';

  function datatableDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/datatable/dataTable.directive.html',
      controller: 'DataTableController',
      controllerAs: 'dtCtrl'
    };
  }

  angular.module('uncertApp.datatable').directive('datatableDirective', datatableDirective);
})();
