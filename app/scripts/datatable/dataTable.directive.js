(function() {
  'use strict';

  function datatableDirective() {
    return {
      restrict: 'E',
      template: require('./dataTable.directive.html'),
      controller: 'DataTableController',
      controllerAs: 'dtCtrl'
    };
  }

  angular.module('uncertApp.datatable').directive('datatableDirective', datatableDirective);
})();
