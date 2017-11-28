(function() {
  'use strict';

  function fileLoadingDirective() {
    return {
      restrict: 'EA',
      template: require('./fileLoading.directive.html'),
      controller: 'FileController',
      controllerAs: 'fc'
    };
  }

  angular.module('uncertApp.fileLoading').directive('fileLoadingDirective', fileLoadingDirective);
})();
