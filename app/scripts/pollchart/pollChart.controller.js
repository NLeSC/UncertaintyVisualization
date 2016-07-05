(function() {
  'use strict';

  function PollChartController($element, d3, dc, colorbrewer, NdxService, HelperFunctions, Messagebus, uncertConf) {
    this.initializeChart = function() {
      var stackedAreaChart = dc.lineChart('#' + $element[0].children[0].attributes.id.value);
      // var volumeChart = dc.barChart('#' + $element[0].children[0].attributes.id.value + '-volume');
      var timeMin = undefined;
      var timeMax = undefined;

      //The dimension for the stackedAreaChart. We use time for x and group for y,
      //and bin everything in the same group number and day.
      var laneTimeDimension = NdxService.pollDimension(function(d) {
        var time = d3.time.format('%Y%m%d').parse(d.time);

        if (timeMin && timeMax) {
          if (time < timeMin) {
            timeMin = time;
          }
          if (time > timeMax) {
            timeMax = time;
          }
        } else {
          timeMin = time;
          timeMax = time;
        }

        return time;
      });

      //The group for the stackedAreaChart. Weneed the climax score to size
      //the bubbles, the rest is for labeling and hover information. We use a
      //custom reduce funtion here to gather all the info we need.
      var stayGroup = laneTimeDimension.group().reduce(
        //Add something to our temporary collection
        function(p, v) {
          var labels = v.labels[0];
          var splitLabels = labels.split(':');

          p.value = (p.value || 0) + (+splitLabels[0]);

          return p;
        },
        //Remove something from our temporary collection, (basically do
        //everything in the add step, but then in reverse).
        function(p, v) {
          var labels = v.labels[0];
          var splitLabels = labels.split(':');

          p.value = (p.value || 0) - (+splitLabels[0]);

          return p;
        },
        //Set up the inital data structure.
        function() {
          return {
            value: 0
          };
        }
      );
      var leaveGroup = laneTimeDimension.group().reduce(
        //Add something to our temporary collection
        function(p, v) {
          var labels = v.labels[0];
          var splitLabels = labels.split(':');

          p.value = (p.value || 0) + (+splitLabels[1]);

          return p;
        },
        //Remove something from our temporary collection, (basically do
        //everything in the add step, but then in reverse).
        function(p, v) {
          var labels = v.labels[0];
          var splitLabels = labels.split(':');

          p.value = (p.value || 0) - (+splitLabels[1]);

          return p;
        },
        //Set up the inital data structure.
        function() {
          return {
            value: 0
          };
        }
      );
      var undecidedGroup = laneTimeDimension.group().reduce(
        //Add something to our temporary collection
        function(p, v) {
          var labels = v.labels[0];
          var splitLabels = labels.split(':');

          p.value = (p.value || 0) + (+splitLabels[2]);

          return p;
        },
        //Remove something from our temporary collection, (basically do
        //everything in the add step, but then in reverse).
        function(p, v) {
          var labels = v.labels[0];
          var splitLabels = labels.split(':');

          p.value = (p.value || 0) - (+splitLabels[2]);

          return p;
        },
        //Set up the inital data structure.
        function() {
          return {
            value: 0
          };
        }
      );

      //Set up the
      stackedAreaChart
      .renderArea(true)

      //Sizes in pixels
      .width(parseInt($element[0].getClientRects()[1].width, 10))
      .height(100)
      .margins({
        top: 10,
        right: 0,
        bottom: 20,
        left: 0
      })
      //The time this chart takes to do its animations.
      .transitionDuration(1500)

      //Bind data
      .dimension(laneTimeDimension)

      .x(d3.time.scale().domain([timeMin, timeMax]))
      .y(d3.scale.linear().domain([0,100]))

      .renderDataPoints(true)


      .renderHorizontalGridLines(true)


      .legend(dc.legend().x(10).y(10).itemHeight(13).gap(5))
      .brushOn(false)

      .group(stayGroup, 'Stay')
      .valueAccessor(function(d) {
        return d.value.value;
      })
      .stack(undecidedGroup, 'Undecided', function(d) {
        return d.value.value;
      })
      .stack(leaveGroup, 'Leave', function(d) {
        return d.value.value;
      })

      .ordinalColors(['rgb(20, 0, 255)','rgb(111, 111, 111)','rgb(255, 0, 0)']);


      // dc.override(stackedAreaChart, 'onClick', onClickOverride);
      stackedAreaChart.render();

      Messagebus.subscribe('newFilterEvent', function(event, filterData) {
        var minDate;
        var maxDate;

        if (filterData[0].filters) {
          filterData[0].filters().forEach(function(f) {
            if (f.filterType === 'RangedTwoDimensionalFilter') {
              minDate = f[0][0];
              maxDate = f[1][0];
            }
          });
        }


        if (minDate && maxDate) {
          stackedAreaChart.x(d3.time.scale().domain([minDate, maxDate]));
        } else {
          stackedAreaChart.x(d3.time.scale().domain([timeMin, timeMax]));
        }

        stackedAreaChart.render();
      });
    };

    Messagebus.subscribe('crossfilter ready', function() {
      if (uncertConf.POLLS) {
        this.initializeChart();
      }

    }.bind(this));
  }

  angular.module('uncertApp.pollchart').controller('PollChartController', PollChartController);
})();
