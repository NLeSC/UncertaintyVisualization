// The app
/* global N3:false, dc:false, d3:false, crossfilter:false, colorbrewer:false */

(function() {
  'use strict';

  angular.module('uncertApp.n3', [])
    .constant('N3', N3);

  angular.module('uncertApp.dc', [])
    .constant('dc', dc);

  angular.module('uncertApp.d3', [])
    .constant('d3', d3);

  angular.module('uncertApp.crossfilter', [])
    .constant('crossfilter', crossfilter);

  angular.module('uncertApp.colorbrewer', [])
    .constant('colorbrewer', colorbrewer);

  

  /**
   * @ngdoc overview
   * @name uncertApp
   * @description
   * # uncertApp
   *
   * Main module of the application.
   */
  angular
    .module('uncertApp', [
      'ngAnimate',
      'ngSanitize',
      'ngTouch',
      'ngRoute',
      'ngCookies',
      'ui.bootstrap',
      'uncertApp.authentication',
      'uncertApp.rdf',
      'uncertApp.sparql',
      //'uncertApp.text',
      'uncertApp.dcjs'
    ])
    .run(function() {});


  angular.module('uncertApp.templates', []);
  angular.module('uncertApp.utils', ['uncertApp.templates']);
  angular.module('uncertApp.authentication', ['ngCookies']);
  angular.module('uncertApp.sparql', ['uncertApp.utils','uncertApp.authentication']);
  angular.module('uncertApp.rdf', ['uncertApp.n3']);
  angular.module('uncertApp.dcjs', ['uncertApp.dc', 'uncertApp.d3', 'uncertApp.crossfilter', 'uncertApp.colorbrewer']);
})();
