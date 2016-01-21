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

    var linesColorScale;

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

    function Station(x, yRaw) {
      this.x = x;
      this.yRaw = yRaw;
    }

    // function Segment(source, target) {
    //   this.source = source;
    //   this.target = target;
    // }

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

    function buildSegments(subwayLines, domain) {
      var offset = 6;

      var lineKeys = Object.keys(subwayLines);
      lineKeys.forEach(function(lineKey) {
        var subwayLine = subwayLines[lineKey];
        var stationKeys = Object.keys(subwayLine.stations);

        stationKeys.sort(function (a, b) {
          if (Number.isNaN(parseInt(a)) && Number.isNaN(parseInt(b))) {
            return new Date(a) - new Date(b);
          } else if ((!Number.isNaN(parseInt(a)) && parseInt(a) === 0) || (!Number.isNaN(parseInt(b)) && parseInt(b) !== 0)) {
            return -1;
          } else if ((!Number.isNaN(parseInt(a)) && parseInt(a) !== 0) || (!Number.isNaN(parseInt(b)) && parseInt(b) === 0)) {
            return 1;
          } else {
            return 1;
          }
        });

        var len = stationKeys.length;
        for (var i = 0; i < len-1; i++) {
          var k = stationKeys[i];
          var l = stationKeys[i+1];

          var currentStations = subwayLine.stations[k];
          var nextStations = subwayLine.stations[l];

          currentStations.sort(function(a, b) {
            return domain.indexOf(a) - domain.indexOf(b);
          });

          nextStations.sort(function(a, b) {
            return domain.indexOf(a) - domain.indexOf(b);
          });

          var iC = 0, iN = 0;
          var startC = -currentStations.length*0.5*offset;
          var startN = -nextStations.length*0.5*offset;

          currentStations.forEach(function(currentStation) {
            nextStations.forEach(function(nextStation) {
              subwayLine.segments.push({
                source: currentStation,
                target: nextStation,
                visible: true
              });
              iN++;
            });
            iC++;
          });
        }
      });

      return subwayLines;
    }

    function fiddleWithDomain(domainHelper) {
      var domain = _chart.y().domain();
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

      _chart.y().domain(newDomain);

      return newDomain;
    }

    Object.prototype.renameProperty = function (oldName, newName) {
      // Do nothing if the names are the same
      if (oldName === newName) {
          return this;
      }
      // Check for the old property name to avoid a ReferenceError in strict mode.
      if (this.hasOwnProperty(oldName)) {
        this[newName] = this[oldName];
        delete this[oldName];
      }
      return this;
    };

    var preprocessDataForLines = function(chartData) {
      var subwayLines = {};
      var domainHelper = {};

      chartData.forEach(function (object) {

        //Don't bother adding nodes which are filtered out
        if (object.value.count > 0) {
          var objKeys = Object.keys(object.key[1]);
          objKeys.forEach(function (objKey) {
            var line = object.key[1][objKey];
            var dataValue = _chart.valueAccessor()(object);

            if (subwayLines[line] === undefined) {
              subwayLines[line] = new SubwayLine(line, {});
            }

            // insertStation(new Station(_chart.x()(object.key[0]), ordinalAverager(dataValue)), subwayLines[line].stations);
            insertStation(new Station(object.key[0], dataValue), subwayLines[line].stations);
            insertStation(new Station(object.key[0], dataValue), domainHelper);
          });
        }
      });

      var domain = fiddleWithDomain(domainHelper);

      var lineKeys = Object.keys(subwayLines);
      lineKeys.forEach(function(line) {
        var timeKeys = Object.keys(subwayLines[line].stations);
        timeKeys.forEach(function(time) {
          //Transform station's time values into x coordinates
          var newKey = _chart.x()(new Date(time));
          // subwayLines[line].stations.renameProperty(time, newKey);

          //Transform station's ordinal values into y coordinates
          for (var i =0; i < subwayLines[line].stations[time].length; i++) {
            subwayLines[line].stations[time][i].x = newKey;
            subwayLines[line].stations[time][i].y = ordinalDivider(time, subwayLines[line].stations[time][i]);
          }
        });

        //add source and dest stations
        insertStation({x:_chart.x().range()[0],  y:ordinalDivider(0, {x:0,yRaw:[line]})}, subwayLines[line].stations);
        insertStation({x:_chart.x().range()[1],  y:ordinalDivider(0, {x:0,yRaw:[line]})}, subwayLines[line].stations);
      });

      buildSegments(subwayLines, domain);

      var arrayResult = [];
      var allKeys2 = Object.keys(subwayLines);
      allKeys2.forEach(function(line) {
        arrayResult.push(subwayLines[line]);
      });

      linesColorScale = d3.scale.category20b().domain(allKeys2);
      return arrayResult;
    };

    var updateLineData = function(chartData) {
      var domainHelper = {};

      chartData.forEach(function (object) {
        //Don't bother adding nodes which are filtered out
        if (object.value.count > 0) {
          var objKeys = Object.keys(object.key[1]);
          objKeys.forEach(function (objKey) {
            var dataValue = _chart.valueAccessor()(object);

            insertStation(new Station(object.key[0], dataValue), domainHelper);
          });
        }
      });

      var domain = fiddleWithDomain(domainHelper);

      linesData.forEach(function (l) {
        var timeKeys = Object.keys(l.stations);
        for (var i =0; i < timeKeys.length; i++) {
          var timeIndex = timeKeys[i];
          if (Number.isNaN(parseInt(timeIndex))) {
            //Actual stations
            for (var j =0; j < l.stations[timeIndex].length; j++) {
              l.stations[timeIndex][j].x0 = l.stations[timeIndex][j].x;
              l.stations[timeIndex][j].y0 = l.stations[timeIndex][j].y;

              l.stations[timeIndex][j].x = _chart.x()(new Date(timeIndex));
              l.stations[timeIndex][j].y = ordinalDivider(timeIndex, l.stations[timeIndex][j]);
            }
          } else {
            l.stations[timeIndex][0].x0 = l.stations[timeIndex][0].x;
            l.stations[timeIndex][0].y0 = l.stations[timeIndex][0].y;
            //The beginning or end of the line
            if (parseInt(timeIndex) === 0) {
              l.stations[timeIndex][0].x = _chart.x().range()[0];
              l.stations[timeIndex][0].y = ordinalDivider(0, {x:0,yRaw:[l.lineID]});
            } else {
              l.stations[timeIndex][0].x = _chart.x().range()[1];
              l.stations[timeIndex][0].y = ordinalDivider(0, {x:0,yRaw:[l.lineID]});
            }
          }
        }
        if (domain.indexOf(l.lineID) >= 0) {
          l.segments.forEach(function(s) {
            s.visible = true;
          });
        } else {
          l.segments.forEach(function(s) {
            s.visible = false;
          });
        }
      });

      return linesData;
    };

    var ordinalDivider = function(time, stations)  {
      var rangeBands = _chart.y().range().length;
      var height = _chart.effectiveHeight();
      var offset = height/rangeBands;

      var result = 0;
      // ordinalValues.forEach(function(ordinalValue) {
      //   result += _chart.y()(ordinalValue);
      // });
      var domain = _chart.y().domain();
      for (var i = 0; i < domain.length; i++) {
        // console.log(stations);
        if (stations.yRaw.indexOf(domain[i]) >= 0) {
          result = _chart.y()(domain[i]);
        }
      }

      var x = result; // / ordinalValues.length;
      if (isNaN(x)) {
          x = 0;
      }
      var resultX = dc.utils.safeNumber(x+0.5*offset);

      return resultX;
    };

    var linesData;
    _chart.plotData = function () {
        if (_elasticRadius) {
            _chart.r().domain([_chart.rMin(), _chart.rMax()]);
        }

        _chart.r().range([_chart.MIN_RADIUS, _chart.xAxisLength() * _chart.maxBubbleRelativeSize()]);

        if (linesData === undefined) {
          linesData = preprocessDataForLines(_chart.data());
        } else {
          linesData = updateLineData(_chart.data());
        }

        var subwayLineG = _chart.chartBodyG().selectAll('g.' + 'subway-line')
          .data(linesData);

        renderLines(subwayLineG, linesData);

        updateLines(subwayLineG, linesData);

        subwayLineG.exit().remove();

        // removeLines(subwayLineG);

        var bubbleG = _chart.chartBodyG().selectAll('g.' + _chart.BUBBLE_NODE_CLASS)
            .data(_chart.data(), function (d) { return d.key; });

        renderNodes(bubbleG);
        updateNodes(bubbleG);
        removeNodes(bubbleG);

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

    var diagonal = d3.svg.diagonal()
      .source(function(d) {
        return {'x':d.source.y, 'y':d.source.x};
        // return {'x':ordinalAverager(d.source.y), 'y':_chart.x()(new Date(d.source.x))};
      })
      .target(function(d) {
        return {'x':d.target.y, 'y':d.target.x};
        // return {'x':ordinalAverager(d.target.y), 'y':_chart.x()(new Date(d.target.x))};
      })
      .projection(function(d) {
        return [d.y, d.x];
      });


    function renderLines(subwayLineG, linesData) {
      subwayLineG.enter()
        .insert('g', ':first-child')
        .attr('stroke', function(d) {
          return linesColorScale(d.lineID);
        })
        .attr('class', function (d, i) {
          return 'subway-line ' + '_' + i;
        });

      var paths = subwayLineG.selectAll('path.diagonal').data(function(d) {
        // return d.values;
        return d.segments;
      });

      paths.enter()
        .insert('path', 'g')
        .attr('class', 'diagonal')
        .attr('d', function (d) {
      		var origin = {x: d.source.x0 || 0, y: d.source.y0 || 0};
          var dest = {x: d.target.x0 || 0, y: d.target.y0 || 0};
      		return safeD(diagonal({source: origin, target: dest}));
        })
        .attr('opacity', function (d) {
            return (d.visible) ? 1 : 0;
        })
        // .transition().duration(_chart.transitionDuration())
        //   .attr('d', diagonal)
        ;
    }

  function updateLines(subwayLineG, linesData) {
    var paths = subwayLineG.selectAll('path.diagonal').data(function(d) {
      // return d.values;
      return d.segments;
    });
    dc.transition(paths, _chart.transitionDuration())
      .attr('d', diagonal)
      .attr('opacity', function (d) {
          return (d.visible) ? 1 : 0;
      })
      ;

    paths.exit().remove();
  }

    function safeD (d) {
        return (!d || d.indexOf('NaN') >= 0 || d.indexOf('Infinity') >= 0) ? 'M0,0' : d;
    }

    function renderNodes (bubbleG) {
        var bubbleGEnter = bubbleG.enter().append('g');

        bubbleGEnter
            .attr('class', _chart.BUBBLE_NODE_CLASS)
            .attr('transform', bubbleLocator)
            .append('ellipse').attr('class', function (d, i) {
                return _chart.BUBBLE_CLASS + ' _' + i;
            })
            .on('click', _chart.onClick)
            .attr('fill', _chart.getColor)
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
          .attr('fill', _chart.getColor)
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
        // var rangeBands = _chart.y().range().length;
        // var height = _chart.effectiveHeight();
        // var offset = height/rangeBands;

        var y = ordinalDivider(_chart.keyAccessor()(d), {yRaw:_chart.valueAccessor()(d)});
        // if (isNaN(y)) {
        //     y = 0;
        // }
        // return dc.utils.safeNumber(y+0.5*offset);
        return y;
    }

    _chart.renderBrush = function () {
        // override default x axis brush from parent chart
        //
    };

    _chart.redrawBrush = function () {
        // override default x axis brush from parent chart
        // _chart.fadeDeselectedArea();
    };

    return _chart.anchor(parent, chartGroup);
};
