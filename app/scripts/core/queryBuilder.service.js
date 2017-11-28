/**
 * @namespace core
 */
(function() {
  'use strict';

  function QueryBuilderService($http, $q, $log, d3, uncertConf, NdxService, Messagebus, toastr) {
    var me = this;
    this.data = {};
    this.deferred = $q.defer();
    this.ready = this.deferred.promise;

    this.reset = function() {
      this.deferred = $q.defer();
      this.ready = this.deferred.promise;
    }.bind(this);

    this.getList = function() {
      return this.data;
    }.bind(this);

    this.loadQueries = function() {
      this.reset();
      me.data = $http.get(uncertConf.QUERY_BUILDER_SERVER_URL+'jobs/').then(this.onLoadQueries, this.onLoadQueriesFailure);
    };

    this.onLoadQueries = function(response) {
      me.data = response;
      this.deferred.resolve(response);
    }.bind(this);

    this.onLoadQueriesFailure = function() {
      $log.log('Failed to load data!!');
      toastr.error('Failed to load data!!');
      this.deferred.reject.apply(this, arguments);
    }.bind(this);

    this.getJSON = function(outputLocation) {
      $http.get(outputLocation).then(this.onJSONLoad, this.onJSONLoadFailure);
    };

    this.onJSONLoad = function(response) {      
      NdxService.readData(response.data);
      Messagebus.publish('data loaded');
    }.bind(this);

    this.onJSONLoadFailure = function() {
      $log.log('Failed to load data!!');
      toastr.error('Failed to load data!!');
    }.bind(this);

    this.getLogServer = function() {
      return uncertConf.QUERY_BUILDER_SERVER_URL;
    }
  }

  angular.module('uncertApp.core')
    .service('QueryBuilderService', QueryBuilderService);
})();
