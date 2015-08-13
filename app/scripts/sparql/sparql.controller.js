(function() {
  'use strict';

  function SparqlController($scope, AuthenticationService, SparqlService) {
    this.resultText = '';
    this.errorMessage = '';

    AuthenticationService.ready.then(function() {
      SparqlService.doQuery().then(function (result){
        if( typeof(result) === 'string' ){
          if( result === '' ){
            this.errorMessage = 'Something went wrong. Please check that the Flask app is running on https://shrouded-gorge-9256.herokuapp.com/ Or install locally.';
          } else {
            this.errorMessage = result;
          }
        }
      }.bind(this));

    }.bind(this));
  }

  angular.module('uncertApp.sparql').controller('SparqlController', SparqlController);
})();
