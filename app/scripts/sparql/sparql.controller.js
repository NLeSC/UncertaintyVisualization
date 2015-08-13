(function() {
  'use strict';

  function SparqlController($scope, AuthenticationService, SparqlService) {
    this.resultText = '';
    this.errorMessage = '';
    this.query = 'SELECT * WHERE {dbpedia:Barack_Obama rdfs:label ?label . } LIMIT 100';
    this.showForm = false;
    this.jsonData = {};

    AuthenticationService.ready.then(function() {
      this.showForm = true;
    }.bind(this));

    this.doQuery = function() {
      console.log('doQuery');
      SparqlService.doQuery(this.query).then(function(result) {
        if (typeof(result) === 'string') {
          if (result === '') {
            this.errorMessage = 'Something went wrong. Please check that the Flask app is running on https://shrouded-gorge-9256.herokuapp.com/ Or install locally.';
          } else {
            this.errorMessage = result;
          }
        } else {
          this.jsonData = result.data;
          console.log(this.jsonData);
        }
      }.bind(this));
    };

  }

  angular.module('uncertApp.sparql').controller('SparqlController', SparqlController);
})();
