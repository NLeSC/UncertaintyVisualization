/**
 * @namespace core
 */
(function() {
  'use strict';

  /**
   * @class
   * @memberOf core
   */
  function DataService($http, $q, $log, uncertConf) {
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

    this.onLoad = function(response) {
      me.data = response;

      deferred.resolve(response);
    };

    this.onLoadFailure = function() {
      $log.log('Failed to load data!!');
      deferred.reject.apply(this, arguments);
    };

    this.getData = function () {
      return this.data;
    };
  }

  angular.module('uncertApp.core')
    .service('DataService', DataService);
})();
