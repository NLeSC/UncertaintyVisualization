(function() {
  'use strict';

  function SparqlController($scope, AuthenticationService, SparqlService) {
    this.resultText = '';
    this.errorMessage = '';

    AuthenticationService.ready.then(function() {
      SparqlService.doQuery().then(function (result){
        if( typeof(result) === 'string' ){
          if( result === '' ){
            this.errorMessage = 'Please check whether the Flask app is running on http://127.0.0.1:5000/';
          } else {
            this.errorMessage = result;
          }
        }
      }.bind(this), function (error){

      });

    }.bind(this));
  }

  angular.module('uncertApp.sparql').controller('SparqlController', SparqlController);
})();
