// The app
/* global N3:false, dc:false, d3:false, crossfilter:false, colorbrewer:false, _:false */

(function() {
  'use strict';

  angular.module('uncertApp.n3', [])
    .constant('N3', N3);

  angular.module('uncertApp.dc', [])
    .constant('dc', dc);

  angular.module('uncertApp.d3', [])
    .constant('d3', d3);

  angular.module('uncertApp._', [])
    .constant('_', _);

  angular.module('uncertApp.D3punchcard', [])
    .constant('D3punchcard', d3.punchcard);

  angular.module('uncertApp.crossfilter', [])
    .constant('crossfilter', crossfilter);

  angular.module('uncertApp.colorbrewer', [])
    .constant('colorbrewer', colorbrewer);

  // Modules dependent on d3
  // angular.module('uncertApp.d3', [])
  //   .factory('d3Service', ['$document', '$window', '$q', '$rootScope',
  //     function($document, $window, $q, $rootScope) {
  //       var d = $q.defer(),
  //         d3service = {
  //           d3: function() {
  //             return d.promise;
  //           }
  //         };
  //
  //       function onScriptLoad() {
  //         // Load client in the browser
  //         $rootScope.$apply(function() {
  //           d.resolve($window.d3);
  //         });
  //       }
  //       var scriptTag = $document[0].createElement('script');
  //       scriptTag.type = 'text/javascript';
  //       scriptTag.async = true;
  //       scriptTag.src = 'http://d3js.org/d3.v3.min.js';
  //       scriptTag.onreadystatechange = function() {
  //         if (this.readyState === 'complete') {
  //           onScriptLoad();
  //         }
  //       };
  //       scriptTag.onload = onScriptLoad;
  //
  //       var s = $document[0].getElementsByTagName('body')[0];
  //       s.appendChild(scriptTag);
  //
  //       return d3service;
  //     }
  //   ]);

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
      'uncertApp.dcjs',
      'uncertApp.timeline',
      'uncertApp._',
      'uncertApp.punchcard'
    ])
    .run(function() {});


  angular.module('uncertApp.templates', []);
  angular.module('uncertApp.utils', ['uncertApp.templates']);
  angular.module('uncertApp.authentication', ['ngCookies']);
  angular.module('uncertApp.sparql', ['uncertApp.utils','uncertApp.authentication']);
  angular.module('uncertApp.rdf', ['uncertApp.n3']);
  angular.module('uncertApp.dcjs', ['uncertApp.dc', 'uncertApp.d3', 'uncertApp.crossfilter', 'uncertApp.colorbrewer']);
  angular.module('uncertApp.timeline', ['uncertApp.d3']);
  angular.module('uncertApp.punchcard', ['uncertApp.d3', 'uncertApp.dc', 'uncertApp.crossfilter', 'uncertApp.colorbrewer']);
})();
