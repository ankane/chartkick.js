---
name: Bug report
about: Report a bug
title: ''
labels: ''
assignees: ''

---

**First**
Search existing issues to see if it’s been reported and make sure you’re on the latest version.

**Describe the bug**
A clear and concise description of the bug. Include the complete backtrace for exceptions.

**To reproduce**
Use this code to reproduce:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script src="https://unpkg.com/chartkick"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.2.1/dist/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@2.0.0/dist/chartjs-adapter-date-fns.bundle.js"></script>
    <!-- <script src="https://www.gstatic.com/charts/loader.js"></script> -->
    <!-- <script src="https://code.highcharts.com/highcharts.js"></script> -->
  </head>
  <body>
    <div id="chart" style="height: 300px;"></div>
    <script>
      new Chartkick.LineChart("chart", yourData, yourOptions);
    </script>
  </body>
</html>
```
