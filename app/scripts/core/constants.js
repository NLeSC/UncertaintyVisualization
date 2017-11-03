/**
 * Constants of core module
 *
 * @namespace core
 */
(function() {
  'use strict';

  angular.module('uncertApp.core')
    /**
     * @class core.pattyConf
     * @memberOf core
     */
    .constant('uncertConf', {
      // to work without server uncomment below
      // SITES_JSON_URL: 'data/sites.json',
      /**
       * Url for json file with data url
       *
       * @type {String}
       * @memberof core.uncertConf
       */
      DATA_JSON_URL: 'file:data/fromServer.json',
      QUERY_BUILDER_SERVER_URL: 'http://localhost:8080/',
      
      // DATA_JSON_URL: 'https://raw.githubusercontent.com/NLeSC/UncertaintyVisualization/gh-pages/data/contextual.timeline04-02.json',
      // DATA_JSON_URL: 'https://raw.githubusercontent.com/NLeSC/UncertaintyVisualization/narratives/app/data/embodied_0202.json',
      // DATA_JSON_URL: 'file:data/contextual.timeline-05-07.json',
      POLLS: false,

      CHART_DIMENSIONS: {
        storylineChartMaxWidth: 1280,
        storylineChartBarHeight: 75,
        storylineChartMaxRows: 10,
        storylineChartGapHeight: 1,
        storylineChartMargins: {top: 0, bottom: -1, right: 0, left: 0},

        relationsChartMaxWidth: 1280,
        relationsChartBarHeight: 15,
        relationsChartMaxRows: 1000,
        relationsChartGapHeight: 1,
        relationsChartMargins: {top: 0, bottom: -1, right: 0, left: 0},

        perspectiveChartMaxWidth: 1280,
        perspectiveChartBarHeight: 15,
        perspectiveChartMaxRows: 1000,
        perspectiveChartGapHeight: 1,
        perspectiveChartMargins: {top: 0, bottom: -1, right: 0, left: 0},

        perspectiveBubbleChartMaxWidth: 1280,
        perspectiveBubbleChartBarHeight: 75,
        perspectiveBubbleChartMaxRows: 1000,
        perspectiveBubbleChartGapHeight: 1,
        perspectiveBubbleChartMargins: {top: 0, bottom: -1, right: 0, left: 0}
      }
    });
})();
