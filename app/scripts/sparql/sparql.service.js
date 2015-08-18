(function() {
  'use strict';

  function SparqlService($q, $http, AuthenticationService, Messagebus) {
    // this.knowledgeStoreURL = 'https://knowledgestore2.fbk.eu/nwr/cars2/sparql?query=';
    this.knowledgeStoreURL = 'https://shrouded-gorge-9256.herokuapp.com/do_sparql?query=';

    var deferred = $q.defer();
    this.ready = deferred.promise;

    this.datasets = ['cars', 'cars2', 'dutchhouse', 'wikinews'];

    this.credentialsSet = false;
    AuthenticationService.ready.then(function() {
      this.credentialsSet = true;
    }.bind(this));

    Messagebus.subscribe('query', function(event, queryStruct) {
      if (!this.credentialsSet) {
        Messagebus.publish('queryResult '+queryStruct.requestee, {url:queryStruct.url, status:'error', data:'Not logged in.'});
        return;
      }

      var url = this.knowledgeStoreURL + queryStruct.url.replace(/#/g, '%23');

      return $http.get(url).then(function(queryResult) {
        Messagebus.publish('queryResult '+queryStruct.requestee, {url:queryStruct.url, status:'success', data:queryResult});
      }, function(error) {
        Messagebus.publish('queryResult '+queryStruct.requestee, {url:queryStruct.url, status:'error', data:error.statusText});
      });

    }.bind(this));
  }

  angular.module('uncertApp.sparql').service('SparqlService', SparqlService);
})();
