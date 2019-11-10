## 3.2.0 [unreleased]

- Fixed prototype pollution - see [#117](https://github.com/ankane/chartkick.js/issues/117)
- Added `bytes` option for Chart.js
- Added `precision` option
- Added `round` option
- Added `zeros` option

## 3.1.3

- Removed `Error Loading Chart` prefix for callback errors

## 3.1.2

- Added support for callbacks as data
- Fixed `stacked` option for Highcharts area charts
- Fixed error with jQuery slim
- Fixed deprecation warning with Chart.js 2.9.0+

## 3.1.1

- Fixed missing bar chart labels with Chart.js 2.8.0

## 3.1.0

- Improved `require` so `default` is no longer needed
- Added `use` function
- Added `xmin` and `xmax` for Chart.js
- Fixed Highcharts tooltip colors
- Fixed error when passing images to options

## 3.0.2

- Added `Chartkick.setDefaultOptions` function
- Added `points` and `curve` options for individual series with Chart.js
- Added support for download background color
- Raise an error for `refresh` option and non-URL data source

## 3.0.1

- Fixed numeric axes for Chart.js column and bar charts

## 3.0.0

- Added `code` option
- Fixed `dataset` option for scatter charts

Breaking changes

- Removed `xtype` option - numeric axes are automatically detected
- Removed `window.Chartkick = {...}` way to set config - use `Chartkick.configure` instead
- Removed support for the Google Charts jsapi loader - use loader.js instead

## 2.3.6

- Added `dataset` option for Chart.js
- Added `destroy` function

## 2.3.5

- Added `addAdapter` function

## 2.3.4

- Fixed module build
- Fixed `Cannot read property 'config' of undefined` error
- Fixed error when switching between data and no data with empty message with Chart.js

## 2.3.3

- Fixed error when minified

## 2.3.2

- Fixed export for modules
- Added more `stacked` options

## 2.3.1

- Fixed issues with `thousands` option
- Friendlier error messages when charting library not found
- Refresh interval now updates when `refresh` option changed
- Removed experimental `Chartkick.createChart` function
- Stopped pushing updates to Bower

## 2.3.0

- Added `prefix` and `suffix` options for Chart.js and Highcharts
- Added `thousands` and `decimal` options for Chart.js and Highcharts
- Added `messages` option
- Fixed boolean labels for column chart
- Clean up charts before refresh

## 2.2.4

- Added multiple series stacked and grouped charts - *Chart.js and Highcharts*
- Fixed `refreshData` after `updateData`
- Fixed redraw issue with HighCharts

## 2.2.3

- Added `xtype` option
- Added `points` option
- Added `mapsApiKey` option to `configure`

## 2.2.2

- Fixed missing scatter points for Google Charts
- Fixed scatter chart for Highcharts
- Limit concurrent requests to avoid overloading servers
- Added ability to specify color with series for Chart.js and Highcharts
- Added bubble chart for Chart.js [experimental]

## 2.2.1

- Added `curve` option
- Added `legend` option
- Added `title` option
- Added `getAdapter` function
- Added `setOptions` function
- Added `redraw` function
- Fixed column order for Google Charts and Highcharts

## 2.2.0

- Added global options
- Added `download` option - *Chart.js only*
- Added `updateData` function
- Added `refreshData` function
- Added `refresh` option
- Added `stopRefresh` function
- Added `getDataSource` function
- Added `donut` option to pie chart
- Added `eachChart` function
- Remove colors from tooltips for Chart.js pie chart

## 2.1.2

- Fix for missing zero values for Chart.js

## 2.1.1

- Fix for missing values for multiple series column chart with sparse data
- Remove colors from tooltips for Chart.js

## 2.1.0

- Added basic support for new Google Charts loader
- Added `configure` function
- Dropped jQuery and Zepto dependencies for AJAX
- Fixed legend colors on scatter chart for Chart.js

## 2.0.1

- Added scatter chart for Chart.js
- Fixed error with `xtitle` and `ytitle` on column and bar charts
- Fixed all zeros with Chart.js
- Fixed odd tick spacing with Chart.js

## 2.0.0

- Chart.js is now the default adapter - yay open source!
- Axis types are automatically detected - no need for `discrete: true`
- Better date support
- New official API
- Fixed min and max for Chart.js bar charts

## 1.5.1

- Added bar chart for Chart.js
- Added `library` option for series
- Better tick selection for time and discrete scales

## 1.5.0

- Added Chart.js adapter **beta**
- Added `smarterDates` option (temporary until 2.0)
- Added `smarterDiscrete` option (temporary until 2.0)
- Fixed line height on timeline charts

## 1.4.2

- Added `label` option
- Better tooltip for dates for Google Charts

## 1.4.1

- Fixed regression with `min: null`

## 1.4.0

- Added scatter chart
- Added axis titles

## 1.3.0

- Added timelines
- Added `adapter` option

## 1.2.2

- Added `colors` option

## 1.2.1

- Added `discrete` option

## 1.2.0

- Added geo chart
- Added `stacked` option

## 1.1.1

- Made sure options can be overridden
- Added support for Google Charts localization

## 1.1.0

- Added bar chart and area chart
- Resize charts when window is resized

## 1.0.2

- Added library option

## 1.0.1

- Added support for Highcharts 2.1+
- Fixed sorting for line chart with multiple series and Google Charts

## 1.0.0

- First major release
