(function() {
  'use strict';

  function FullTextCrossfilterSearchController($scope, $element, d3, dc, NdxService, HelperFunctions, Messagebus) {
    this.input ='';

    this.initializeClass = function(jsonFields, chartHeader) {
      this.jsonFields = jsonFields;
      this.chartHeader = chartHeader;
    };
    

    this.applyFilter = function() {
      var key = this.input;

      this.dimension.filterAll();
      if (key !== '') {
        var filters = [key];
        this.dimension.filterFunction(function(d) {
          var result = false;
          var filterString = filters[0];
          d.forEach(function(dim) {
            var re = new RegExp(filterString, 'i');
            if (result !== true && dim !== undefined && dim !== null && dim.search(re) !== -1) {
              result = true;
            }
          });
          return result;
        });
      }

      dc.redrawAll();
    };

    this.initializeChart = function() {
      var fields = this.jsonFields.split(',');
      fields.forEach(function (field, index) {
        fields[index] = field.trim();
      });

      this.dimension = HelperFunctions.buildDimensionWithProperties(NdxService, fields);
    };

    this.linkedInit = function(jsonFields, chartHeader) {
      NdxService.ready.then(function() {
        this.initializeClass(jsonFields, chartHeader);
        this.initializeChart();
      }.bind(this));
    };

    Messagebus.subscribe('data loaded', function() {
      NdxService.ready.then(function() {        
        this.initializeChart();
      }.bind(this));
    }.bind(this));
  }

  angular.module('uncertApp.charts').controller('FullTextCrossfilterSearchController', FullTextCrossfilterSearchController);
})();
