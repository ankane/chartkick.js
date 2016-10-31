## 2.1.1 [unreleased]

- Fix for missing values for multiple series column chart with sparse data

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
