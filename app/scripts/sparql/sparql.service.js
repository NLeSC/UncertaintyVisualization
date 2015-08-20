(function() {
  'use strict';

  function SparqlService($q, $http, AuthenticationService, Messagebus) {
    // this.knowledgeStoreURL = 'https://knowledgestore2.fbk.eu/nwr/cars2/sparql?query=';
    this.knowledgeStoreURL = 'https://shrouded-gorge-9256.herokuapp.com/do_sparql?query=';

    this.queryKnowledgeBase = function(queryStruct) {
      if (queryStruct.requestee === undefined) {
        Messagebus.publish('error', 'queryKnowledgeBase input error, no requestee set');
        return;
      }

      if (queryStruct.url === undefined) {
        Messagebus.publish('queryResult '+queryStruct.requestee, {url:'', status:'error', data:'No struct provided with both requestee and url.'});
        return;
      }

      if (!AuthenticationService.credentialsSet) {
        Messagebus.publish('queryResult '+queryStruct.requestee, {url:queryStruct.url, status:'error', data:'Not logged in.'});
        return;
      }

      var url = this.knowledgeStoreURL + queryStruct.url.replace(/#/g, '%23');

      return $http.get(url).then(function(queryResult) {
        Messagebus.publish('queryResult '+queryStruct.requestee, {url:queryStruct.url, status:'success', data:queryResult.data});
      }, function(error) {
        Messagebus.publish('queryResult '+queryStruct.requestee, {url:queryStruct.url, status:'error', data:error.data.statusText});
      });
    };

    Messagebus.subscribe('query', function(event, queryStruct) {
      this.queryKnowledgeBase(queryStruct);
    }.bind(this));
  }

  angular.module('uncertApp.sparql').service('SparqlService', SparqlService);
})();
