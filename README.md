# Chartkick.js

Create beautiful charts with one line of JavaScript

[See it in action](https://ankane.github.io/chartkick.js/examples/)

**Chartkick.js 4.0 was recently released** - see [how to upgrade](#upgrading)

Supports [Chart.js](https://www.chartjs.org/), [Google Charts](https://developers.google.com/chart/), and [Highcharts](https://www.highcharts.com/)

Also available for [React](https://github.com/ankane/react-chartkick), [Vue.js](https://github.com/ankane/vue-chartkick), [Ruby](https://github.com/ankane/chartkick), [Python](https://github.com/mher/chartkick.py), [Elixir](https://github.com/buren/chartkick-ex), and [Clojure](https://github.com/yfractal/chartkick)

[![Build Status](https://github.com/ankane/chartkick.js/workflows/build/badge.svg?branch=master)](https://github.com/ankane/chartkick.js/actions)

## Quick Start

Run

```sh
npm install chartkick chart.js
```

And add

```javascript
import Chartkick from "chartkick"
import "chartkick/chart.js"
```

This sets up Chartkick with Chart.js. For other charting libraries, see [detailed instructions](#installation).

## Charts

Create a div for the chart

```html
<div id="chart-1" style="height: 300px;"></div>
```

Line chart

```javascript
new Chartkick.LineChart("chart-1", {"2021-01-01": 11, "2021-01-02": 6})
```

Pie chart

```javascript
new Chartkick.PieChart("chart-1", [["Blueberry", 44], ["Strawberry", 23]])
```

Column chart

```javascript
new Chartkick.ColumnChart("chart-1", [["Sun", 32], ["Mon", 46], ["Tue", 28]])
```

Bar chart

```javascript
new Chartkick.BarChart("chart-1", [["Work", 32], ["Play", 1492]])
```

Area chart

```javascript
new Chartkick.AreaChart("chart-1", {"2021-01-01": 11, "2021-01-02": 6})
```

Scatter chart

```javascript
new Chartkick.ScatterChart("chart-1", [[174.0, 80.0], [176.5, 82.3], [180.3, 73.6]])
```

Geo chart - *Google Charts*

```javascript
new Chartkick.GeoChart("chart-1", [["United States", 44], ["Germany", 23], ["Brazil", 22]])
```

Timeline - *Google Charts*

```javascript
new Chartkick.Timeline("chart-1", [["Washington", "1789-04-29", "1797-03-03"], ["Adams", "1797-03-03", "1801-03-03"]])
```

Multiple series

```javascript
data = [
  {name: "Workout", data: {"2021-01-01": 3, "2021-01-02": 4}},
  {name: "Call parents", data: {"2021-01-01": 5, "2021-01-02": 3}}
]
new Chartkick.LineChart("chart-1", data)
```

Multiple series stacked and grouped - *Chart.js or Highcharts*

```javascript
data = [
  {name: "Apple", data: {"Tuesday": 3, "Friday": 4}, stack: "fruit"},
  {name: "Pear", data: {"Tuesday": 1, "Friday": 8}, stack: "fruit"},
  {name: "Carrot", data: {"Tuesday": 3, "Friday": 4}, stack: "vegetable"},
  {name: "Beet", data: {"Tuesday": 1, "Friday": 8}, stack: "vegetable"}
]
new Chartkick.BarChart("chart-1", data, {stacked: true})
```

### Say Goodbye To Timeouts

Make your pages load super fast and stop worrying about timeouts. Give each chart its own endpoint.

```javascript
new Chartkick.LineChart("chart-1", "/stocks")
```

### Options

Min and max for y-axis

```javascript
new Chartkick.LineChart("chart-1", data, {min: 1000, max: 5000})
```

`min` defaults to 0 for charts with non-negative values. Use `null` to let the charting library decide.

Min and max for x-axis - *Chart.js*

```javascript
new Chartkick.LineChart("chart-1", data, {xmin: "2021-01-01", xmax: "2022-01-01"})
```

Colors

```javascript
new Chartkick.LineChart("chart-1", data, {colors: ["#b00", "#666"]})
```

Stacked columns or bars

```javascript
new Chartkick.ColumnChart("chart-1", data, {stacked: true})
```

> You can also set `stacked` to `percent` or `relative` for Google Charts and `percent` for Highcharts

Discrete axis

```javascript
new Chartkick.LineChart("chart-1", data, {discrete: true})
```

Label (for single series)

```javascript
new Chartkick.LineChart("chart-1", data, {label: "Value"})
```

Axis titles

```javascript
new Chartkick.LineChart("chart-1", data, {xtitle: "Time", ytitle: "Population"})
```

Straight lines between points instead of a curve

```javascript
new Chartkick.LineChart("chart-1", data, {curve: false})
```

Hide points

```javascript
new Chartkick.LineChart("chart-1", data, {points: false})
```

Show or hide legend

```javascript
new Chartkick.LineChart("chart-1", data, {legend: true})
```

Specify legend position

```javascript
new Chartkick.LineChart("chart-1", data, {legend: "bottom"})
```

Donut chart

```javascript
new Chartkick.PieChart("chart-1", data, {donut: true})
```

Prefix, useful for currency - *Chart.js, Highcharts*

```javascript
new Chartkick.LineChart("chart-1", data, {prefix: "$"})
```

Suffix, useful for percentages - *Chart.js, Highcharts*

```javascript
new Chartkick.LineChart("chart-1", data, {suffix: "%"})
```

Set a thousands separator - *Chart.js, Highcharts*

```javascript
new Chartkick.LineChart("chart-1", data, {thousands: ","})
```

Set a decimal separator - *Chart.js, Highcharts*

```javascript
new Chartkick.LineChart("chart-1", data, {decimal: ","})
```

Set significant digits - *Chart.js, Highcharts*

```javascript
new Chartkick.LineChart("chart-1", data, {precision: 3})
```

Set rounding - *Chart.js, Highcharts*

```javascript
new Chartkick.LineChart("chart-1", data, {round: 2})
```

Show insignificant zeros, useful for currency - *Chart.js, Highcharts*

```javascript
new Chartkick.LineChart("chart-1", data, {round: 2, zeros: true})
```

Friendly byte sizes - *Chart.js*

```javascript
new Chartkick.LineChart("chart-1", data, {bytes: true})
```

Specify the message when the chart is loading

```javascript
new Chartkick.LineChart("chart-1", data, {loading: "Loading..."})
```

Specify the message when data is empty

```javascript
new Chartkick.LineChart("chart-1", data, {empty: "No data"})
```

Refresh data from a remote source every `n` seconds

```javascript
new Chartkick.LineChart("chart-1", url, {refresh: 60})
```

You can pass options directly to the charting library with:

```javascript
new Chartkick.LineChart("chart-1", data, {library: {backgroundColor: "pink"}})
```

See the documentation for [Chart.js](https://www.chartjs.org/docs/), [Google Charts](https://developers.google.com/chart/interactive/docs/gallery), and [Highcharts](https://api.highcharts.com/highcharts) for more info.

To customize datasets in Chart.js, use:

```javascript
new Chartkick.LineChart("chart-1", data, {dataset: {borderWidth: 10}})
```

You can pass this option to individual series as well.

### Global Options

To set options for all of your charts, use:

```javascript
Chartkick.options = {
  colors: ["#b00", "#666"]
}
```

### Data

Pass data as an array or object

```javascript
new Chartkick.PieChart("chart-1", {"Blueberry": 44, "Strawberry": 23})
new Chartkick.PieChart("chart-1", [["Blueberry", 44], ["Strawberry", 23]])
```

Times can be a `Date` or a string (strings are parsed)

```javascript
new Chartkick.LineChart("chart-1", [[new Date(), 5], ["2021-01-01 00:00:00 UTC", 7]])
```

Data can also be a callback

```javascript
function fetchData(success, fail) {
  success({"Blueberry": 44, "Strawberry": 23})
  // or fail("Data not available")
}

new Chartkick.LineChart("chart-1", fetchData)
```

### Multiple Series

You can pass a few options with a series:

- `name`
- `data`
- `color`
- `dataset` - *Chart.js only*
- `points` - *Chart.js only*
- `curve` - *Chart.js only*

### Code

If you want to use the charting library directly, get the code with:

```javascript
new Chartkick.LineChart("chart-1", data, {code: true})
```

The code will be logged to the JavaScript console.

**Note:** JavaScript functions cannot be logged, so it may not be identical.

### Download Charts

*Chart.js only*

Give users the ability to download charts. It all happens in the browser - no server-side code needed.

```javascript
new Chartkick.LineChart("chart-1", data, {download: true})
```

Set the filename

```javascript
new Chartkick.LineChart("chart-1", data, {download: {filename: "boom"}})
```

**Note:** Safari will open the image in a new window instead of downloading.

Set the background color

```javascript
new Chartkick.LineChart("chart-1", data, {download: {background: "#fff"}})
```

## Installation

### Chart.js

Run

```sh
npm install chartkick chart.js
```

And add

```javascript
import Chartkick from "chartkick"
import "chartkick/chart.js"
```

### Google Charts

Run

```sh
npm install chartkick
```

And add

```javascript
import Chartkick from "chartkick"
```

And include on the page

```html
<script src="https://www.gstatic.com/charts/loader.js"></script>
```

To specify a language or Google Maps API key, use:

```js
Chartkick.configure({language: "de", mapsApiKey: "..."})
```

before your charts.

### Highcharts

Run

```sh
npm install chartkick highcharts
```

And add

```javascript
import Chartkick from "chartkick"
import "chartkick/highcharts"
```

### No Package Manager

Download [chartkick.js](https://unpkg.com/chartkick) directly.

For Chart.js (works with 3+), [download it](https://unpkg.com/chart.js@3/dist/chart.js) and the [date-fns adapter bundle](https://unpkg.com/chartjs-adapter-date-fns@2/dist/chartjs-adapter-date-fns.bundle.js) and use:

```html
<script src="/path/to/chart.js"></script>
<script src="/path/to/chartjs-adapter-date-fns.bundle.js"></script>
<script src="chartkick.js"></script>
```

For Google Charts, use:

```html
<script src="https://www.gstatic.com/charts/loader.js"></script>
<script src="chartkick.js"></script>
```

For Highcharts (works with 2.1+), [download it](https://www.highcharts.com/download) and use:

```html
<script src="/path/to/highcharts.js"></script>
<script src="chartkick.js"></script>
```

### Multiple Libraries

If more than one charting library is loaded, choose between them with:

```javascript
new Chartkick.LineChart("chart-1", data, {adapter: "google"}) // or highcharts or chartjs
```

### API

Access a chart with:

```javascript
var chart = Chartkick.charts["chart-id"]
```

Get the underlying chart object with:

```javascript
chart.getChartObject()
```

You can also use:

```javascript
chart.getElement()
chart.getData()
chart.getOptions()
chart.getAdapter()
```

Update the data with:

```javascript
chart.updateData(newData)
```

You can also specify new options:

```javascript
chart.setOptions(newOptions)
// or
chart.updateData(newData, newOptions)
```

Refresh the data from a remote source:

```javascript
chart.refreshData()
```

Redraw the chart with:

```javascript
chart.redraw()
```

Loop over charts with:

```javascript
Chartkick.eachChart( function(chart) {
  // do something
})
```

## Custom Adapters

**Note:** This feature is experimental.

Add your own custom adapter with:

```javascript
var CustomAdapter = {
  name: "custom",
  renderLineChart: function (chart) {
    chart.getElement().innerHTML = "Hi";
  }
};

Chartkick.adapters.unshift(CustomAdapter);
```

## Examples

To run the files in the `examples` directory, you’ll need a web server. Run:

```sh
npm install -g serve
serve
```

and visit [http://localhost:5000/examples/](http://localhost:5000/examples/)

## Upgrading

### 4.0

Run:

```sh
npm install chartkick@latest
```

For Chart.js, also run:

```sh
npm install chart.js@latest
```

And change:

```javascript
import Chart from "chart.js"

Chartkick.use(Chart)
```

to:

```javascript
import "chartkick/chart.js"
```

## History

View the [changelog](https://github.com/ankane/chartkick.js/blob/master/CHANGELOG.md)

## Contributing

Everyone is encouraged to help improve this project. Here are a few ways you can help:

- [Report bugs](https://github.com/ankane/chartkick.js/issues)
- Fix bugs and [submit pull requests](https://github.com/ankane/chartkick.js/pulls)
- Write, clarify, or fix documentation
- Suggest or add new features

See the [Contributing Guide](CONTRIBUTING.md) for more info.
