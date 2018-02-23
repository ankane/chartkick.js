/*
* Chartkick.js
* Create beautiful charts with one line of JavaScript
* https://github.com/ankane/chartkick.js
* v2.3.0
* MIT License
*/

import ChartjsAdapter from "./adapters/chartjs";
import HighchartsAdapter from "./adapters/highcharts";
import GoogleChartsAdapter from "./adapters/google";

import { merge, isFunction, isArray, toStr, toFloat, toDate, toArr, sortByTime, sortByNumberSeries, isDate } from "./helpers";

var config = window.Chartkick || {};
var adapters = [];
var pendingRequests = [], runningRequests = 0, maxRequests = 4;

// helpers

function setText(element, text) {
  if (document.body.innerText) {
    element.innerText = text;
  } else {
    element.textContent = text;
  }
}

function chartError(element, message) {
  setText(element, "Error Loading Chart: " + message);
  element.style.color = "#ff0000";
}

function pushRequest(element, url, success) {
  pendingRequests.push([element, url, success]);
  runNext();
}

function runNext() {
  if (runningRequests < maxRequests) {
    var request = pendingRequests.shift();
    if (request) {
      runningRequests++;
      getJSON(request[0], request[1], request[2]);
      runNext();
    }
  }
}

function requestComplete() {
  runningRequests--;
  runNext();
}

function getJSON(element, url, success) {
  ajaxCall(url, success, function (jqXHR, textStatus, errorThrown) {
    var message = (typeof errorThrown === "string") ? errorThrown : errorThrown.message;
    chartError(element, message);
  });
}

function ajaxCall(url, success, error) {
  var $ = window.jQuery || window.Zepto || window.$;

  if ($) {
    $.ajax({
      dataType: "json",
      url: url,
      success: success,
      error: error,
      complete: requestComplete
    });
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      requestComplete();
      if (xhr.status === 200) {
        success(JSON.parse(xhr.responseText), xhr.statusText, xhr);
      } else {
        error(xhr, "error", xhr.statusText);
      }
    };
    xhr.send();
  }
}

function errorCatcher(chart, callback) {
  try {
    callback(chart);
  } catch (err) {
    chartError(chart.element, err.message);
    throw err;
  }
}

function fetchDataSource(chart, callback, dataSource) {
  if (typeof dataSource === "string") {
    pushRequest(chart.element, dataSource, function (data) {
      chart.rawData = data;
      errorCatcher(chart, callback);
    });
  } else {
    chart.rawData = dataSource;
    errorCatcher(chart, callback);
  }
}

function addDownloadButton(chart) {
  var element = chart.element;
  var link = document.createElement("a");
  link.download = chart.options.download === true ? "chart.png" : chart.options.download; // http://caniuse.com/download
  link.style.position = "absolute";
  link.style.top = "20px";
  link.style.right = "20px";
  link.style.zIndex = 1000;
  link.style.lineHeight = "20px";
  link.target = "_blank"; // for safari
  var image = document.createElement("img");
  image.alt = "Download";
  image.style.border = "none";
  // icon from font-awesome
  // http://fa2png.io/
  image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAABCFBMVEUAAADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMywEsqxAAAAV3RSTlMAAQIDBggJCgsMDQ4PERQaHB0eISIjJCouLzE0OTo/QUJHSUpLTU5PUllhYmltcHh5foWLjI+SlaCio6atr7S1t7m6vsHHyM7R2tze5Obo7fHz9ff5+/1hlxK2AAAA30lEQVQYGUXBhVYCQQBA0TdYWAt2d3d3YWAHyur7/z9xgD16Lw0DW+XKx+1GgX+FRzM3HWQWrHl5N/oapW5RPe0PkBu+UYeICvozTWZVK23Ao04B79oJrOsJDOoxkZoQPWgX29pHpCZEk7rEvQYiNSFq1UMqvlCjJkRBS1R8hb00Vb/TajtBL7nTHE1X1vyMQF732dQhyF2o6SAwrzP06iUQzvwsArlnzcOdrgBhJyHa1QOgO9U1GsKuvjUTjavliZYQ8nNPapG6sap/3nrIdJ6bOWzmX/fy0XVpfzZP3S8OJT3g9EEiJwAAAABJRU5ErkJggg==";
  link.appendChild(image);
  element.style.position = "relative";

  chart.downloadAttached = true;

  // mouseenter
  addEvent(element, "mouseover", function(e) {
    var related = e.relatedTarget;
    // check download option again to ensure it wasn't changed
    if (!related || (related !== this && !childOf(this, related)) && chart.options.download) {
      link.href = chart.toImage();
      element.appendChild(link);
    }
  });

  // mouseleave
  addEvent(element, "mouseout", function(e) {
    var related = e.relatedTarget;
    if (!related || (related !== this && !childOf(this, related))) {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }
  });
}

// http://stackoverflow.com/questions/10149963/adding-event-listener-cross-browser
function addEvent(elem, event, fn) {
  if (elem.addEventListener) {
    elem.addEventListener(event, fn, false);
  } else {
    elem.attachEvent("on" + event, function() {
      // set the this pointer same as addEventListener when fn is called
      return(fn.call(elem, window.event));
    });
  }
}

// https://gist.github.com/shawnbot/4166283
function childOf(p, c) {
  if (p === c) return false;
  while (c && c !== p) c = c.parentNode;
  return c === p;
}

function addAdapter(adapter) {
  if (adapters.indexOf(adapter) === -1) {
    adapters.push(adapter);
  }
}

function loadAdapters() {
  if ("Chart" in window) {
    addAdapter(ChartjsAdapter);
  }

  if ("Highcharts" in window) {
    addAdapter(HighchartsAdapter);
  }

  if (window.google && (window.google.setOnLoadCallback || window.google.charts)) {
    addAdapter(GoogleChartsAdapter);
  }
}

function dataEmpty(data, chartType) {
  if (chartType === "PieChart" || chartType === "GeoChart" || chartType === "Timeline") {
    return data.length === 0;
  } else {
    for (var i = 0; i < data.length; i++) {
      if (data[i].data.length > 0) {
        return false;
      }
    }
    return true;
  }
}

function renderChart(chartType, chart) {
  if (chart.options.messages && chart.options.messages.empty && dataEmpty(chart.data, chartType)) {
    setText(chart.element, chart.options.messages.empty);
  } else {
    callAdapter(chartType, chart);
    if (chart.options.download && !chart.downloadAttached && chart.adapter === "chartjs") {
      addDownloadButton(chart);
    }
  }
}

// TODO remove chartType if cross-browser way
// to get the name of the chart class
function callAdapter(chartType, chart) {
  var i, adapter, fnName, adapterName;
  fnName = "render" + chartType;
  adapterName = chart.options.adapter;

  loadAdapters();

  for (i = 0; i < adapters.length; i++) {
    adapter = adapters[i];
    if ((!adapterName || adapterName === adapter.name) && isFunction(adapter[fnName])) {
      chart.adapter = adapter.name;
      return adapter[fnName](chart);
    }
  }

  if (adapters.length > 0) {
    throw new Error("No charting library found for " + chartType);
  } else {
    throw new Error("No charting libraries found - be sure to include one before your charts");
  }
}

// process data

var toFormattedKey = function (key, keyType) {
  if (keyType === "number") {
    key = toFloat(key);
  } else if (keyType === "datetime") {
    key = toDate(key);
  } else {
    key = toStr(key);
  }
  return key;
};

var formatSeriesData = function (data, keyType) {
  var r = [], key, j;
  for (j = 0; j < data.length; j++) {
    if (keyType === "bubble") {
      r.push([toFloat(data[j][0]), toFloat(data[j][1]), toFloat(data[j][2])]);
    } else {
      key = toFormattedKey(data[j][0], keyType);
      r.push([key, toFloat(data[j][1])]);
    }
  }
  if (keyType === "datetime") {
    r.sort(sortByTime);
  } else if (keyType === "number") {
    r.sort(sortByNumberSeries);
  }
  return r;
};

function detectDiscrete(series) {
  var i, j, data;
  for (i = 0; i < series.length; i++) {
    data = toArr(series[i].data);
    for (j = 0; j < data.length; j++) {
      if (!isDate(data[j][0])) {
        return true;
      }
    }
  }
  return false;
}

// creates a shallow copy of each element of the array
// elements are expected to be objects
function copySeries(series) {
  var newSeries = [], i, j;
  for (i = 0; i < series.length; i++) {
    var copy = {};
    for (j in series[i]) {
      if (series[i].hasOwnProperty(j)) {
        copy[j] = series[i][j];
      }
    }
    newSeries.push(copy);
  }
  return newSeries;
}

function processSeries(chart, keyType) {
  var i;

  var opts = chart.options;
  var series = chart.rawData;

  // see if one series or multiple
  if (!isArray(series) || typeof series[0] !== "object" || isArray(series[0])) {
    series = [{name: opts.label || "Value", data: series}];
    chart.hideLegend = true;
  } else {
    chart.hideLegend = false;
  }
  if ((opts.discrete === null || opts.discrete === undefined) && keyType !== "bubble" && keyType !== "number") {
    chart.discrete = detectDiscrete(series);
  } else {
    chart.discrete = opts.discrete;
  }
  if (chart.discrete) {
    keyType = "string";
  }
  if (chart.options.xtype) {
    keyType = chart.options.xtype;
  }

  // right format
  series = copySeries(series);
  for (i = 0; i < series.length; i++) {
    series[i].data = formatSeriesData(toArr(series[i].data), keyType);
  }

  return series;
}

function processSimple(chart) {
  var perfectData = toArr(chart.rawData), i;
  for (i = 0; i < perfectData.length; i++) {
    perfectData[i] = [toStr(perfectData[i][0]), toFloat(perfectData[i][1])];
  }
  return perfectData;
}

// define classes

class Chart {
  constructor(element, dataSource, options) {
    var elementId;
    if (typeof element === "string") {
      elementId = element;
      element = document.getElementById(element);
      if (!element) {
        throw new Error("No element with id " + elementId);
      }
    }
    this.element = element;
    this.options = merge(Chartkick.options, options || {});
    this.dataSource = dataSource;

    this.callback = () => {
      this.data = this.processData();
      renderChart(this.constructor.name, this);
    };

    Chartkick.charts[element.id] = this;

    fetchDataSource(this, this.callback, dataSource);

    if (this.options.refresh) {
      this.startRefresh();
    }
  }

  getElement() {
    return this.element;
  }

  getDataSource() {
    return this.dataSource;
  }

  getData() {
    return this.data;
  }

  getOptions() {
    return this.options;
  }

  getChartObject() {
    return this.chart;
  }

  getAdapter() {
    return this.adapter;
  }

  updateData(dataSource, options) {
    this.dataSource = dataSource;
    if (options) {
      this.__updateOptions(options);
    }
    fetchDataSource(this, this.callback, dataSource);
  }

  setOptions(options) {
    this.__updateOptions(options);
    this.redraw();
  }

  __updateOptions(options) {
    var updateRefresh = options.refresh && options.refresh !== this.options.refresh;
    this.options = merge(Chartkick.options, options);
    if (updateRefresh) {
      this.stopRefresh();
      this.startRefresh();
    }
  }

  redraw() {
    fetchDataSource(this, this.callback, this.rawData);
  }

  refreshData() {
    if (typeof this.dataSource === "string") {
      // prevent browser from caching
      var sep = this.dataSource.indexOf("?") === -1 ? "?" : "&";
      var url = this.dataSource + sep + "_=" + (new Date()).getTime();
      fetchDataSource(this, this.callback, url);
    }
  }

  startRefresh() {
    var refresh = this.options.refresh;

    if (!this.intervalId) {
      if (refresh) {
        this.intervalId = setInterval( () => {
          this.refreshData();
        }, refresh * 1000);
      } else {
        throw new Error("No refresh interval");
      }
    }
  }

  stopRefresh() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toImage() {
    if (this.adapter === "chartjs") {
      return this.chart.toBase64Image();
    } else {
      return null;
    }
  }
}

class LineChart extends Chart {
  processData() {
    return processSeries(this, "datetime");
  }
}

class PieChart extends Chart {
  processData() {
    return processSimple(this);
  }
}

class ColumnChart extends Chart {
  processData() {
    return processSeries(this, "string");
  }
}

class BarChart extends Chart {
  processData() {
    return processSeries(this, "string");
  }
}

class AreaChart extends Chart {
  processData() {
    return processSeries(this, "datetime");
  }
}

class GeoChart extends Chart {
  processData() {
    return processSimple(this);
  }
}

class ScatterChart extends Chart {
  processData() {
    return processSeries(this, "number");
  }
}

class BubbleChart extends Chart {
  processData() {
    return processSeries(this, "bubble");
  }
}

class Timeline extends Chart {
  processData() {
    var i, data = this.rawData;
    for (i = 0; i < data.length; i++) {
      data[i][1] = toDate(data[i][1]);
      data[i][2] = toDate(data[i][2]);
    }
    return data;
  }
}

export const Chartkick = {
  LineChart: LineChart,
  PieChart: PieChart,
  ColumnChart: ColumnChart,
  BarChart: BarChart,
  AreaChart: AreaChart,
  GeoChart: GeoChart,
  ScatterChart: ScatterChart,
  BubbleChart: BubbleChart,
  Timeline: Timeline,
  charts: {},
  configure: function (options) {
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        Chartkick.config[key] = options[key];
      }
    }
  },
  eachChart: function (callback) {
    for (var chartId in Chartkick.charts) {
      if (Chartkick.charts.hasOwnProperty(chartId)) {
        callback(Chartkick.charts[chartId]);
      }
    }
  },
  config: config,
  options: {},
  adapters: adapters
};
