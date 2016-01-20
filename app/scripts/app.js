// The app
/* global dc:false, d3:false, crossfilter:false, colorbrewer:false */

(function() {
  'use strict';

  angular.module('uncertApp.dc', [])
    .constant('dc', dc);

  angular.module('uncertApp.d3', [])
    .constant('d3', d3);

  angular.module('uncertApp.D3punchcard', [])
    .constant('D3punchcard', d3.punchcard);

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
      'ui.bootstrap',
      'uncertApp.fileLoading',
      'uncertApp.punchcard'
    ])
    .config(function($compileProvider) {
       // data urls are not allowed by default, so whitelist them
       $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    })
    .run(function(DataService) {
      DataService.load();
    });


  angular.module('uncertApp.templates', []);
  angular.module('uncertApp.utils', ['uncertApp.templates']);
  angular.module('uncertApp.core', ['uncertApp.utils', 'toastr']);
  angular.module('uncertApp.fileLoading', ['uncertApp.core','uncertApp.utils']);
  angular.module('uncertApp.punchcard', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.crossfilter', 'uncertApp.colorbrewer']);
})();
