(function() {
  'use strict';

  function NdxService(DataService, $q, crossfilter, Messagebus, uncertConf) {
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

      if (uncertConf.POLLS) {
        this.ndxPolls = crossfilter(data.timeline.polls);
      }

      deferred.resolve();
    };

    this.pollDimension = function(keyAccessor) {
      var newDimension = null;

      if (uncertConf.POLLS) {
        newDimension =  this.ndxPolls.dimension(keyAccessor);
        this.pollDimensions.push(newDimension);
      }

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
      this.ndx.remove();

      if (uncertConf.POLLS) {
        this.pollDimensions.forEach(function(d) {
          d.filter(null);
          d.dispose();
        });
        this.ndxPolls.remove();
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

    // Messagebus.subscribe('data loaded', function (event, newDataGetter) {
    //   var newData = newDataGetter();
    //   if (this.ndx && this.data && newData && this.data !== newData) {
    //     this.resetData();
    //     this.readData(newData);
    //   } else {
    //     this.readData(newData);
    //   }
    // }.bind(this));
  }

  angular.module('uncertApp.ndx').service('NdxService', NdxService);
})();
