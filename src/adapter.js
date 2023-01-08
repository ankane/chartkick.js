import ChartjsAdapter from "./adapters/chartjs";
import HighchartsAdapter from "./adapters/highcharts";
import GoogleChartsAdapter from "./adapters/google";
import { isFunction } from "./helpers";

const adapters = [];

function getAdapterType(library) {
  if (library) {
    if (library.product === "Highcharts") {
      return HighchartsAdapter;
    } else if (library.charts) {
      return GoogleChartsAdapter;
    } else if (isFunction(library)) {
      return ChartjsAdapter;
    }
  }
  throw new Error("Unknown adapter");
}

function addAdapter(library) {
  const adapterType = getAdapterType(library);

  for (let i = 0; i < adapters.length; i++) {
    if (adapters[i].library === library) {
      return;
    }
  }

  adapters.push(new adapterType(library));
}

function loadAdapters() {
  if ("Chart" in window) {
    addAdapter(window.Chart);
  }

  if ("Highcharts" in window) {
    addAdapter(window.Highcharts);
  }

  if (window.google && window.google.charts) {
    addAdapter(window.google);
  }
}

// TODO remove chartType if cross-browser way
// to get the name of the chart class
function callAdapter(chartType, chart) {
  let i, adapter;
  const fnName = "render" + chartType;
  const adapterName = chart.options.adapter;

  loadAdapters();

  for (i = 0; i < adapters.length; i++) {
    adapter = adapters[i];
    if ((!adapterName || adapterName === adapter.name) && isFunction(adapter[fnName])) {
      chart.adapter = adapter.name;
      chart.__adapterObject = adapter;
      return adapter[fnName](chart);
    }
  }

  if (adapters.length > 0) {
    throw new Error("No charting library found for " + chartType);
  } else {
    throw new Error("No charting libraries found - be sure to include one before your charts");
  }
}

export { adapters, addAdapter, callAdapter };
