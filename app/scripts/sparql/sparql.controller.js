(function() {
  'use strict';

  function SparqlController(AuthenticationService, SparqlService) {
    this.resultText = '';

    AuthenticationService.ready.then(function() {
      this.resultText = SparqlService.init();
    }.bind(this));
  }

  angular.module('uncertApp.sparql').controller('SparqlController', SparqlController);
})();
