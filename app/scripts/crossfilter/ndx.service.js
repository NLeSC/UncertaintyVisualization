(function() {
  'use strict';

  function NdxService(DataService, $q, dc, crossfilter, Messagebus, uncertConf) {
    this.data = {};
    this.dimensionCache = [];

    var deferred = $q.defer();

    this.ready = deferred.promise;

    this.getData = function() {
      return this.data;
    };

    this.getSize = function() {
      return this.ndx.size();
    };

    this.readData = function(data) {
      this.resetData();

      //Crossfilter initialization
      this.data = data;
      this.ndx = crossfilter(data.timeline.events);

      if (uncertConf.POLLS) {
        this.ndxPolls = crossfilter(data.timeline.polls);
      }

      deferred.resolve();
      dc.renderAll();
    };

    this.buildDimension = function(keyAccessor) {
      var newDimension = this.ndx.dimension(keyAccessor);
      this.dimensionCache.push(newDimension);
      return newDimension;
    };

    this.resetData = function() {
      this.dimensionCache.forEach(function(d) {
        d.filter(null);
        d.dispose();
      });

      if (this.ndx) {
        this.ndx.remove();
      }

      Messagebus.publish('clearFilters');
    };

    DataService.ready.then(function(newData) {
      if (this.ndx && this.data && newData && this.data !== newData) {
        this.resetData();
        this.readData(newData);
      } else {
        this.readData(newData);
      }
    }.bind(this));
  }

  angular.module('uncertApp.ndx').service('NdxService', NdxService);
})();
