(function() {
  'use strict';

  function NdxService(crossfilter, Messagebus) {
    this.data = {};
    this.dimensions = [];

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

      Messagebus.publish('crossfilter ready', this.getData);
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
