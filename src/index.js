import { adapters, addAdapter, callAdapter } from "./adapter";
import { dataEmpty, processSeries, processSimple } from "./data";
import { addDownloadButton, removeEvent } from "./download";
import { merge, toDate } from "./helpers";
import { pushRequest } from "./request-queue";

// helpers

function setText(element, text) {
  if (document.body.innerText) {
    element.innerText = text;
  } else {
    element.textContent = text;
  }
}

// TODO remove prefix for all messages
function chartError(element, message, noPrefix) {
  if (!noPrefix) {
    message = "Error Loading Chart: " + message;
  }
  setText(element, message);
  element.style.color = "#ff0000";
}

function errorCatcher(chart) {
  try {
    chart.__render();
  } catch (err) {
    chartError(chart.element, err.message);
    throw err;
  }
}

function fetchDataSource(chart, dataSource, showLoading) {
  // only show loading message for urls and callbacks
  if (showLoading && chart.options.loading && (typeof dataSource === "string" || typeof dataSource === "function")) {
    setText(chart.element, chart.options.loading);
  }

  if (typeof dataSource === "string") {
    pushRequest(dataSource, function (data) {
      chart.rawData = data;
      errorCatcher(chart);
    }, function (message) {
      chartError(chart.element, message);
    });
  } else if (typeof dataSource === "function") {
    try {
      dataSource(function (data) {
        chart.rawData = data;
        errorCatcher(chart);
      }, function (message) {
        chartError(chart.element, message, true);
      });
    } catch (err) {
      chartError(chart.element, err, true);
    }
  } else {
    chart.rawData = dataSource;
    errorCatcher(chart);
  }
}

function renderChart(chartType, chart) {
  if (dataEmpty(chart.data, chartType)) {
    const message = chart.options.empty || (chart.options.messages && chart.options.messages.empty) || "No data";
    setText(chart.element, message);
  } else {
    callAdapter(chartType, chart);
    if (chart.options.download && !chart.__downloadAttached && chart.adapter === "chartjs") {
      addDownloadButton(chart);
    }
  }
}

// define classes

class Chart {
  constructor(element, dataSource, options) {
    let elementId;
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

    Chartkick.charts[element.id] = this;

    fetchDataSource(this, dataSource, true);

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
    fetchDataSource(this, dataSource, true);
  }

  setOptions(options) {
    this.__updateOptions(options);
    this.redraw();
  }

  redraw() {
    fetchDataSource(this, this.rawData);
  }

  refreshData() {
    if (typeof this.dataSource === "string") {
      // prevent browser from caching
      const sep = this.dataSource.indexOf("?") === -1 ? "?" : "&";
      const url = this.dataSource + sep + "_=" + (new Date()).getTime();
      fetchDataSource(this, url);
    } else if (typeof this.dataSource === "function") {
      fetchDataSource(this, this.dataSource);
    }
  }

  startRefresh() {
    const refresh = this.options.refresh;

    if (refresh && typeof this.dataSource !== "string" && typeof this.dataSource !== "function") {
      throw new Error("Data source must be a URL or callback for refresh");
    }

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

  toImage(download) {
    if (this.adapter === "chartjs") {
      if (download && download.background && download.background !== "transparent") {
        // https://stackoverflow.com/questions/30464750/chartjs-line-chart-set-background-color
        const canvas = this.chart.canvas;
        const ctx = this.chart.ctx;
        const tmpCanvas = document.createElement("canvas");
        const tmpCtx = tmpCanvas.getContext("2d");
        tmpCanvas.width = ctx.canvas.width;
        tmpCanvas.height = ctx.canvas.height;
        tmpCtx.fillStyle = download.background;
        tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCtx.drawImage(canvas, 0, 0);
        return tmpCanvas.toDataURL("image/png");
      } else {
        return this.chart.toBase64Image();
      }
    } else {
      throw new Error("Feature only available for Chart.js");
    }
  }

  destroy() {
    this.destroyed = true;
    this.stopRefresh();

    if (this.__adapterObject) {
      this.__adapterObject.destroy(this);
    }

    if (this.__enterEvent) {
      removeEvent(this.element, "mouseover", this.__enterEvent);
    }

    if (this.__leaveEvent) {
      removeEvent(this.element, "mouseout", this.__leaveEvent);
    }
  }

  __updateOptions(options) {
    const updateRefresh = options.refresh && options.refresh !== this.options.refresh;
    this.options = merge(Chartkick.options, options);
    if (updateRefresh) {
      this.stopRefresh();
      this.startRefresh();
    }
  }

  __render() {
    this.data = this.__processData();
    renderChart(this.__chartName(), this);
  }

  __config() {
    return Chartkick.config;
  }
}

class LineChart extends Chart {
  __processData() {
    return processSeries(this);
  }

  __chartName() {
    return "LineChart";
  }
}

class PieChart extends Chart {
  __processData() {
    return processSimple(this);
  }

  __chartName() {
    return "PieChart";
  }
}

class ColumnChart extends Chart {
  __processData() {
    return processSeries(this, null, true);
  }

  __chartName() {
    return "ColumnChart";
  }
}

class BarChart extends Chart {
  __processData() {
    return processSeries(this, null, true);
  }

  __chartName() {
    return "BarChart";
  }
}

class AreaChart extends Chart {
  __processData() {
    return processSeries(this);
  }

  __chartName() {
    return "AreaChart";
  }
}

class GeoChart extends Chart {
  __processData() {
    return processSimple(this);
  }

  __chartName() {
    return "GeoChart";
  }
}

class ScatterChart extends Chart {
  __processData() {
    return processSeries(this, "number");
  }

  __chartName() {
    return "ScatterChart";
  }
}

class BubbleChart extends Chart {
  __processData() {
    return processSeries(this, "bubble");
  }

  __chartName() {
    return "BubbleChart";
  }
}

class Timeline extends Chart {
  __processData() {
    let i;
    const data = this.rawData;
    for (i = 0; i < data.length; i++) {
      data[i][1] = toDate(data[i][1]);
      data[i][2] = toDate(data[i][2]);
    }
    return data;
  }

  __chartName() {
    return "Timeline";
  }
}

const Chartkick = {
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
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        Chartkick.config[key] = options[key];
      }
    }
  },
  setDefaultOptions: function (opts) {
    Chartkick.options = opts;
  },
  eachChart: function (callback) {
    for (const chartId in Chartkick.charts) {
      if (Chartkick.charts.hasOwnProperty(chartId)) {
        callback(Chartkick.charts[chartId]);
      }
    }
  },
  destroyAll: function () {
    for (const chartId in Chartkick.charts) {
      if (Chartkick.charts.hasOwnProperty(chartId)) {
        Chartkick.charts[chartId].destroy();
        delete Chartkick.charts[chartId];
      }
    }
  },
  config: {},
  options: {},
  adapters: adapters,
  addAdapter: addAdapter,
  use: function (adapter) {
    addAdapter(adapter);
    return Chartkick;
  }
};

// not ideal, but allows for simpler integration
if (typeof window !== "undefined" && !window.Chartkick) {
  window.Chartkick = Chartkick;

  // clean up previous charts before Turbolinks loads new page
  document.addEventListener("turbolinks:before-render", function () {
    if (Chartkick.config.autoDestroy !== false) {
      Chartkick.destroyAll();
    }
  });
  document.addEventListener("turbo:before-render", function () {
    if (Chartkick.config.autoDestroy !== false) {
      Chartkick.destroyAll();
    }
  });

  // use setTimeout so charting library can come later in same JS file
  setTimeout(function () {
    window.dispatchEvent(new Event("chartkick:load"));
  }, 0);
}

// backwards compatibility for esm require
Chartkick.default = Chartkick;

export default Chartkick;
