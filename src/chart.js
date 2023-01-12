import { callAdapter } from "./adapter";
import Chartkick from "./chartkick";
import { dataEmpty } from "./data";
import { addDownloadButton } from "./download";
import { merge } from "./helpers";
import { pushRequest } from "./request-queue";

// helpers

function setText(element, text) {
  element.textContent = text;
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
    // TODO add downloadSupported method to adapter
    if (chart.options.download && !chart.__downloadAttached && chart.adapter === "chartjs") {
      addDownloadButton(chart);
    }
  }
}

function getElement(element) {
  if (typeof element === "string") {
    const elementId = element;
    element = document.getElementById(element);
    if (!element) {
      throw new Error("No element with id " + elementId);
    }
  }
  return element;
}

// define classes

class Chart {
  constructor(element, dataSource, options) {
    this.element = getElement(element);
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
        this.intervalId = setInterval(() => {
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
    // TODO move logic to adapter
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
      this.element.removeEventListener("mouseover", this.__enterEvent);
    }

    if (this.__leaveEvent) {
      this.element.removeEventListener("mouseout", this.__leaveEvent);
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

export default Chart;
