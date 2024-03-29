import { adapters, addAdapter } from "./adapter";

const Chartkick = {
  charts: {},
  configure: function (options) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        Chartkick.config[key] = options[key];
      }
    }
  },
  setDefaultOptions: function (opts) {
    Chartkick.options = opts;
  },
  eachChart: function (callback) {
    for (const chartId in Chartkick.charts) {
      if (Object.prototype.hasOwnProperty.call(Chartkick.charts, chartId)) {
        callback(Chartkick.charts[chartId]);
      }
    }
  },
  destroyAll: function () {
    for (const chartId in Chartkick.charts) {
      if (Object.prototype.hasOwnProperty.call(Chartkick.charts, chartId)) {
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

export default Chartkick;
