// The app
/* global dc:false, d3:false, crossfilter:false, colorbrewer:false, dialogPolyfill:false */

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngSanitize from 'angular-sanitize';
import ngTouch from 'angular-touch';
import toastr from 'angular-toastr';

import dc from 'dc';
import d3 from 'd3';
import crossfilter from 'crossfilter2';
import colorbrewer from 'colorbrewer';
import dialogPolyfill from 'dialog-polyfill';

import '../../node_modules/dc/dc.min.css';
import '../../node_modules/material-design-lite/material.min.css';
import '../../node_modules/angular-toastr/dist/angular-toastr.css';
import '../../node_modules/dialog-polyfill/dialog-polyfill.css';
import '../styles/main.css';

// import './core/constants';
// import './core/data.service';
// import './core/queryBuilder.service';
// import './selector/selector.directive';

(function () {
  'use strict';
  angular.module('uncertApp.dc', [])
    .constant('dc', dc);

  angular.module('uncertApp.d3', [])
    .constant('d3', d3);

  angular.module('uncertApp.crossfilter', [])
    .constant('crossfilter', crossfilter);

  angular.module('uncertApp.colorbrewer', [])
    .constant('colorbrewer', colorbrewer);

  angular.module('uncertApp.dialogPolyfill', [])
    .constant('dialogPolyfill', dialogPolyfill);

  // import CoreModule from './core/';
  // import SelectorModule from './selector/selector.directive';

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

      'uncertApp.core',
      'uncertApp.selector',

      'uncertApp.viewstorylines',
      'uncertApp.viewrelations',
      'uncertApp.viewperspectives',

      'uncertApp.fileLoading',

      'uncertApp.breadcrumbs',
      'uncertApp.allactorchart',
      'uncertApp.subwaychart',
      'uncertApp.grouprowchart',
      'uncertApp.lanechart',
      'uncertApp.serieschart',
      'uncertApp.datatable',
      'uncertApp.datatableperspectives',

      'uncertApp.pollchart',
      'uncertApp.pollrowchart',
      'uncertApp.polllanechart',

      'uncertApp.allcitationschart',
      'uncertApp.allauthorschart',
      'uncertApp.perspectivelanechart',
      'uncertApp.perspectivefilters',

      'uncertApp.querySelector',

      'uncertApp.charts'
    ])
    .config(function ($compileProvider) {
      // data urls are not allowed by default, so whitelist them
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
    })
    .run(function ($timeout, DataService) {
      angular.element(document).ready(function () {
        DataService.load();
      });
    });



  angular.module('uncertApp.core', []);
  angular.module('uncertApp.templates', []);
  angular.module('uncertApp.utils', ['uncertApp.templates']);

  angular.module('uncertApp.ndx', ['uncertApp.crossfilter', 'uncertApp.utils']);

  angular.module('uncertApp.selector', ['uncertApp.utils']);

  angular.module('uncertApp.viewstorylines', []);
  angular.module('uncertApp.viewrelations', []);
  angular.module('uncertApp.viewperspectives', []);

  angular.module('uncertApp.allactorchart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.subwaychart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.grouprowchart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.lanechart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.colorbrewer', 'uncertApp.ndx']);
  angular.module('uncertApp.serieschart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.datatable', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.datatableperspectives', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);

  angular.module('uncertApp.pollchart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);

  angular.module('uncertApp.pollrowchart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.polllanechart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.colorbrewer', 'uncertApp.ndx']);

  angular.module('uncertApp.allcitationschart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.allauthorschart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);
  angular.module('uncertApp.perspectivelanechart', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.colorbrewer', 'uncertApp.ndx']);
  angular.module('uncertApp.perspectivefilters', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.colorbrewer', 'uncertApp.ndx']);

  angular.module('uncertApp.charts', ['uncertApp.core', 'uncertApp.utils', 'uncertApp.d3', 'uncertApp.dc', 'uncertApp.ndx']);

  angular.module('uncertApp.core', ['uncertApp.utils', 'toastr', 'uncertApp.ndx']);
  angular.module('uncertApp.querySelector', ['uncertApp.dialogPolyfill', 'uncertApp.core', 'uncertApp.utils']);
  angular.module('uncertApp.fileLoading', ['uncertApp.core', 'uncertApp.utils']);

  angular.module('uncertApp.breadcrumbs', ['uncertApp.core', 'uncertApp.dc', 'uncertApp.utils']);

  require('./utils/messagebus.service.js');

  require('./core/constants.js');
  require('./dcjs/dc.baseMixin.js');
  require('./dcjs/dc.customCompositeChart.js');
  require('./dcjs/dc.customSeriesChart.js');
  require('./dcjs/dc.customScatterPlot.js');
  require('./dcjs/dc.customBubbleMixin.js');
  require('./dcjs/dc.customBubbleChart.js');
  require('./dcjs/dc.subwayChart.js');
  require('./dcjs/dc.laneChart.js');
  require('./dcjs/dc.dyndomBubbleChart.js');

  require('./fileloading/fileLoading.controller.js');
  require('./fileloading/fileLoading.directive.js');
  require('./breadcrumbs/breadcrumbs.controller.js');
  require('./breadcrumbs/breadcrumbs.directive.js');

  require('./utils/helperFunctions.service.js');
  require('./crossfilter/ndx.service.js');

  require('./selector/selector.controller.js');
  require('./selector/selector.directive.js');

  require('./viewstorylines/view.storylines.controller.js');
  require('./viewstorylines/view.storylines.directive.js');
  require('./viewrelations/view.relations.controller.js');
  require('./viewrelations/view.relations.directive.js');
  require('./viewperspectives/view.perspectives.controller.js');
  require('./viewperspectives/view.perspectives.directive.js');

  require('./allactorchart/allActorChart.controller.js');
  require('./allactorchart/allActorChart.directive.js');
  require('./subwaychart/subwayChart.controller.js');
  require('./subwaychart/subwayChart.directive.js');
  require('./grouprowchart/groupRowChart.controller.js');
  require('./grouprowchart/groupRowChart.directive.js');
  require('./lanechart/laneChart.controller.js');
  require('./lanechart/laneChart.directive.js');
  require('./serieschart/seriesChart.controller.js');
  require('./serieschart/seriesChart.directive.js');
  require('./datatable/dataTable.controller.js');
  require('./datatable/dataTable.directive.js');
  require('./datatable-perspectives/dataTablePerspectives.controller.js');
  require('./datatable-perspectives/dataTablePerspectives.directive.js');

  require('./pollchart/pollChart.controller.js');
  require('./pollchart/pollChart.directive.js');

  require('./pollrowchart/pollRowChart.controller.js');
  require('./pollrowchart/pollRowChart.directive.js');
  require('./polllanechart/pollLaneChart.controller.js');
  require('./polllanechart/pollLaneChart.directive.js');

  require('./allcitationschart/allCitationsChart.controller.js');
  require('./allcitationschart/allCitationsChart.directive.js');

  require('./allauthorschart/allAuthorsChart.controller.js');
  require('./allauthorschart/allAuthorsChart.directive.js');

  require('./perspectivelanechart/perspectiveLaneChart.controller.js');
  require('./perspectivelanechart/perspectiveLaneChart.directive.js');
  require('./perspectivelanechart/optionSelector.controller.js');
  require('./perspectivelanechart/optionSelector.directive.js');
  require('./perspectivefilters/perspectiveFilters.controller.js');
  require('./perspectivefilters/perspectiveFilters.directive.js');

  require('./fullTextCrossfilterSearch/fullTextCrossfilterSearch.controller.js');
  require('./fullTextCrossfilterSearch/fullTextCrossfilterSearch.directive.js');

  require('./querySelector/querySelector.controller.js');
  require('./querySelector/querySelector.directive.js');

  require('./core/data.service.js');
  require('./core/queryBuilder.service.js');
})();
