(function() {
  'use strict';

  function HelperFunctions(d3, Messagebus) {
    //Helper function to get unique elements of an array
    var arrayUnique = function(a) {
      return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) {
          p.push(c);
        }
        return p;
      }, []);
    };

    this.determineUniqueActors = function(data) {
      var concatenatedActors = [];

      var keys = Object.keys(data.actors);
      if (keys.length === 0) {
        concatenatedActors.push('none');
      } else {
        keys.forEach(function(key) {
          var keysActors = data.actors[key];
          keysActors.forEach(function(keysActor) {
            var splitString = keysActor.split(':');
            if (splitString.length > 1) {
              var category = splitString[0];
              var entity = splitString[1];
              if (category === 'nwr-non-entities' || category === 'ne') {
                // concatenatedActors.push(category);
              } else {
                concatenatedActors.push(category + ':' + entity);
              }
            } else {
              concatenatedActors.push(splitString[0]);
            }
          });
        });
      }
      var uniqueActors = arrayUnique(concatenatedActors);

      return uniqueActors;
    };

    var filterFunction = function(dimension, filters) {
      dimension.filter(null);
      if (filters.length === 0) {
        dimension.filter(null);
      } else {
        dimension.filterFunction(function(d) {
          for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            if (filter.isFiltered && filter.isFiltered(d)) {
              return true;
            } else if (filter <= d && filter >= d) {
              return true;
            }
          }
          return false;
        });
      }
      return filters;
    };

    this.customDefaultFilterHandler = function(dimension, filters) {
      Messagebus.publish('newFilterEvent', [this, filters, dimension]);

      return filterFunction(dimension, filters);
    };

    this.symbolScale = d3.scale.ordinal().range(d3.svg.symbolTypes);

    // this.setSymbolScale = function(symbolScale) {
    //   this.symbolScale = symbolScale;
    // };
    //
    // this.getSymbolScale = function() {
    //   return this.symbolScale;
    // };

    this.setGroupColors = function(groupColors) {
      this.groupColors = groupColors;
    };

    this.getGroupColors = function() {
      return this.groupColors;
    };
  }

  angular.module('uncertApp.utils').service('HelperFunctions', HelperFunctions);
})();
