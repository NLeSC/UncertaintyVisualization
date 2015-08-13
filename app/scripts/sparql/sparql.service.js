(function() {
  'use strict';

  function SparqlService($q, $http, Messagebus, AuthenticationService) {
    //this.knowledgeStoreURL = 'https://knowledgestore2.fbk.eu/nwr/dutchhouse/sparql?query=';
    this.knowledgeStoreURL = 'https://shrouded-gorge-9256.herokuapp.com/do_sparql?query=';
    //this.knowledgeStoreURL = 'http://0.0.0.0:5000/do_sparql?query=';

    this.exampleQuery = 'SELECT * WHERE {dbpedia:Barack_Obama rdfs:label ?label . } LIMIT 100';
    //this.exampleQuery = '';

    var deferred = $q.defer();
    this.ready = deferred.promise;

    this.initialized = false;

    this.init = function() {
      this.doQuery();
    };

    this.doQuery = function(query) {
      return $http.get(encodeURI(this.knowledgeStoreURL + query)).then(function(queryResult) {
        return queryResult;
      }, function (error){
        return error.statusText;
      });
    };

    // this.init();
  }

  angular.module('uncertApp.sparql').service('SparqlService', SparqlService);
})();
