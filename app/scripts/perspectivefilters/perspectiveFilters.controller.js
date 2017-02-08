(function() {
  'use strict';

  function PerspectiveFiltersController($window, $element, d3, dc, colorbrewer, NdxService, Messagebus) {
    this.initializeChart = function() {
      var beliefChart = dc.barChart('#'+$element[0].children[0].children[0].attributes.id.value);
      var certaintyChart = dc.barChart('#'+$element[0].children[0].children[1].attributes.id.value);
      var possibilityChart = dc.barChart('#'+$element[0].children[0].children[2].attributes.id.value);
      var sentimentChart = dc.barChart('#'+$element[0].children[0].children[3].attributes.id.value);
      var whenChart = dc.barChart('#'+$element[0].children[0].children[4].attributes.id.value);

      // BELIEF

      var beliefDimension = NdxService.buildDimension(function(d) {
        var belief = 0;
        var keys = Object.keys(d.mentions);
        keys.forEach(function(key) {
          var mention = d.mentions[key];
          mention.perspective.forEach(function(perspective) {
            var attribution = perspective.attribution;
            if (attribution.belief === 'confirm') {
              belief += 1;
            } else if (attribution.belief === 'denial') {
              belief -= 1;
            } else if (attribution.belief === 'deny') {
              belief -= 1;
            }
          });
        });
        return belief;
      });

      var widthPerChart = (Math.min($window.innerWidth, 1280) * (7/12) - 16)/5;

      var beliefGroup = beliefDimension.group();

      beliefChart
        .width(widthPerChart)
        .height(100)
        .margins({
          top: 0,
          right: 0,
          bottom: 20,
          left: 0
        })
        .x(d3.scale.linear().domain([-5,5]))
        .y(d3.scale.sqrt().domain([0,25]))
        .colors(colorbrewer.RdBu[3])
        .colorDomain([-1, 1])
        .colorAccessor(function(d) {
          return d.key;
        })
        .elasticY(true)
        .brushOn(true)
        .dimension(beliefDimension)
        .group(beliefGroup)
        .controlsUseVisibility(true);

      // CERTAINTY

      var certaintyDimension = NdxService.buildDimension(function(d) {
        var certainty = 0;
        var keys = Object.keys(d.mentions);
        keys.forEach(function(key) {
          var mention = d.mentions[key];
          mention.perspective.forEach(function(perspective) {
            var attribution = perspective.attribution;
            if (attribution.certainty === 'certain') {
              certainty += 1;
            } else if (attribution.certainty === 'uncertain') {
              certainty -= 1;
            }
          });
        });
        return certainty;
      });

      var certaintyGroup = certaintyDimension.group();

      certaintyChart
        .width(widthPerChart)
        .height(100)
        .margins({
          top: 0,
          right: 0,
          bottom: 20,
          left: 0
        })
        .x(d3.scale.linear().domain([-5,5]))
        .y(d3.scale.sqrt().domain([0,25]))
        .colors(colorbrewer.RdBu[3])
        .colorDomain([-1, 1])
        .colorAccessor(function(d) {
          return d.key;
        })
        .elasticY(true)
        .brushOn(true)
        .dimension(certaintyDimension)
        .group(certaintyGroup)
        .controlsUseVisibility(true);

      // POSSIBILITY

      var possibilityDimension = NdxService.buildDimension(function(d) {
        var possibility = 0;
        var keys = Object.keys(d.mentions);
        keys.forEach(function(key) {
          var mention = d.mentions[key];
          mention.perspective.forEach(function(perspective) {
            var attribution = perspective.attribution;
            if (attribution.possibility === 'likely') {
              possibility += 1;
            } else if (attribution.possibility === 'unlikely') {
              possibility -= 1;
            }
          });
        });
        return possibility;
      });

      var possibilityGroup = possibilityDimension.group();

      possibilityChart
        .width(widthPerChart)
        .height(100)
        .margins({
          top: 0,
          right: 0,
          bottom: 20,
          left: 0
        })
        .x(d3.scale.linear().domain([-5,5]))
        .y(d3.scale.sqrt().domain([0,25]))
        .colors(colorbrewer.RdBu[3])
        .colorDomain([-1, 1])
        .colorAccessor(function(d) {
          return d.key;
        })
        .elasticY(true)
        .brushOn(true)
        .dimension(possibilityDimension)
        .group(possibilityGroup)
        .controlsUseVisibility(true);

      // SENTIMENT

      var sentimentDimension = NdxService.buildDimension(function(d) {
      var sentiment = 0;
      var keys = Object.keys(d.mentions);
      keys.forEach(function(key) {
        var mention = d.mentions[key];
        mention.perspective.forEach(function(perspective) {
          var attribution = perspective.attribution;
          if (attribution.sentiment === 'positive') {
            sentiment += 1;
          } else if (attribution.sentiment === 'negative') {
            sentiment -= 1;
          }
        });
      });
      return sentiment;
      });

      var sentimentGroup = sentimentDimension.group();

      sentimentChart
        .width(widthPerChart)
        .height(100)
        .margins({
          top: 0,
          right: 0,
          bottom: 20,
          left: 0
        })
        .x(d3.scale.linear().domain([-5,5]))
        .y(d3.scale.sqrt().domain([0,25]))
        .colors(colorbrewer.RdBu[3])
        .colorDomain([-1, 1])
        .colorAccessor(function(d) {
          return d.key;
        })
        .elasticY(true)
        .brushOn(true)
        .dimension(sentimentDimension)
        .group(sentimentGroup)
        .controlsUseVisibility(true);

        // WHEN

        var whenDimension = NdxService.buildDimension(function(d) {
        var when = 0;
        var keys = Object.keys(d.mentions);
        keys.forEach(function(key) {
          var mention = d.mentions[key];
          mention.perspective.forEach(function(perspective) {
            var attribution = perspective.attribution;
            if (attribution.when === 'future') {
              when += 1;
            } else if (attribution.when === 'past') {
              when -= 1;
            }
          });
        });
        return when;
        });

        var whenGroup = whenDimension.group();

        whenChart
        .width(widthPerChart)
          .height(100)
          .margins({
            top: 0,
            right: 0,
            bottom: 20,
            left: 0
          })
          .x(d3.scale.linear().domain([-5,5]))
          .y(d3.scale.sqrt().domain([0,25]))
          .colors(colorbrewer.RdBu[3])
          .colorDomain([-1, 1])
          .colorAccessor(function(d) {
            return -d.key;
          })
          .elasticY(true)
          .brushOn(true)
          .dimension(whenDimension)
          .group(whenGroup)
          .controlsUseVisibility(true);

      beliefChart.render();
      certaintyChart.render();
      possibilityChart.render();
      sentimentChart.render();
      whenChart.render();
    };

    NdxService.ready.then(function() {
      this.initializeChart();
    }.bind(this));

    Messagebus.subscribe('data loaded', function() {
      NdxService.ready.then(function() {
        this.initializeChart();
      }.bind(this));
    }.bind(this));
  }

  angular.module('uncertApp.perspectivefilters').controller('PerspectiveFiltersController', PerspectiveFiltersController);
})();
