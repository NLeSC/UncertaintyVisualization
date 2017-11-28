(function() {
  'use strict';

  function QuerySelectorController($scope, $element, dialogPolyfill, QueryBuilderService) {
    var dialog = $element[0].children[1];
    this.server = QueryBuilderService.getLogServer();
    this.sortType     = 'name'; // set the default sort type
    this.sortReverse  = false;  // set the default sort order
    this.searchJobs   = '';     // set the default search/filter term

    //register the polyfill for old browsers
    if (! dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }
    
    this.queryList = [];

    this.refreshQueries = function() {
      QueryBuilderService.loadQueries();

      QueryBuilderService.ready.then(function() {
          this.queryList = QueryBuilderService.getList().data;

          this.queryList.forEach(function (item) {
            item.statusText = item.state;
            if (item.state === 'PermanentFailure') {
              item.error = true;
            }
          });
      }.bind(this));
    }.bind(this);

    this.openDialog = function() {
      this.refreshQueries();

      dialog.showModal();
    }.bind(this);

    this.closeDialog = function() {
      // QueryBuilderService.reset();
      dialog.close();
    };

    this.selectQuery = function(query) {
      QueryBuilderService.getJSON(query.output.output.location);
      dialog.close();
    };
  }

  angular.module('uncertApp.querySelector').controller('QuerySelectorController', QuerySelectorController);
})();
