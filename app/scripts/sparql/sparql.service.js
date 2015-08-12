(function() {
  'use strict';

  function SparqlService($q, $http, Messagebus, AuthenticationService) {
    this.knowledgeStoreURL = 'http://localhost:5000/?query=';
    //this.knowledgeStoreURL = 'http://httpbin.org/basic-auth/user/passwd';

    this.exampleQuery = 'SELECT * WHERE {dbpedia:Barack_Obama rdfs:label ?label . } LIMIT 100';
    //this.exampleQuery = '';

    var deferred = $q.defer();
    this.ready = deferred.promise;

    this.initialized = false;

    this.init = function() {
      this.doQuery().then(function success(queryResult) {
        console.log(queryResult);
      });
    };

    this.doQuery = function() {
      return $http.get(encodeURI(this.knowledgeStoreURL + this.exampleQuery));
    };

    // this.init();
  }

  angular.module('uncertApp.sparql').service('SparqlService', SparqlService);
})();
