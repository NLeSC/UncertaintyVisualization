(function() {
  'use strict';

  function fileLoadingDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/fileloading/fileLoading.directive.html',
      controller: 'FileController',
      controllerAs: 'fc'
    };
  }

  angular.module('uncertApp.fileLoading').directive('fileLoadingDirective', fileLoadingDirective);
})();
