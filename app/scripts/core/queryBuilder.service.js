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
      // this.ready = this.deferred.promise;
    }.bind(this);

    this.getList = function() {
      return this.data;
    }.bind(this);

    this.loadQueries = function() {
      me.data = $http.get(uncertConf.QUERY_BUILDER_SERVER_URL+'jobs/').success(this.onLoadQueries).error(this.onLoadQueriesFailure);
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

    this.getJSON = function(queryID) {
      $http.get(uncertConf.QUERY_BUILDER_SERVER_URL + 'jobs/' + queryID).success(this.onJSONLoad).error(this.onJSONLoadFailure);
    };

    this.onJSONLoad = function(response) {
      NdxService.readData(response);
      Messagebus.publish('data loaded');
    }.bind(this);

    this.onJSONLoadFailure = function() {
      $log.log('Failed to load data!!');
      toastr.error('Failed to load data!!');
    }.bind(this);
  }

  angular.module('uncertApp.core')
    .service('QueryBuilderService', QueryBuilderService);
})();
