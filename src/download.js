function addDownloadButton(chart) {
  let element = chart.element;
  let link = document.createElement("a");

  let download = chart.options.download;
  if (download === true) {
    download = {};
  } else if (typeof download === "string") {
    download = {filename: download};
  }
  link.download = download.filename || "chart.png"; // https://caniuse.com/download

  link.style.position = "absolute";
  link.style.top = "20px";
  link.style.right = "20px";
  link.style.zIndex = 1000;
  link.style.lineHeight = "20px";
  link.target = "_blank"; // for safari
  let image = document.createElement("img");
  image.alt = "Download";
  image.style.border = "none";
  // icon from font-awesome
  // http://fa2png.io/
  image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAABCFBMVEUAAADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMywEsqxAAAAV3RSTlMAAQIDBggJCgsMDQ4PERQaHB0eISIjJCouLzE0OTo/QUJHSUpLTU5PUllhYmltcHh5foWLjI+SlaCio6atr7S1t7m6vsHHyM7R2tze5Obo7fHz9ff5+/1hlxK2AAAA30lEQVQYGUXBhVYCQQBA0TdYWAt2d3d3YWAHyur7/z9xgD16Lw0DW+XKx+1GgX+FRzM3HWQWrHl5N/oapW5RPe0PkBu+UYeICvozTWZVK23Ao04B79oJrOsJDOoxkZoQPWgX29pHpCZEk7rEvQYiNSFq1UMqvlCjJkRBS1R8hb00Vb/TajtBL7nTHE1X1vyMQF732dQhyF2o6SAwrzP06iUQzvwsArlnzcOdrgBhJyHa1QOgO9U1GsKuvjUTjavliZYQ8nNPapG6sap/3nrIdJ6bOWzmX/fy0XVpfzZP3S8OJT3g9EEiJwAAAABJRU5ErkJggg==";
  link.appendChild(image);
  element.style.position = "relative";

  chart.__downloadAttached = true;

  // mouseenter
  chart.__enterEvent = addEvent(element, "mouseover", function(e) {
    let related = e.relatedTarget;
    // check download option again to ensure it wasn't changed
    if ((!related || (related !== this && !childOf(this, related))) && chart.options.download) {
      link.href = chart.toImage(download);
      element.appendChild(link);
    }
  });

  // mouseleave
  chart.__leaveEvent = addEvent(element, "mouseout", function(e) {
    let related = e.relatedTarget;
    if (!related || (related !== this && !childOf(this, related))) {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }
  });
}

// https://stackoverflow.com/questions/10149963/adding-event-listener-cross-browser
function addEvent(elem, event, fn) {
  if (elem.addEventListener) {
    elem.addEventListener(event, fn, false);
    return fn;
  } else {
    let fn2 = function() {
      // set the this pointer same as addEventListener when fn is called
      return(fn.call(elem, window.event));
    };
    elem.attachEvent("on" + event, fn2);
    return fn2;
  }
}

function removeEvent(elem, event, fn) {
  if (elem.removeEventListener) {
    elem.removeEventListener(event, fn, false);
  } else {
    elem.detachEvent("on" + event, fn);
  }
}

// https://gist.github.com/shawnbot/4166283
function childOf(p, c) {
  if (p === c) return false;
  while (c && c !== p) c = c.parentNode;
  return c === p;
}

export { addDownloadButton, removeEvent };
