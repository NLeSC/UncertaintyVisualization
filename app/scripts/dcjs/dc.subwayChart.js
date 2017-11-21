import dc from 'dc';
/**
 * A concrete implementation of a general purpose bubble chart that allows data visualization using the
 * following dimensions:
 * - x axis position
 * - y axis position
 * - bubble radius
 * - color
 * Examples:
 * - {@link http://dc-js.github.com/dc.js/ Nasdaq 100 Index}
 * - {@link http://dc-js.github.com/dc.js/vc/index.html US Venture Capital Landscape 2011}
 * @name subwayChart
 * @memberof dc
 * @mixes dc.bubbleMixin
 * @mixes dc.coordinateGridMixin
 * @example
 * // create a bubble chart under #chart-container1 element using the default global chart group
 * var subwayChart1 = dc.subwayChart('#chart-container1');
 * // create a bubble chart under #chart-container2 element using chart group A
 * var subwayChart2 = dc.subwayChart('#chart-container2', 'chartGroupA');
 * @param {String|node|d3.selection} parent - Any valid
 * {@link https://github.com/mbostock/d3/wiki/Selections#selecting-elements d3 single selector} specifying
 * a dom block element such as a div; or a dom element or d3 selection.
 * @param {String} [chartGroup] - The name of the chart group this chart instance should be placed in.
 * Interaction with a chart will only trigger events and redraws within the chart's group.
 * @return {dc.subwayChart}
 */
dc.subwayChart = function (parent, chartGroup) {
    var _chart = dc.customBubbleMixin(dc.stackMixin(dc.coordinateGridMixin({})));

    var _elasticRadius = false;
    var _interpolate = 'monotone';
    var _tension = 0.1;
    var _defined;
    var _dashStyle;
    _chart.BUBBLE_CLASS = 'subwayBubble';

    // var linesColorScale;
    var originalDomain;

    _chart.transitionDuration(750);

    var bubbleLocator = function (d) {
        return 'translate(' + (bubbleX(d)) + ',' + (bubbleY(d)) + ')';
    };

    /**
     * Turn on or off the elastic bubble radius feature, or return the value of the flag. If this
     * feature is turned on, then bubble radii will be automatically rescaled to fit the chart better.
     * @name elasticRadius
     * @memberof dc.subwayChart
     * @instance
     * @param {Boolean} [elasticRadius=false]
     * @return {Boolean}
     * @return {dc.subwayChart}
     */
    _chart.elasticRadius = function (elasticRadius) {
        if (!arguments.length) {
            return _elasticRadius;
        }
        _elasticRadius = elasticRadius;
        return _chart;
    };

    function Station(x, yRaw, value, visible) {
      this.x = x;
      this.yRaw = yRaw;
      this.value = value;
      this.visible = visible;
    }

    function SubwayLine(lineID, stations) {
      this.lineID = lineID;
      this.stations = stations;
      this.segments = [];
    }

    function insertStation(station, stations) {
      if (stations[station.x] === undefined) {
        stations[station.x] = [station];
      } else {
        stations[station.x].push(station);
      }

      return stations;
    }

    function fiddleWithDomain(domainHelper) {
      var keys = Object.keys(domainHelper);

      keys.sort(function (a, b) {
        return new Date(a) - new Date(b);
      });

      var newDomain = [];
      keys.forEach(function(key) {
        domainHelper[key].forEach(function(station) {
          station.yRaw.forEach(function(lineName) {
            if (newDomain.indexOf(lineName) < 0) {
              newDomain.push(lineName);
            }
          });
        });
      });

      return newDomain;
    }

    var ordinalDivider = function(time, stations)  {
      var rangeBands = _chart.y().range().length;
      var height = _chart.effectiveHeight();
      var offset = height/rangeBands;

      var result = 0;
      var domain = _chart.y().domain();
      for (var i = 0; i < domain.length; i++) {
        if (stations.yRaw.indexOf(domain[i]) >= 0) {
          result = _chart.y()(domain[i]);
        }
      }

      var x = result;
      if (isNaN(x)) {
          x = 0;
      }
      var resultX = dc.utils.safeNumber(x+0.5*offset);

      return resultX;
    };

    var pruneData =  function(chartData) {
      var nodes = [];

      chartData.forEach(function (node) {
        //Don't bother adding nodes which are filtered out
        if (node.value.count > 0) {
          var time = node.key[0];

          nodes.push({
            key: node.key,
            value: node.value
          });
        }
      });

      return nodes;
    };

    var determineNodes = function(chartData) {
      var nodes = {};

      chartData.forEach(function (node) {
        //Don't bother adding nodes which are filtered out
        if (node.value.count > 0) {
          var time = node.key[0];
          var participants = _chart.valueAccessor()(node);
          var value = _chart.radiusValueAccessor()(node);

          insertStation(new Station(new Date(time), participants, value, true), nodes);
        }
      });

      return nodes;
    };

    var createLines = function(domain, nodes) {
      //First, we create our lines based on our domain, each with a begin station
      var linesObj = {};
      domain.forEach(function(lineName) {
        if (linesObj[lineName] === undefined) {
          linesObj[lineName] = new SubwayLine(lineName, {});
        }
        //Insert a start point station into the line
        insertStation(new Station(new Date(-8640000000000000), [lineName], 1, true), linesObj[lineName].stations);
        //Insert an end point station into the line
        insertStation(new Station(new Date(8640000000000000), [lineName], 1, true), linesObj[lineName].stations);
      });

      //Then we add the stations to those lines based on the nodes
      Object.keys(nodes).forEach(function(time) {
        Object.keys(nodes[time]).forEach(function(stationKey) {
          var station = nodes[time][stationKey];
          var participants = station.yRaw;

          participants.forEach(function(participant) {
            //Insert the nodes into each line
            insertStation(station, linesObj[participant].stations);
          });
        });
      });

      var lines = Object.keys(linesObj).map(function (key) {
        return linesObj[key];
      });
      return lines;
    };

    var stationCompare = function(thisStation, thatStation) {
      var result = true;
      if(thisStation.x.getTime() !== thatStation.x.getTime()) {
        result = false;
      }
      if(thisStation.yRaw !== thatStation.yRaw) {
        result = false;
      }
      if(thisStation.value !== thatStation.value) {
        result = false;
      }
      return result;
    }

    var updateLines = function(lines, domain, nodes) {
      this.visibleStations = [];

      this.visibleTimeStrings = Object.keys(nodes);
      this.visibleTimeStrings.forEach(function(time) {
        this.visibleStations = this.visibleStations.concat(nodes[time]);
      }.bind(this));

      this.visibleTimeStrings.push(new Date(8640000000000000).toString());
      this.visibleTimeStrings.push(new Date(-8640000000000000).toString());
      this.visibleDomain = domain;

      lines.forEach(function(line) {
        var stations = line.stations;
        var dateStrings = Object.keys(stations);

        dateStrings.forEach(function(dateString) {
          this.currentDate = dateString;
          var stationList = stations[dateString];

          Object.keys(stationList).forEach(function(stationKey) {
            var station = stationList[stationKey];
            var anyParticipantVisible = false;
            station.yRaw.forEach(function(participant) {
              if (this.visibleDomain.indexOf(participant) >= 0) {
                anyParticipantVisible = true;
              }
            }.bind(this));

            //If any of the participants are visible, this node should be visible.
            var found = false;
            this.visibleStations.forEach(function(thatStation) {
              if (stationCompare(thatStation, station)) {
                found = true;
              }
            });

            if (found) {
              station.visible = true;
            } else if (anyParticipantVisible && this.currentDate === new Date(8640000000000000).toString() || this.currentDate === new Date(-8640000000000000).toString()) {
              station.visible = true;
            } else {
              station.visible = false;
            }
          }.bind(this));
        }.bind(this));
      }.bind(this));

      return lines;
    }.bind(this);

    var buildSegments = function(lines, domain) {
      var domainSortFunc = function(a, b) {
        return domain.indexOf(a.yRaw[0]) - domain.indexOf(b.yRaw[0]);
      };

      lines.forEach(function(line) {
        var stationKeys = Object.keys(line.stations);

        //Sort by time first
        stationKeys.sort(function (a, b) {
            return new Date(a) - new Date(b);
        });

        var len = stationKeys.length;

        //The first station in a line is always singular, since it is the left border of the graph. It is also our starting point
        var lastStationVisited = line.stations[stationKeys[0]][0];
        var lastSegment = null;
        for (var i = 1; i < len; i++) {
          var k = stationKeys[i];

          var currentStations = line.stations[k];

          //Sort by order of appearance in the domain second.
          currentStations.sort(domainSortFunc);

          var numStations = currentStations.length;
          for (var j = 0; j < numStations; j++) {
            var newSegment = {
              source: lastStationVisited,
              target: currentStations[j]
            };
            line.segments.push(newSegment);
            lastStationVisited = currentStations[j];

            if (lastSegment !== null) {
              lastSegment.nextSegment = newSegment;
              newSegment.lastSegment = lastSegment;
            }
            lastSegment = newSegment;

          }
        }
      });

      return lines;
    };

    function safeD (d) {
        return (!d || d.indexOf('NaN') >= 0 || d.indexOf('Infinity') >= 0) ? 'M0,0' : d;
    }

    var diagonal = d3.svg.diagonal()
      .source(function(d) {
        return {'x':d.source.y, 'y':d.source.x};
      })
      .target(function(d) {
        return {'x':d.target.y, 'y':d.target.x};
      })
      .projection(function(d) {
        return [d.y, d.x];
      });

    var getX = function(rawX) {
      var x = _chart.x()(rawX);
      if (x < 0) {
        x = 0;
      } else if (x > _chart.x().range()[1]) {
        x = _chart.x().range()[1];
      }
      return x;
    };

    var getY = function(rawY) {
      var y = ordinalDivider(null, {yRaw:rawY});

      var extent = _chart.y().range();
      extent.sort(function(a, b) {
        return b - a;
      });

      if (y < 0) {
        y = 0;
      } else if (y > extent[extent.length]) {
        y = extent[extent.length];
      }

      return y;
    };

    function renderLines(subwayLineG) {
      subwayLineG.enter().insert('g', ':first-child')
        .attr('stroke', function(d) {
          return _chart.getColor(d.lineID);
          // return linesColorScale(d.lineID);
        })
        .attr('class', function (d, i) {
          return 'subway-line ' + '_' + i;
        });

      var paths = subwayLineG.selectAll('path.diagonal').data(function(d) {
        return d.segments;
      });

      paths.enter()
        .insert('path')
        .attr('class', 'diagonal')
        .attr('stroke-opacity', function (d) {
          return 1.0;
        });

      paths.exit().remove();
      subwayLineG.exit().remove();
    }

    function updateLinesG(subwayLineG) {
      var paths = subwayLineG.selectAll('path.diagonal').data(function(d) {
        return d.segments;
      });
      dc.transition(paths, _chart.transitionDuration())
        .attr('d', function (d) {
          var origin = {x: getX(d.source.x), y: getY(d.source.yRaw)};
          var dest;
          if (d.source.visible && d.target.visible) {
            dest = {x: getX(d.target.x), y: getY(d.target.yRaw)};
        		return safeD(diagonal({source: origin, target: dest}));
          } else if (d.source.visible && !d.target.visible) {
            var currentSegment = d.nextSegment;
            while (currentSegment !== undefined) {
              if (currentSegment.target.visible) {
                dest = {x: getX(currentSegment.target.x), y: getY(currentSegment.target.yRaw)};
            		return safeD(diagonal({source: origin, target: dest}));
              }
              currentSegment = currentSegment.nextSegment;
            }
          }
        })
        .attr('stroke-opacity', function (d) {
          // if (!d.source.visible || !d.target.visible) {
          //   return 0.1;
          // } else {
            return 1.0;
          // }
        })
        ;

      paths.exit().remove();
      subwayLineG.exit().remove();
    }

    function removeLinesG(subwayLineG) {
      var paths = subwayLineG.selectAll('path.diagonal').data(function(d) {
        return d.segments;
      });

      paths.exit().remove();
      subwayLineG.exit().remove();
    }

    // var linesData;
    var lines;
    var initialized = false;
    _chart.plotData = function () {
      var prunedData = pruneData(_chart.data());

      var nodes = determineNodes(prunedData);
      var domain = fiddleWithDomain(nodes);
      _chart.y().domain(domain);

      //Make the lines if this is the first pass
      if (!initialized) {
        lines = createLines(domain, nodes);
        lines = updateLines(lines, domain, nodes);
        lines = buildSegments(lines, domain);

        initialized = true;
      } else {
        //Update the lines by determining if the nodes are in the scope and making them (in)visible, and updating x and y values of the nodes.
        updateLines(lines, domain, nodes);
      }

      var subwayLineG = _chart.chartBodyG().selectAll('g.' + 'subway-line').data(lines);
      renderLines(subwayLineG);
      updateLinesG(subwayLineG);
      removeLinesG(subwayLineG);

      if (_elasticRadius) {
          _chart.r().domain([_chart.rMin(), _chart.rMax()]);
      }

      _chart.r().range([_chart.MIN_RADIUS, _chart.xAxisLength() * _chart.maxBubbleRelativeSize()]);

      // var subwayLineG = _chart.chartBodyG().selectAll('g.' + 'subway-line')
      //   .data(linesData);

      // renderLines(subwayLineG, linesData);
      //
      // updateLines(subwayLineG, linesData);

      // subwayLineG.exit().remove();

      // removeLines(subwayLineG);

      var bubbleG = _chart.chartBodyG().selectAll('g.' + _chart.BUBBLE_NODE_CLASS).data(prunedData, function (d) {
        return d.key;
      });

      renderNodes(bubbleG);
      updateNodes(bubbleG);
      removeNodes(bubbleG);

      _chart.rescale();
      _chart.fadeDeselectedArea();
    };

    _chart.interpolate = function (interpolate) {
        if (!arguments.length) {
            return _interpolate;
        }
        _interpolate = interpolate;
        return _chart;
    };
    _chart.tension = function (tension) {
        if (!arguments.length) {
            return _tension;
        }
        _tension = tension;
        return _chart;
    };
    _chart.defined = function (defined) {
        if (!arguments.length) {
            return _defined;
        }
        _defined = defined;
        return _chart;
    };
    _chart.dashStyle = function (dashStyle) {
        if (!arguments.length) {
            return _dashStyle;
        }
        _dashStyle = dashStyle;
        return _chart;
    };

    function renderNodes (bubbleG) {
        var bubbleGEnter = bubbleG.enter().append('g');

        bubbleGEnter
            .attr('class', _chart.BUBBLE_NODE_CLASS)
            .attr('transform', bubbleLocator)
            .append('ellipse').attr('class', function (d, i) {
                return _chart.BUBBLE_CLASS + ' _' + i;
            })
            .on('click', _chart.onClick)
            // .attr('fill', function(d) {
            //   return _chart.getColor(d.lineID)
            // })
            .attr('width', 0)
            .attr('height', 0);
        dc.transition(bubbleG, _chart.transitionDuration())
            .selectAll('ellipse.' + _chart.BUBBLE_CLASS)
            .attr('ry', function (d) {
                return _chart.bubbleR(d);
            })
            .attr('rx', function (d) {
                return _chart.minRadius();
            })
            .attr('opacity', function (d) {
                return (_chart.bubbleR(d) > 0) ? 1 : 0;
            });

        _chart._doRenderLabel(bubbleGEnter);

        _chart._doRenderTitles(bubbleGEnter);
    }

    function updateNodes (bubbleG) {
        dc.transition(bubbleG, _chart.transitionDuration())
          .attr('transform', bubbleLocator)
          .selectAll('ellipse.' + _chart.BUBBLE_CLASS)
          // .attr('fill', function(d) {
          //   return _chart.getColor(d.lineID)
          // })
          .attr('ry', function (d) {
              return _chart.bubbleR(d);
          })
          .attr('rx', function (d) {
              return _chart.minRadius();
          })
          .attr('opacity', function (d) {
              return (_chart.bubbleR(d) > 0) ? 1 : 0;
          });

        _chart.doUpdateLabels(bubbleG);
        _chart.doUpdateTitles(bubbleG);
    }

    function removeNodes (bubbleG) {
        bubbleG.exit().remove();
    }

    function bubbleX (d) {
        var x = _chart.x()(_chart.keyAccessor()(d));
        if (isNaN(x)) {
            x = 0;
        }
        return x;
    }

    function bubbleY (d) {
        var y = ordinalDivider(_chart.keyAccessor()(d), {yRaw:_chart.valueAccessor()(d)});
        return y;
    }

    _chart.renderBrush = function () {
    };

    _chart.redrawBrush = function () {
    };

    return _chart.anchor(parent, chartGroup);
};
