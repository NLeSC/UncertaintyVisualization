(function() {
  'use strict';

  function FileController(toastr) {
    this.query = '';

    this.clear = function() {
      this.query = '';
    };

    this.open = function() {
      toastr.error('Search' + this.query);
      // BingGeoCoderService.geocode(this.query).then(
      //   this.onLocationResponse.bind(this),
      //   function() {
      //     toastr.error('Search failed', 'for some reason');
      //   }
      // );
    };

    /**
     * When enter is pressed inside input field perform a search
     */
    this.onQueryKeyPress = function($event) {
      var enterCode = 13;
      if ($event.keyCode === enterCode) {
        this.open();
      }
    };
  }

  angular.module('uncertApp.fileLoading')
    .controller('FileController', FileController);
})();
