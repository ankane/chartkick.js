import Chartkick from "./chartkick";
import { LineChart, PieChart, ColumnChart, BarChart, AreaChart, GeoChart, ScatterChart, BubbleChart, Timeline } from "./charts";

Chartkick.LineChart = LineChart;
Chartkick.PieChart = PieChart;
Chartkick.ColumnChart = ColumnChart;
Chartkick.BarChart = BarChart;
Chartkick.AreaChart = AreaChart;
Chartkick.GeoChart = GeoChart;
Chartkick.ScatterChart = ScatterChart;
Chartkick.BubbleChart = BubbleChart;
Chartkick.Timeline = Timeline;

// not ideal, but allows for simpler integration
if (typeof window !== "undefined" && !window.Chartkick) {
  window.Chartkick = Chartkick;

  // clean up previous charts before Turbolinks loads new page
  document.addEventListener("turbolinks:before-render", function () {
    if (Chartkick.config.autoDestroy !== false) {
      Chartkick.destroyAll();
    }
  });

  // clean up previous charts before Turbo loads new page
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
