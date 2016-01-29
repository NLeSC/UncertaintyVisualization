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
      DATA_JSON_URL: 'https://raw.githubusercontent.com/NLeSC/UncertaintyVisualization/gh-pages/data/contextual.timeline10-12-eso.json',
    });
})();
