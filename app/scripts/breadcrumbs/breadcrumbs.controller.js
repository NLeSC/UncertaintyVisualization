(function() {
  'use strict';

  function BreadcrumbsController($scope, Messagebus) {
    var me = this;
    me.charts = {};
    me.filters = [];

    this.click = function(clickElement){
      var filter = '';
      me.filters.forEach(function(f) {
        if (f.filterString === clickElement.filterString) {
          filter = f;
        }
      });
      Messagebus.publish('filterThis', {chart: me.charts[clickElement.chartID], filters:filter.filter});
    };

    Messagebus.subscribe('clearFilters', function(event) {
      me.charts = {};
      me.filters = [];
    });

    Messagebus.subscribe('newFilterEvent', function(event, filterData) {
      var chartID = filterData[0].chartID();
      var chart = filterData[0];
      var dimension = filterData[2];

      me.charts[chartID] = chart;

      $scope.$evalAsync( function() {
        me.filters = [];
        var charts = Object.keys(me.charts);
        charts.forEach(function(chartID) {
          me.charts[chartID].filters().forEach(function(f) {
            me.filters.push(
              {
                chartID: chartID,
                filter: f,
                filterString: f.toString(),
                dimension: dimension
              }
            );
          });
        });
      });

      // console.log(dimension);
      // console.log(filters);
    });
  }

  angular.module('uncertApp.breadcrumbs')
    .controller('BreadcrumbsController', BreadcrumbsController);
})();
