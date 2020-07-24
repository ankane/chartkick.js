import { jsOptionsFunc, merge, toStr, toFloat, sortByTime, sortByNumberSeries, isDay } from "../helpers";

let loaded = {};
let callbacks = [];

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

let resize = function (callback) {
  if (window.attachEvent) {
    window.attachEvent("onresize", callback);
  } else if (window.addEventListener) {
    window.addEventListener("resize", callback, true);
  }
  callback();
};

export default class {
  constructor(library) {
    this.name = "google";
    this.library = library;
  }

  renderLineChart(chart) {
    this.waitForLoaded(chart, () => {
      let chartOptions = {};

      if (chart.options.curve === false) {
        chartOptions.curveType = "none";
      }

      if (chart.options.points === false) {
        chartOptions.pointSize = 0;
      }

      let options = jsOptions(chart, chart.options, chartOptions);
      let data = this.createDataTable(chart.data, chart.xtype);

      this.drawChart(chart, "LineChart", data, options);
    });
  }

  renderPieChart(chart) {
    this.waitForLoaded(chart, () => {
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

      let data = new this.library.visualization.DataTable();
      data.addColumn("string", "");
      data.addColumn("number", "Value");
      data.addRows(chart.data);

      this.drawChart(chart, "PieChart", data, options);
    });
  }

  renderColumnChart(chart) {
    this.waitForLoaded(chart, () => {
      let options = jsOptions(chart, chart.options);
      let data = this.createDataTable(chart.data, chart.xtype);

      this.drawChart(chart, "ColumnChart", data, options);
    });
  }

  renderBarChart(chart) {
    this.waitForLoaded(chart, () => {
      let chartOptions = {
        hAxis: {
          gridlines: {
            color: "#ccc"
          }
        }
      };
      let options = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setBarMin, setBarMax, setStacked, setXtitle, setYtitle)(chart, chart.options, chartOptions);
      let data = this.createDataTable(chart.data, chart.xtype);

      this.drawChart(chart, "BarChart", data, options);
    });
  }

  renderAreaChart(chart) {
    this.waitForLoaded(chart, () => {
      let chartOptions = {
        isStacked: true,
        pointSize: 0,
        areaOpacity: 0.5
      };

      let options = jsOptions(chart, chart.options, chartOptions);
      let data = this.createDataTable(chart.data, chart.xtype);

      this.drawChart(chart, "AreaChart", data, options);
    });
  }

  renderGeoChart(chart) {
    this.waitForLoaded(chart, "geochart", () => {
      let chartOptions = {
        legend: "none",
        colorAxis: {
          colors: chart.options.colors || ["#f6c7b6", "#ce502d"]
        }
      };
      let options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

      let data = new this.library.visualization.DataTable();
      data.addColumn("string", "");
      data.addColumn("number", chart.options.label || "Value");
      data.addRows(chart.data);

      this.drawChart(chart, "GeoChart", data, options);
    });
  }

  renderScatterChart(chart) {
    this.waitForLoaded(chart, () => {
      let chartOptions = {};
      let options = jsOptions(chart, chart.options, chartOptions);

      let series = chart.data, rows2 = [], i, j, data, d;
      for (i = 0; i < series.length; i++) {
        series[i].name = series[i].name || "Value";
        d = series[i].data;
        for (j = 0; j < d.length; j++) {
          let row = new Array(series.length + 1);
          row[0] = d[j][0];
          row[i + 1] = d[j][1];
          rows2.push(row);
        }
      }

      data = new this.library.visualization.DataTable();
      data.addColumn("number", "");
      for (i = 0; i < series.length; i++) {
        data.addColumn("number", series[i].name);
      }
      data.addRows(rows2);

      this.drawChart(chart, "ScatterChart", data, options);
    });
  }

  renderTimeline(chart) {
    this.waitForLoaded(chart, "timeline", () => {
      let chartOptions = {
        legend: "none"
      };

      if (chart.options.colors) {
        chartOptions.colors = chart.options.colors;
      }
      let options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

      let data = new this.library.visualization.DataTable();
      data.addColumn({type: "string", id: "Name"});
      data.addColumn({type: "date", id: "Start"});
      data.addColumn({type: "date", id: "End"});
      data.addRows(chart.data);

      chart.element.style.lineHeight = "normal";

      this.drawChart(chart, "Timeline", data, options);
    });
  }

  destroy(chart) {
    if (chart.chart) {
      chart.chart.clearChart();
    }
  }

  drawChart(chart, type, data, options) {
    this.destroy(chart);

    if (chart.options.code) {
      window.console.log("var data = new google.visualization.DataTable(" + data.toJSON() + ");\nvar chart = new google.visualization." + type + "(element);\nchart.draw(data, " + JSON.stringify(options) + ");");
    }

    chart.chart = new this.library.visualization[type](chart.element);
    resize(function () {
      chart.chart.draw(data, options);
    });
  }

  waitForLoaded(chart, pack, callback) {
    if (!callback) {
      callback = pack;
      pack = "corechart";
    }

    callbacks.push({pack: pack, callback: callback});

    if (loaded[pack]) {
      this.runCallbacks();
    } else {
      loaded[pack] = true;

      // https://groups.google.com/forum/#!topic/google-visualization-api/fMKJcyA2yyI
      let loadOptions = {
        packages: [pack],
        callback: () => { this.runCallbacks(); }
      };
      let config = chart.__config();
      if (config.language) {
        loadOptions.language = config.language;
      }
      if (pack === "geochart" && config.mapsApiKey) {
        loadOptions.mapsApiKey = config.mapsApiKey;
      }

      this.library.charts.load("current", loadOptions);
    }
  }

  runCallbacks() {
    let cb, call;
    for (let i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];
      call = this.library.visualization && ((cb.pack === "corechart" && this.library.visualization.LineChart) || (cb.pack === "timeline" && this.library.visualization.Timeline) || (cb.pack === "geochart" && this.library.visualization.GeoChart));
      if (call) {
        cb.callback();
        callbacks.splice(i, 1);
        i--;
      }
    }
  }

  // cant use object as key
  createDataTable(series, columnType) {
    let i, j, s, d, key, rows = [], sortedLabels = [];
    for (i = 0; i < series.length; i++) {
      s = series[i];
      series[i].name = series[i].name || "Value";

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

      for (i = 0; i < rows2.length; i++) {
        rows2[i][0] = toStr(rows2[i][0]);
      }

      columnType = "string";
    }

    // create datatable
    let data = new this.library.visualization.DataTable();
    columnType = columnType === "datetime" && day ? "date" : columnType;
    data.addColumn(columnType, "");
    for (i = 0; i < series.length; i++) {
      data.addColumn("number", series[i].name);
    }
    data.addRows(rows2);

    return data;
  }
}
