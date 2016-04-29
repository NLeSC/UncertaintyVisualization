// The app
/* global dc:false, d3:false, crossfilter:false, colorbrewer:false */

(function() {
  'use strict';

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
      'ui.bootstrap',
      'uncertApp.fileLoading',
      // 'uncertApp.punchcard',
      'uncertApp.breadcrumbs',
      'uncertApp.allactorchart',
      'uncertApp.subwaychart',
      'uncertApp.grouprowchart',
      'uncertApp.lanechart',
      'uncertApp.serieschart',
      'uncertApp.datatable',

      'uncertApp.pollrowchart',
      'uncertApp.polllanechart',

      'uncertApp.allcitationschart',
      'uncertApp.allauthorschart',
      'uncertApp.perspectivelanechart'
    ])
    .config(function($compileProvider) {
       // data urls are not allowed by default, so whitelist them
       $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    })
    .run(function($timeout, DataService) {
      angular.element(document).ready(function () {
        $timeout(DataService.load(), 1000);
      });
    });


  angular.module('uncertApp.templates', []);
  angular.module('uncertApp.utils', ['uncertApp.templates']);

  angular.module('uncertApp.ndx', ['uncertApp.crossfilter','uncertApp.utils']);
  angular.module('uncertApp.allactorchart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.subwaychart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.grouprowchart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.lanechart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.colorbrewer', 'uncertApp.ndx']);
  angular.module('uncertApp.serieschart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.datatable', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);

  angular.module('uncertApp.pollrowchart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.polllanechart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.colorbrewer', 'uncertApp.ndx']);

  angular.module('uncertApp.allcitationschart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.allauthorschart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.perspectivelanechart', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.colorbrewer', 'uncertApp.ndx']);

  angular.module('uncertApp.core', ['uncertApp.utils', 'toastr', 'uncertApp.ndx']);
  angular.module('uncertApp.fileLoading', ['uncertApp.core','uncertApp.utils']);
  // angular.module('uncertApp.punchcard', ['uncertApp.core','uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.crossfilter', 'uncertApp.colorbrewer']);
  angular.module('uncertApp.breadcrumbs', ['uncertApp.core', 'uncertApp.dc', 'uncertApp.utils']);
})();
