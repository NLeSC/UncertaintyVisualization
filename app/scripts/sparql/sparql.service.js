(function() {
  'use strict';

  function SparqlService($q, $http, Messagebus, AuthenticationService) {

    //this.knowledgeStoreURL = 'https://knowledgestore2.fbk.eu/nwr/dutchhouse/sparql?query=';
    this.knowledgeStoreURL = 'https://shrouded-gorge-9256.herokuapp.com/do_sparql?query=';

    this.exampleQuery = 'SELECT * WHERE {dbpedia:Barack_Obama rdfs:label ?label . } LIMIT 100';
    //this.exampleQuery = 'SELECT%20*%20WHERE%20%7Bdbpedia%3ABarack_Obama%20rdfs%3Alabel%20%3Flabel%20.%20%7D%20LIMIT%20100';

    var deferred = $q.defer();
    this.ready = deferred.promise;

    this.initialized = false;

    this.init = function() {
      this.doQuery();
    };

    this.doQuery = function() {
      return $http.get(encodeURI(this.knowledgeStoreURL + this.exampleQuery)).then(function(queryResult) {
        console.log(queryResult);
        return queryResult.data;
      }, function (error){
        return error.statusText;
      });
    };

    // this.init();
  }

  angular.module('uncertApp.sparql').service('SparqlService', SparqlService);
})();
