(function() {
  'use strict';

  function QuerySelectorController($scope, $element, dialogPolyfill, QueryBuilderService) {
    var dialog = $element[0].children[1];

    //register the polyfill for old browsers
    if (! dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }
    
    this.queryList = [];

    this.refreshQueries = function() {
        QueryBuilderService.loadQueries();
        QueryBuilderService.ready.then(function() {                    
          this.queryList = QueryBuilderService.getList();

          this.queryList.forEach(function (item) {
            if (item.status === 0) {
              item.statusText = 'Pending';
            } else if (item.status === 1) {
              item.statusText = 'Ready';
            } else {
              item.statusText = 'Error';
            }
          });
        }.bind(this));
    }.bind(this);

    this.queryList = undefined;

    this.refreshQueries = function() {
      QueryBuilderService.loadQueries();

      QueryBuilderService.ready.then(function() {
          this.queryList = QueryBuilderService.getList();

          this.queryList.forEach(function (item) {
            if (item.status === 0) {
              item.statusText = 'Pending';
            } else if (item.status === 1) {
              item.statusText = 'Ready';
            } else {
              item.statusText = 'Error';
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
      QueryBuilderService.getJSON(query.id);
      dialog.close();
    };
  }

  angular.module('uncertApp.querySelector').controller('QuerySelectorController', QuerySelectorController);
})();
