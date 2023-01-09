import { jsOptionsFunc, merge, toStr, sortByTime, sortByNumberSeries, isDay } from "../helpers";

const loaded = {};
const callbacks = [];

// Set chart options
const defaultOptions = {
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

function hideLegend(options, legend, hideLegend) {
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
}

function setTitle(options, title) {
  options.title = title;
  options.titleTextStyle = {color: "#333", fontSize: "20px"};
}

function setMin(options, min) {
  options.vAxis.viewWindow.min = min;
}

function setMax(options, max) {
  options.vAxis.viewWindow.max = max;
}

function setBarMin(options, min) {
  options.hAxis.viewWindow.min = min;
}

function setBarMax(options, max) {
  options.hAxis.viewWindow.max = max;
}

function setStacked(options, stacked) {
  options.isStacked = stacked || false;
}

function setXtitle(options, title) {
  options.hAxis.title = title;
  options.hAxis.titleTextStyle.italic = false;
}

function setYtitle(options, title) {
  options.vAxis.title = title;
  options.vAxis.titleTextStyle.italic = false;
}

const jsOptions = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle);

function resize(callback) {
  if (window.attachEvent) {
    window.attachEvent("onresize", callback);
  } else if (window.addEventListener) {
    window.addEventListener("resize", callback, true);
  }
  callback();
}

export default class {
  constructor(library) {
    this.name = "google";
    this.library = library;
  }

  renderLineChart(chart) {
    this.waitForLoaded(chart, () => {
      const chartOptions = {};

      if (chart.options.curve === false) {
        chartOptions.curveType = "none";
      }

      if (chart.options.points === false) {
        chartOptions.pointSize = 0;
      }

      const options = jsOptions(chart, chart.options, chartOptions);
      const data = this.createDataTable(chart.data, chart.xtype);

      this.drawChart(chart, "LineChart", data, options);
    });
  }

  renderPieChart(chart) {
    this.waitForLoaded(chart, () => {
      const chartOptions = {
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
      const options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

      const data = new this.library.visualization.DataTable();
      data.addColumn("string", "");
      data.addColumn("number", "Value");
      data.addRows(chart.data);

      this.drawChart(chart, "PieChart", data, options);
    });
  }

  renderColumnChart(chart) {
    this.waitForLoaded(chart, () => {
      const options = jsOptions(chart, chart.options);
      const data = this.createDataTable(chart.data, chart.xtype);

      this.drawChart(chart, "ColumnChart", data, options);
    });
  }

  renderBarChart(chart) {
    this.waitForLoaded(chart, () => {
      const chartOptions = {
        hAxis: {
          gridlines: {
            color: "#ccc"
          }
        }
      };
      const options = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setBarMin, setBarMax, setStacked, setXtitle, setYtitle)(chart, chart.options, chartOptions);
      const data = this.createDataTable(chart.data, chart.xtype);

      this.drawChart(chart, "BarChart", data, options);
    });
  }

  renderAreaChart(chart) {
    this.waitForLoaded(chart, () => {
      const chartOptions = {
        isStacked: true,
        pointSize: 0,
        areaOpacity: 0.5
      };

      const options = jsOptions(chart, chart.options, chartOptions);
      const data = this.createDataTable(chart.data, chart.xtype);

      this.drawChart(chart, "AreaChart", data, options);
    });
  }

  renderGeoChart(chart) {
    this.waitForLoaded(chart, "geochart", () => {
      const chartOptions = {
        legend: "none",
        colorAxis: {
          colors: chart.options.colors || ["#f6c7b6", "#ce502d"]
        }
      };
      const options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

      const data = new this.library.visualization.DataTable();
      data.addColumn("string", "");
      data.addColumn("number", chart.options.label || "Value");
      data.addRows(chart.data);

      this.drawChart(chart, "GeoChart", data, options);
    });
  }

  renderScatterChart(chart) {
    this.waitForLoaded(chart, () => {
      const chartOptions = {};
      const options = jsOptions(chart, chart.options, chartOptions);

      const series = chart.data;
      const rows2 = [];
      for (let i = 0; i < series.length; i++) {
        series[i].name = series[i].name || "Value";
        const d = series[i].data;
        for (let j = 0; j < d.length; j++) {
          const row = new Array(series.length + 1);
          row[0] = d[j][0];
          row[i + 1] = d[j][1];
          rows2.push(row);
        }
      }

      const data = new this.library.visualization.DataTable();
      data.addColumn("number", "");
      for (let i = 0; i < series.length; i++) {
        data.addColumn("number", series[i].name);
      }
      data.addRows(rows2);

      this.drawChart(chart, "ScatterChart", data, options);
    });
  }

  renderTimeline(chart) {
    this.waitForLoaded(chart, "timeline", () => {
      const chartOptions = {
        legend: "none"
      };

      if (chart.options.colors) {
        chartOptions.colors = chart.options.colors;
      }
      const options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

      const data = new this.library.visualization.DataTable();
      data.addColumn({type: "string", id: "Name"});
      data.addColumn({type: "date", id: "Start"});
      data.addColumn({type: "date", id: "End"});
      data.addRows(chart.data);

      chart.element.style.lineHeight = "normal";

      this.drawChart(chart, "Timeline", data, options);
    });
  }

  // TODO remove resize events
  destroy(chart) {
    if (chart.chart) {
      chart.chart.clearChart();
    }
  }

  drawChart(chart, type, data, options) {
    this.destroy(chart);
    if (chart.destroyed) return;

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
      const loadOptions = {
        packages: [pack],
        callback: () => { this.runCallbacks(); }
      };
      const config = chart.__config();
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
    for (let i = 0; i < callbacks.length; i++) {
      const cb = callbacks[i];
      const call = this.library.visualization && ((cb.pack === "corechart" && this.library.visualization.LineChart) || (cb.pack === "timeline" && this.library.visualization.Timeline) || (cb.pack === "geochart" && this.library.visualization.GeoChart));
      if (call) {
        cb.callback();
        callbacks.splice(i, 1);
        i--;
      }
    }
  }

  // cant use object as key
  createDataTable(series, columnType) {
    const rows = [];
    const sortedLabels = [];
    for (let i = 0; i < series.length; i++) {
      const s = series[i];
      series[i].name = series[i].name || "Value";

      for (let j = 0; j < s.data.length; j++) {
        const d = s.data[j];
        const key = columnType === "datetime" ? d[0].getTime() : d[0];
        if (!rows[key]) {
          rows[key] = new Array(series.length);
          sortedLabels.push(key);
        }
        rows[key][i] = d[1];
      }
    }

    const rows2 = [];
    let day = true;
    for (let j = 0; j < sortedLabels.length; j++) {
      const i = sortedLabels[j];
      let value;
      if (columnType === "datetime") {
        value = new Date(i);
        day = day && isDay(value);
      } else {
        value = i;
      }
      rows2.push([value].concat(rows[i]));
    }

    if (columnType === "datetime") {
      rows2.sort(sortByTime);
    } else if (columnType === "number") {
      rows2.sort(sortByNumberSeries);

      for (let i = 0; i < rows2.length; i++) {
        rows2[i][0] = toStr(rows2[i][0]);
      }

      columnType = "string";
    }

    // create datatable
    const data = new this.library.visualization.DataTable();
    columnType = columnType === "datetime" && day ? "date" : columnType;
    data.addColumn(columnType, "");
    for (let i = 0; i < series.length; i++) {
      data.addColumn("number", series[i].name);
    }
    data.addRows(rows2);

    return data;
  }
}
