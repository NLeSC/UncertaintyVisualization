(function() {
  'use strict';

  function SparqlController($scope, AuthenticationService, Messagebus) {
    this.requestee = 'SparqlController';
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
    this.jsonData = {};

    this.datasets = ['cars', 'cars2', 'dutchhouse', 'wikinews'];
    this.dataset = this.datasets[0];

    Messagebus.subscribe('queryResult '+this.requestee, function(event, queryResult) {
      if (queryResult.status === 'success') {
        this.jsonData = queryResult.data.data;
        Messagebus.publish('received query result', this.jsonData);
      } else {
        if (queryResult.data === '') {
          this.errorMessage = 'Something went wrong. Please check that the Flask app is running on https://shrouded-gorge-9256.herokuapp.com/ Or install locally.';
        } else {
          this.errorMessage = queryResult.data;
        }
      }
    }.bind(this));

    this.doQuery = function() {
      this.errorMessage = '';
      var queryURL = encodeURI(this.query) + '&dataset=' + encodeURI(this.dataset);
      Messagebus.publish('query', {requestee:this.requestee, url:queryURL});
    };

  }

  angular.module('uncertApp.sparql').controller('SparqlController', SparqlController);
})();
