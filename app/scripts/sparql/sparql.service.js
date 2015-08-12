(function() {
  'use strict';

  function SparqlService($q, $http, Messagebus, AuthenticationService) {
    this.knowledgeStoreURL = 'http://localhost:5000/?';
    //this.knowledgeStoreURL = 'http://httpbin.org/basic-auth/user/passwd';

    this.exampleQuery = 'query=SELECT%20*%20WHERE%20%7Bdbpedia%3ABarack_Obama%20rdfs%3Alabel%20%3Flabel%20.%20%7D%20LIMIT%20100';
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
      return $http.get(this.knowledgeStoreURL + this.exampleQuery);
    };

    // this.init();
  }

  angular.module('uncertApp.sparql').service('SparqlService', SparqlService);
})();
