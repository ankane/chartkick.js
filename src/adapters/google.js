import { jsOptionsFunc, merge, toStr, toFloat, sortByTime, sortByNumberSeries, isDay } from "../helpers";

let loaded = {};
let callbacks = [];

let runCallbacks = function () {
  let cb, call;
  for (let i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    call = window.google.visualization && ((cb.pack === "corechart" && window.google.visualization.LineChart) || (cb.pack === "timeline" && window.google.visualization.Timeline));
    if (call) {
      cb.callback();
      callbacks.splice(i, 1);
      i--;
    }
  }
};

let waitForLoaded = function (pack, callback) {
  if (!callback) {
    callback = pack;
    pack = "corechart";
  }

  callbacks.push({pack: pack, callback: callback});

  if (loaded[pack]) {
    runCallbacks();
  } else {
    loaded[pack] = true;

    // https://groups.google.com/forum/#!topic/google-visualization-api/fMKJcyA2yyI
    let loadOptions = {
      packages: [pack],
      callback: runCallbacks
    };
    let config = window.Chartkick.config;
    if (config.language) {
      loadOptions.language = config.language;
    }
    if (pack === "corechart" && config.mapsApiKey) {
      loadOptions.mapsApiKey = config.mapsApiKey;
    }

    if (window.google.setOnLoadCallback) {
      window.google.load("visualization", "1", loadOptions);
    } else {
      window.google.charts.load("current", loadOptions);
    }
  }
};

// Set chart options
let defaultOptions = {
  chartArea: {},
  fontName: "'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif",
  pointSize: 6,
  legend: {
    textStyle: {
      fontSize: 12,
      color: "#444"
    },
    alignment: "center",
    position: "right"
  },
  curveType: "function",
  hAxis: {
    textStyle: {
      color: "#666",
      fontSize: 12
    },
    titleTextStyle: {},
    gridlines: {
      color: "transparent"
    },
    baselineColor: "#ccc",
    viewWindow: {}
  },
  vAxis: {
    textStyle: {
      color: "#666",
      fontSize: 12
    },
    titleTextStyle: {},
    baselineColor: "#ccc",
    viewWindow: {}
  },
  tooltip: {
    textStyle: {
      color: "#666",
      fontSize: 12
    }
  }
};

let hideLegend = function (options, legend, hideLegend) {
  if (legend !== undefined) {
    let position;
    if (!legend) {
      position = "none";
    } else if (legend === true) {
      position = "right";
    } else {
      position = legend;
    }
    options.legend.position = position;
  } else if (hideLegend) {
    options.legend.position = "none";
  }
};

let setTitle = function (options, title) {
  options.title = title;
  options.titleTextStyle = {color: "#333", fontSize: "20px"};
};

let setMin = function (options, min) {
  options.vAxis.viewWindow.min = min;
};

let setMax = function (options, max) {
  options.vAxis.viewWindow.max = max;
};

let setBarMin = function (options, min) {
  options.hAxis.viewWindow.min = min;
};

let setBarMax = function (options, max) {
  options.hAxis.viewWindow.max = max;
};

let setStacked = function (options, stacked) {
  options.isStacked = stacked ? stacked : false;
};

let setXtitle = function (options, title) {
  options.hAxis.title = title;
  options.hAxis.titleTextStyle.italic = false;
};

let setYtitle = function (options, title) {
  options.vAxis.title = title;
  options.vAxis.titleTextStyle.italic = false;
};

let jsOptions = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle);

// cant use object as key
let createDataTable = function (series, columnType, xtype) {
  let i, j, s, d, key, rows = [], sortedLabels = [];
  for (i = 0; i < series.length; i++) {
    s = series[i];

    for (j = 0; j < s.data.length; j++) {
      d = s.data[j];
      key = (columnType === "datetime") ? d[0].getTime() : d[0];
      if (!rows[key]) {
        rows[key] = new Array(series.length);
        sortedLabels.push(key);
      }
      rows[key][i] = toFloat(d[1]);
    }
  }

  let rows2 = [];
  let day = true;
  let value;
  for (j = 0; j < sortedLabels.length; j++) {
    i = sortedLabels[j];
    if (columnType === "datetime") {
      value = new Date(toFloat(i));
      day = day && isDay(value);
    } else if (columnType === "number") {
      value = toFloat(i);
    } else {
      value = i;
    }
    rows2.push([value].concat(rows[i]));
  }
  if (columnType === "datetime") {
    rows2.sort(sortByTime);
  } else if (columnType === "number") {
    rows2.sort(sortByNumberSeries);
  }

  if (xtype === "number") {
    rows2.sort(sortByNumberSeries);

    for (i = 0; i < rows2.length; i++) {
      rows2[i][0] = toStr(rows2[i][0]);
    }
  }

  // create datatable
  let data = new window.google.visualization.DataTable();
  columnType = columnType === "datetime" && day ? "date" : columnType;
  data.addColumn(columnType, "");
  for (i = 0; i < series.length; i++) {
    data.addColumn("number", series[i].name);
  }
  data.addRows(rows2);

  return data;
};

let resize = function (callback) {
  if (window.attachEvent) {
    window.attachEvent("onresize", callback);
  } else if (window.addEventListener) {
    window.addEventListener("resize", callback, true);
  }
  callback();
};

let drawChart = function(chart, type, data, options) {
  if (chart.chart) {
    chart.chart.clearChart();
  }

  chart.chart = new type(chart.element);
  resize(function () {
    chart.chart.draw(data, options);
  });
};

let renderLineChart = function (chart) {
  waitForLoaded(function () {
    let chartOptions = {};

    if (chart.options.curve === false) {
      chartOptions.curveType = "none";
    }

    if (chart.options.points === false) {
      chartOptions.pointSize = 0;
    }

    let options = jsOptions(chart, chart.options, chartOptions);
    let columnType = chart.discrete ? "string" : "datetime";
    if (chart.options.xtype === "number") {
      columnType = "number";
    }
    let data = createDataTable(chart.data, columnType);

    drawChart(chart, window.google.visualization.LineChart, data, options);
  });
};

let renderPieChart = function (chart) {
  waitForLoaded(function () {
    let chartOptions = {
      chartArea: {
        top: "10%",
        height: "80%"
      },
      legend: {}
    };
    if (chart.options.colors) {
      chartOptions.colors = chart.options.colors;
    }
    if (chart.options.donut) {
      chartOptions.pieHole = 0.5;
    }
    if ("legend" in chart.options) {
      hideLegend(chartOptions, chart.options.legend);
    }
    if (chart.options.title) {
      setTitle(chartOptions, chart.options.title);
    }
    let options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

    let data = new window.google.visualization.DataTable();
    data.addColumn("string", "");
    data.addColumn("number", "Value");
    data.addRows(chart.data);

    drawChart(chart, window.google.visualization.PieChart, data, options);
  });
};

let renderColumnChart = function (chart) {
  waitForLoaded(function () {
    let options = jsOptions(chart, chart.options);
    let data = createDataTable(chart.data, "string", chart.options.xtype);

    drawChart(chart, window.google.visualization.ColumnChart, data, options);
  });
};

let renderBarChart = function (chart) {
  waitForLoaded(function () {
    let chartOptions = {
      hAxis: {
        gridlines: {
          color: "#ccc"
        }
      }
    };
    let options = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setBarMin, setBarMax, setStacked, setXtitle, setYtitle)(chart, chart.options, chartOptions);
    let data = createDataTable(chart.data, "string", chart.options.xtype);

    drawChart(chart, window.google.visualization.BarChart, data, options);
  });
};

let renderAreaChart = function (chart) {
  waitForLoaded(function () {
    let chartOptions = {
      isStacked: true,
      pointSize: 0,
      areaOpacity: 0.5
    };

    let options = jsOptions(chart, chart.options, chartOptions);
    let columnType = chart.discrete ? "string" : "datetime";
    if (chart.options.xtype === "number") {
      columnType = "number";
    }
    let data = createDataTable(chart.data, columnType);

    drawChart(chart, window.google.visualization.AreaChart, data, options);
  });
};

let renderGeoChart = function (chart) {
  waitForLoaded(function () {
    let chartOptions = {
      legend: "none",
      colorAxis: {
        colors: chart.options.colors || ["#f6c7b6", "#ce502d"]
      }
    };
    let options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

    let data = new window.google.visualization.DataTable();
    data.addColumn("string", "");
    data.addColumn("number", chart.options.label || "Value");
    data.addRows(chart.data);

    drawChart(chart, window.google.visualization.GeoChart, data, options);
  });
};

let renderScatterChart = function (chart) {
  waitForLoaded(function () {
    let chartOptions = {};
    let options = jsOptions(chart, chart.options, chartOptions);

    let series = chart.data, rows2 = [], i, j, data, d;
    for (i = 0; i < series.length; i++) {
      d = series[i].data;
      for (j = 0; j < d.length; j++) {
        let row = new Array(series.length + 1);
        row[0] = d[j][0];
        row[i + 1] = d[j][1];
        rows2.push(row);
      }
    }

    data = new window.google.visualization.DataTable();
    data.addColumn("number", "");
    for (i = 0; i < series.length; i++) {
      data.addColumn("number", series[i].name);
    }
    data.addRows(rows2);

    drawChart(chart, window.google.visualization.ScatterChart, data, options);
  });
};

let renderTimeline = function (chart) {
  waitForLoaded("timeline", function () {
    let chartOptions = {
      legend: "none"
    };

    if (chart.options.colors) {
      chartOptions.colors = chart.options.colors;
    }
    let options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

    let data = new window.google.visualization.DataTable();
    data.addColumn({type: "string", id: "Name"});
    data.addColumn({type: "date", id: "Start"});
    data.addColumn({type: "date", id: "End"});
    data.addRows(chart.data);

    chart.element.style.lineHeight = "normal";

    drawChart(chart, window.google.visualization.Timeline, data, options);
  });
};

export default {
  name: "google",
  renderLineChart: renderLineChart,
  renderPieChart: renderPieChart,
  renderColumnChart: renderColumnChart,
  renderBarChart: renderBarChart,
  renderAreaChart: renderAreaChart,
  renderScatterChart: renderScatterChart,
  renderGeoChart: renderGeoChart,
  renderTimeline: renderTimeline
};
