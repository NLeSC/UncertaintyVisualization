/**
 * @namespace core
 */
(function() {
  'use strict';

  /**
   * @class
   * @memberOf core
   */
  function DataService($http, $q, $log, uncertConf, Messagebus, toastr) {
    var me = this;
    this.data = {};
    var deferred = $q.defer();

    /**
     * Promise for loading the sites remotely.
     * Can be used to perform action when loading sites has been completed.
     *
     * @type {Promise}
     */
    this.ready = deferred.promise;

    /**
     * Load data from server
     *
     * @returns {Promise}
     */
    this.load = function() {
      return $http.get(uncertConf.DATA_JSON_URL).success(this.onLoad).error(this.onLoadFailure);
    };

    /**
     * Load data from server
     *
     * @returns {Promise}
     */
    this.urlload = function(request) {
      $http.get(request.targetScope.fc.query).success(this.onUrlLoad).error(this.onLoadFailure);
    }.bind(this);

    this.onUrlLoad = function(response) {
      me.data = response;
      toastr.success('New data loaded!');
      Messagebus.publish('data loaded');
    };

    this.onLoad = function(response) {
      me.data = response;
      deferred.resolve(response);
      Messagebus.publish('data loaded');
    };

    this.onLoadFailure = function() {
      $log.log('Failed to load data!!');
      toastr.error('Failed to load data!!');
      deferred.reject.apply(this, arguments);
    };

    this.getData = function () {
      return this.data;
    };

    Messagebus.subscribe('data request', this.urlload);
  }

  angular.module('uncertApp.core')
    .service('DataService', DataService);
})();
