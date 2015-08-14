(function() {
  'use strict';

  function FormatSparqlBinding($sce){
    return function(input) {
      input = input || {'type': '', 'value': ''};
      if(input.type === 'literal'){
        return input.value;
      }
      if(input.type ==='uri'){
        return $sce.trustAsHtml('<a href="'+input.value+'">'+input.value+'</a>');
      }
      // other, unknow input type
      return input.value;
    };
  }

  angular.module('uncertApp.sparql').filter('formatSparqlBinding', FormatSparqlBinding);
})();
