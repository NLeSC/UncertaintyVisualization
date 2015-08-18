(function() {
  'use strict';

  function sparqlDirective(SparqlService) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/sparql/sparql.directive.html',
      controller: 'SparqlController',
      controllerAs: 'sparqlcontroller'
    };
  }

  angular.module('uncertApp.sparql').directive('sparqlDirective', sparqlDirective);
})();
