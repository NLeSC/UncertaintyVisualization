(function() {
  'use strict';

  function SparqlController($scope, AuthenticationService, SparqlService) {
    this.resultText = '';
    this.errorMessage = '';
    this.query = 'SELECT DISTINCT ?source ?doc \n' +
        'WHERE { \n' +
        '  VALUES ?event { <http://www.newsreader-project.eu/data/cars/2009/05/22/7VRY-F631-2PP8-S0NC.xml#ev21> } \n' +
        '  { \n' +
        '    GRAPH ?graph { ?event ?predicate ?object . } \n' +
        '    ?graph prov:wasAttributedTo ?source . \n'+
        '    ?graph gaf:denotedBy ?mention . \n' +
        '    BIND (STRBEFORE(STR(?mention),"#") as ?doc) \n' +
        '  } \n' +
        '} \n' +
        'ORDER BY ?doc';
    this.dataset = 'dutchhouse';
    this.credentialsSet = false;
    this.jsonData = {};
    this.datasets = SparqlService.datasets;
    this.dataset = this.datasets[0];

    AuthenticationService.ready.then(function() {
      this.credentialsSet = true;
    }.bind(this));

    this.doQuery = function() {
      console.log('doQuery');
      if(!this.credentialsSet){
        this.errorMessage = 'Please log in before submitting a query.';
        return;
      } else {
        this.errorMessage = '';
      }
      SparqlService.doQuery(this.query, this.dataset).then(function(result) {
        if (typeof(result) === 'string') {
          if (result === '') {
            this.errorMessage = 'Something went wrong. Please check that the Flask app is running on https://shrouded-gorge-9256.herokuapp.com/ Or install locally.';
          } else {
            this.errorMessage = result;
          }
        } else {
          this.jsonData = result.data;
          this.resultText = JSON.stringify(this.jsonData);
          console.log(this.jsonData);
        }
      }.bind(this));
    };

  }

  angular.module('uncertApp.sparql').controller('SparqlController', SparqlController);
})();
