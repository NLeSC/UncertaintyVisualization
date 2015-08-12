(function() {
  'use strict';

  function TextController(AuthenticationService, SparqlService) {
    this.resultText = '';

    AuthenticationService.ready.then(function() {
      this.resultText = SparqlService.init();
    }.bind(this));
  }

  angular.module('uncertApp.text').controller('TextController', TextController);
})();
