import angular from 'angular';

angular.module('uncertApp.core')
  .constant('uncertConf', {
    DATA_JSON_URL: 'file:data/fromServer.json',
    QUERY_BUILDER_SERVER_URL: '/xenon/',
    //QUERY_BUILDER_SERVER_URL: 'http://0.0.0.0/xenon/',
    
    POLLS: false,

    CHART_DIMENSIONS: {
      storylineChartMaxWidth: 1280,
      storylineChartBarHeight: 75,
      storylineChartMaxRows: 10,
      storylineChartGapHeight: 1,
      storylineChartMargins: {
        top: 0,
        bottom: -1,
        right: 0,
        left: 0
      },

      relationsChartMaxWidth: 1280,
      relationsChartBarHeight: 15,
      relationsChartMaxRows: 1000,
      relationsChartGapHeight: 1,
      relationsChartMargins: {
        top: 0,
        bottom: -1,
        right: 0,
        left: 0
      },

      perspectiveChartMaxWidth: 1280,
      perspectiveChartBarHeight: 15,
      perspectiveChartMaxRows: 1000,
      perspectiveChartGapHeight: 1,
      perspectiveChartMargins: {
        top: 0,
        bottom: -1,
        right: 0,
        left: 0
      },

      perspectiveBubbleChartMaxWidth: 1280,
      perspectiveBubbleChartBarHeight: 75,
      perspectiveBubbleChartMaxRows: 1000,
      perspectiveBubbleChartGapHeight: 1,
      perspectiveBubbleChartMargins: {
        top: 0,
        bottom: -1,
        right: 0,
        left: 0
      }
    }
  });
