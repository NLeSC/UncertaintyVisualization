(function() {
  'use strict';

  function NdxService($q, crossfilter, Messagebus) {
    this.data = {};
    this.dimensions = [];

    this.pollDimensions = [];

    var deferred = $q.defer();

    this.ready = deferred.promise;

    this.getData = function() {
      return this.data;
    };

    this.getSize = function() {
      return this.ndx.size();
    };

    this.readData = function(data) {
      //Crossfilter initialization
      this.data = data;
      this.ndx = crossfilter(data.timeline.events);
      this.ndxPolls = crossfilter(data.timeline.polls);

      Messagebus.publish('crossfilter ready', this.getData);

      deferred.resolve();
    };

    this.pollDimension = function(keyAccessor) {
      var newDimension = this.ndxPolls.dimension(keyAccessor);
      this.pollDimensions.push(newDimension);
      return newDimension;
    };

    this.buildDimension = function(keyAccessor) {
      var newDimension = this.ndx.dimension(keyAccessor);
      this.dimensions.push(newDimension);
      return newDimension;
    };

    this.resetData = function() {
      this.dimensions.forEach(function(d) {
        d.filter(null);
        d.dispose();
      });
      this.pollDimensions.forEach(function(d) {
        d.filter(null);
        d.dispose();
      });
      this.ndx.remove();
      this.ndxPolls.remove();
      Messagebus.publish('clearFilters');
    };

    Messagebus.subscribe('data loaded', function (event, newDataGetter) {
      var newData = newDataGetter();
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
