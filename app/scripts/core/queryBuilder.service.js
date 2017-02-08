/**
 * @namespace core
 */
(function() {
  'use strict';

  /**
   * @class
   * @memberOf core
   */
  function QueryBuilderService($http, $q, $log, d3, uncertConf, NdxService, Messagebus, toastr) {
    var me = this;
    this.data = {};
    this.deferred = $q.defer();
    this.ready = this.deferred.promise;

    /**
     * Promise for loading the sites remotely.
     * Can be used to perform action when loading sites has been completed.
     *
     * @type {Promise}
     */

    this.reset = function() {
      this.deferred = $q.defer();
      this.ready = this.deferred.promise;
    }.bind(this);

    this.getList = function() {
      return this.data;
    }.bind(this);

    /**
     * Load data from server
     *
     * @returns {Promise}
     */
    this.load = function() {
      // uncertConf.QUERY_BUILDER_SERVER_URL+'queries/'.split(':')[0];

      me.data = $http.get(uncertConf.QUERY_BUILDER_SERVER_URL+'queries/').success(this.onLoad).error(this.onLoadFailure);
    };

    this.onLoad = function(response) {
      me.data = response;
      this.deferred.resolve(response);
      Messagebus.publish('data loaded', this.getData);
      // Messagebus.publish('new data loaded', this.getData);
    }.bind(this);

    this.onLoadFailure = function() {
      $log.log('Failed to load data!!');
      toastr.error('Failed to load data!!');
      this.deferred.reject.apply(this, arguments);
    }.bind(this);

    this.getJSON = function(queryID) {
      console.log('loading query with id ' + queryID);

      $http.get(uncertConf.QUERY_BUILDER_SERVER_URL + 'query/' + queryID).success(this.onJSONLoad).error(this.onJSONLoadFailure);
    };

    this.onJSONLoad = function(response) {
      // var json = JSON.parse(response);
      NdxService.readData(response);
      // Messagebus.publish('data loaded', json);
    }.bind(this);

    this.onJSONLoadFailure = function() {
      $log.log('Failed to load data!!');
      toastr.error('Failed to load data!!');
    }.bind(this);
  }

  angular.module('uncertApp.core')
    .service('QueryBuilderService', QueryBuilderService);
})();
