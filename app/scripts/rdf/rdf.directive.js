(function() {
  'use strict';

  function rdfDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/rdf/rdf.directive.html',
      controller: 'RdfController',
      controllerAs: 'rdfcontroller'
    };
  }

  angular.module('uncertApp.rdf').directive('rdfDirective', rdfDirective);
})();
