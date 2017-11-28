(function() {
  'use strict';

  function viewRelationsDirective() {
    return {
      restrict: 'E',
      template: require('./view.relations.directive.html'),
      controller: 'ViewRelationsController',
      controllerAs: 'i'
    };
  }

  angular.module('uncertApp.viewrelations')
    .directive('viewRelationsDirective', viewRelationsDirective);
})();
