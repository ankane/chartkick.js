let pendingRequests = [], runningRequests = 0, maxRequests = 4;

function pushRequest(url, success, error) {
  pendingRequests.push([url, success, error]);
  runNext();
}

function runNext() {
  if (runningRequests < maxRequests) {
    let request = pendingRequests.shift();
    if (request) {
      runningRequests++;
      getJSON(request[0], request[1], request[2]);
      runNext();
    }
  }
}

function requestComplete() {
  runningRequests--;
  runNext();
}

function getJSON(url, success, error) {
  ajaxCall(url, success, function (jqXHR, textStatus, errorThrown) {
    let message = (typeof errorThrown === "string") ? errorThrown : errorThrown.message;
    error(message);
  });
}

function ajaxCall(url, success, error) {
  let $ = window.jQuery || window.Zepto || window.$;

  if ($) {
    $.ajax({
      dataType: "json",
      url: url,
      success: success,
      error: error,
      complete: requestComplete
    });
  } else {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      requestComplete();
      if (xhr.status === 200) {
        success(JSON.parse(xhr.responseText), xhr.statusText, xhr);
      } else {
        error(xhr, "error", xhr.statusText);
      }
    };
    xhr.send();
  }
}

export { pushRequest };
