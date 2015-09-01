# Chartkick.js

Create beautiful Javascript charts with minimal code.

[See it in action](http://ankane.github.io/chartkick.js/examples/)

Supports [Google Charts](https://developers.google.com/chart/) and [Highcharts](http://www.highcharts.com/) and works with most browsers (including IE 6)

#### Server-side Integration

- [Ruby](https://github.com/ankane/chartkick)
- [Python](https://github.com/mher/chartkick.py)

I would love to see this implemented in other languages too!!

## Usage

Create a div for the chart

```html
<div id="chart-1" style="height: 300px;"></div>
```

Line chart

```javascript
new Chartkick.LineChart("chart-1", {"2013-02-10 00:00:00 -0800": 11, "2013-02-11 00:00:00 -0800": 6});
```

Pie chart

```javascript
new Chartkick.PieChart("chart-1", [["Blueberry", 44],["Strawberry", 23]]);
```

Column chart

```javascript
new Chartkick.ColumnChart("chart-1", [["Sun", 32],["Mon", 46],["Tue", 28]]);
```

Bar chart

```javascript
new Chartkick.BarChart("chart-1", [["Work", 32],["Play", 1492]]);
```

Area chart

```javascript
new Chartkick.AreaChart("chart-1", {"2013-02-10 00:00:00 -0800": 11, "2013-02-11 00:00:00 -0800": 6});
```

Scatter chart

```javascript
new Chartkick.ScatterChart("chart-1", [[174.0, 80.0], [176.5, 82.3], [180.3, 73.6], [167.6, 74.1], [188.0, 85.9]]);
```

Geo chart

```javascript
new Chartkick.GeoChart("chart-1", [["United States",44],["Germany",23],["Brazil",22]]);
```

Timeline

```javascript
new Chartkick.Timeline("chart-1", [["Washington", "1789-04-29", "1797-03-03"],["Adams", "1797-03-03", "1801-03-03"]]);
```

Multiple series

```javascript
data = [
  {"name":"Workout", "data": {"2013-02-10 00:00:00 -0800": 3, "2013-02-17 00:00:00 -0800": 4}},
  {"name":"Call parents", "data": {"2013-02-10 00:00:00 -0800": 5, "2013-02-17 00:00:00 -0800": 3}}
];
new Chartkick.LineChart("chart-1", data);
```

### Say Goodbye To Timeouts

Make your pages load super fast and stop worrying about timeouts.  Give each chart its own endpoint.

```javascript
new Chartkick.LineChart("chart-1", "/stocks");
```

**Note:** This feature requires [jQuery](http://jquery.com/) or [Zepto](http://zeptojs.com/) at the moment.

### Options

Min and max values

```javascript
new Chartkick.LineChart("chart-1", data, {"min": 1000, "max": 5000});
```

`min` defaults to 0 for charts with non-negative values. Use `null` to let the charting library decide.

Colors

```javascript
new Chartkick.LineChart("chart-1", data, {"colors": ["pink", "#999"]});
```

Stacked columns or bars

```javascript
new Chartkick.ColumnChart("chart-1", data, {"stacked": true});
```

Discrete axis

```javascript
new Chartkick.LineChart("chart-1", data, {"discrete": true});
```

Axis titles

```javascript
new Chartkick.LineChart("chart-1", data, {"xtitle": "Time", "ytitle": "Population"});
```

You can pass options directly to the charting library with:

```javascript
new Chartkick.LineChart("chart-1", data, {"library": {"backgroundColor": "pink"}});
```

### Data

Pass data as a Hash or Array

```javascript
new Chartkick.PieChart("chart-1", {"Blueberry": 44, "Strawberry": 23});
new Chartkick.PieChart("chart-1", [["Blueberry", 44],["Strawberry", 23]]);
```

Times can be a `Date`, a timestamp, or a string (strings are parsed)

```javascript
new Chartkick.LineChart("chart-1", [[new Date(), 5],[1368174456, 4],["2013-05-07 00:00:00 UTC", 7]]);
```

## Installation

Download [directly](https://raw.githubusercontent.com/ankane/chartkick.js/master/chartkick.js), or with npm or Bower:

```sh
npm install chartkick
# or
bower install chartkick
```

For Google Charts, use:

```html
<script src="//www.google.com/jsapi"></script>
<script src="chartkick.js"></script>
```

If you prefer Highcharts, use:

```html
<script src="/path/to/highcharts.js"></script>
<script src="chartkick.js"></script>
```

Works with Highcharts 2.1+

### Localization

To specify a language for Google Charts, add:

```html
<script>
  var Chartkick = {"language": "de"};
</script>
```

**before** the javascript files.

### Adapter

If both Google Charts and Highcharts are loaded, choose between them with:

```javascript
new Chartkick.LineChart("chart-1", data, {"adapter": "google"}); // or highcharts
```

## Examples

To run the files in the `examples` directory, you'll need a web server.  Run:

```sh
python -m SimpleHTTPServer
```

and visit [http://localhost:8000/examples/](http://localhost:8000/examples/)

## Credits

Chartkick uses [iso8601.js](https://github.com/Do/iso8601.js) to parse dates and times.

## History

View the [changelog](https://github.com/ankane/chartkick.js/blob/master/CHANGELOG.md)

Chartkick.js follows [Semantic Versioning](http://semver.org/)

## Contributing

Everyone is encouraged to help improve this project. Here are a few ways you can help:

- [Report bugs](https://github.com/ankane/chartkick.js/issues)
- Fix bugs and [submit pull requests](https://github.com/ankane/chartkick.js/pulls)
- Write, clarify, or fix documentation
- Suggest or add new features
