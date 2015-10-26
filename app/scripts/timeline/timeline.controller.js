(function() {
  'use strict';
  var CHARTWIDTH = 1000;
  var CHARTHEIGHT = 360;
  var ID = 'TODOid';
  var NAME = 'TODOchart';

  function Actor(name, id, group) {
    this.name = name;
    this.id = id;
    this.group = group;
    this.groupPtr = null;
    this.firstScene = null;
    this.groupPositions = {};
    this.groupNamePositions = {};
  }

  function TimelineController(d3) {
    function readData(filename) {
      var margin = {top: 20, right: 25, bottom: 20, left: 1};
    	var width = CHARTWIDTH - margin.left - margin.right;
	    var height = CHARTHEIGHT - margin.top - margin.bottom;


      d3.json(filename, function(j) {
        var jActors = j.timeline.actors;
        var jEvents = j.timeline.events;


        var svg = d3.select('#timelineChart').append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy', '.35em')
          .attr('text-anchor', 'end')
          .attr('class', 'chart-title')
          .attr('transform', null)
          .attr('id', ID)
          .text(' - ' + name)
          .data([{
            name: ' - ' + name
          }])
          .style('display', 'block');

        var svg = d3.select('#timelineChart').append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .attr('class', 'timelineChart')
          .attr('id', ID)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

          var actors = [];
          var groups = [];
          var actorMap = []; // maps id to pointer
          for (var i = 0; i < jActors.length; i++) {
            var nameArray = jActors[i].name.split('/');
            var actorName = nameArray[nameArray.length-1];
            var group = nameArray[nameArray.length-2];
            if (groups.indexOf(group) < 0) {
              groups.push(group);
            }

            actors[actors.length] = new Actor(actorName, jActors[i].name, group);
            actorMap[jActors[i].name] = actors[actors.length - 1];
          }

        debugger;
      });
    }
    readData('data/airbus_contextual.timeline.json');
  }

  angular.module('uncertApp.timeline').controller('TimelineController', TimelineController);
})();
