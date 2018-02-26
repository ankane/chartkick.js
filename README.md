# Chartkick.js

Create beautiful charts with one line of JavaScript

[See it in action](https://ankane.github.io/chartkick.js/examples/)

Supports [Chart.js](http://www.chartjs.org/), [Google Charts](https://developers.google.com/chart/), and [Highcharts](https://www.highcharts.com/)

Also available for [React](https://github.com/ankane/react-chartkick), [Vue.js](https://github.com/ankane/vue-chartkick), [Ruby](https://github.com/ankane/chartkick), [Python](https://github.com/mher/chartkick.py), [Elixir](https://github.com/buren/chartkick-ex), and [Clojure](https://github.com/yfractal/chartkick)

## Usage

Create a div for the chart

```html
<div id="chart-1" style="height: 300px"></div>
```

Line chart

```javascript
new Chartkick.LineChart("chart-1", {"2017-01-01": 11, "2017-01-02": 6})
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
new Chartkick.AreaChart("chart-1", {"2017-01-01": 11, "2017-01-02": 6})
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
  {name: "Workout", data: {"2017-01-01": 3, "2017-01-02": 4}},
  {name: "Call parents", data: {"2017-01-01": 5, "2017-01-02": 3}}
]
new Chartkick.LineChart("chart-1", data)
```

Multiple series stacked and grouped - *Chart.js 2.5+ or Highcharts*

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

Min and max values

```javascript
new Chartkick.LineChart("chart-1", data, {min: 1000, max: 5000})
```

`min` defaults to 0 for charts with non-negative values. Use `null` to let the charting library decide.

Colors

```javascript
new Chartkick.LineChart("chart-1", data, {colors: ["#b00", "#666"]})
```

Stacked columns or bars

```javascript
new Chartkick.ColumnChart("chart-1", data, {stacked: true})
```

> You can also set `stacked` to `percent` or `relative` for Google Charts and `percent` for Highcharts [master]

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

Show a message when data is empty

```javascript
new Chartkick.LineChart("chart-1", data, {messages: {empty: "No data"}})
```

Refresh data from a remote source every `n` seconds

```javascript
new Chartkick.LineChart("chart-1", url, {refresh: 60})
```

You can pass options directly to the charting library with:

```javascript
new Chartkick.LineChart("chart-1", data, {library: {backgroundColor: "pink"}})
```

See the documentation for [Chart.js](http://www.chartjs.org/docs/), [Google Charts](https://developers.google.com/chart/interactive/docs/gallery), and [Highcharts](https://api.highcharts.com/highcharts) for more info.

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

Times can be a `Date`, a timestamp, or a string (strings are parsed)

```javascript
new Chartkick.LineChart("chart-1", [[new Date(), 5], [1368174456, 4], ["2017-01-01 00:00:00 UTC", 7]])
```

### Download Charts

*Chart.js only*

Give users the ability to download charts. It all happens in the browser - no server-side code needed.

```javascript
new Chartkick.LineChart("chart-1", data, {download: true})
```

Set the filename

```javascript
new Chartkick.LineChart("chart-1", data, {download: "boom"})
```

**Note:** Safari will open the image in a new window instead of downloading.

## Installation

### Yarn

Install the JavaScript libraries:

```sh
yarn add chartkick
yarn add chart.js # or highcharts
```

Then include them in your app.

```es6
import Chartkick from "chartkick";
window.Chartkick = Chartkick;

// for Chart.js
import Chart from "chart.js";
window.Chart = Chart;

// for Highcharts
import Highcharts from "highcharts";
window.Highcharts = Highcharts;

// for Google Charts
// just include https://www.gstatic.com/charts/loader.js in your views
```

### No Package Manager

Download [chartkick.js](https://unpkg.com/chartkick@2.3.3) directly.

For Chart.js (works with 2.1+), [download the bundle](http://www.chartjs.org/docs/#getting-started-download-chart-js) and use:

```html
<script src="/path/to/Chart.bundle.js"></script>
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

### Localization

To specify a language for Google Charts, add:

```javascript
Chartkick.configure({language: "de"})
```

after the JavaScript files and before your charts.

### Adapter

If more than one charting library is loaded, choose between them with:

```javascript
new Chartkick.LineChart("chart-1", data, {adapter: "google"}) // or highcharts
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

To run the files in the `examples` directory, you'll need a web server.  Run:

```sh
python -m SimpleHTTPServer
```

and visit [http://localhost:8000/examples/](http://localhost:8000/examples/)

## Upgrading

### 2.0

Breaking changes

- Chart.js is now the default adapter if multiple are loaded - yay open source!
- Axis types are automatically detected - no need for `discrete: true`
- Better date support - dates are no longer treated as UTC

## Credits

Chartkick uses [iso8601.js](https://github.com/Do/iso8601.js) to parse dates and times.

## History

View the [changelog](https://github.com/ankane/chartkick.js/blob/master/CHANGELOG.md)

Chartkick.js follows [Semantic Versioning](https://semver.org/)

## Contributing

Everyone is encouraged to help improve this project. Here are a few ways you can help:

- [Report bugs](https://github.com/ankane/chartkick.js/issues)
- Fix bugs and [submit pull requests](https://github.com/ankane/chartkick.js/pulls)
- Write, clarify, or fix documentation
- Suggest or add new features

See the [Contributing Guide](CONTRIBUTING.md) for more info.
