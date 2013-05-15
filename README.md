# Chartkick.js

Create beautiful Javascript charts with minimal code.

[See it in action](http://ankane.github.io/chartkick/)

Supports [Google Charts](https://developers.google.com/chart/) and [Highcharts](http://www.highcharts.com/) and works with most browsers (including IE 6)

:kissing_heart: For Ruby, check out the [chartkick](https://github.com/ankane/chartkick) gem

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

Multiple series (except pie chart)

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

**Note:** This feature requires jQuery at the moment.

### Options

min and max values (except pie chart)

```javascript
new Chartkick.LineChart("chart-1", {"Football": 45, "Soccer": 56}, {"min": 1000, "max": 5000});
```

### Data

Pass data as a Hash or Array

```javascript
new Chartkick.PieChart("chart-1", {"Blueberry": 44, "Strawberry": 23});
new Chartkick.PieChart("chart-1", [["Blueberry", 44],["Strawberry", 23]]);
```

Times can be a date, a timestamp, or a string (strings are parsed)

```javascript
new Chartkick.LineChart("chart-1", [[new Date(), 5],["1368174456", 4],["2013-05-07 00:00:00 UTC", 7]]);
```

## Installation

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

## Examples

To run the files in the `examples` directory, you'll need a web server.  Run:

```sh
python -m SimpleHTTPServer
```

and visit (http://localhost:8000/examples/)[http://localhost:8000/examples/]

## Credits

Chartkick uses [iso8601.js](https://github.com/Do/iso8601.js) to parse dates and times.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
