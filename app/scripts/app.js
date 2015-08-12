// The app
/* global N3:false */

(function() {
  'use strict';

  angular.module('uncertApp.n3', [])
    .constant('N3', N3);

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
      //'uncertApp.sparql',
      'uncertApp.text'
    ])
    .run(function() {
    });


  angular.module('uncertApp.templates', []);
  angular.module('uncertApp.utils', ['uncertApp.templates']);
  angular.module('uncertApp.authentication', ['ngCookies']);
  angular.module('uncertApp.sparql', ['uncertApp.utils','uncertApp.authentication']);
  angular.module('uncertApp.text', ['uncertApp.sparql', 'uncertApp.utils']);
  angular.module('uncertApp.rdf', ['uncertApp.n3']);
})();
