const pendingRequests = [];
let runningRequests = 0;
const maxRequests = 4;

function pushRequest(url, success, error) {
  pendingRequests.push([url, success, error]);
  runNext();
}

function runNext() {
  if (runningRequests < maxRequests) {
    const request = pendingRequests.shift();
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
    const message = (typeof errorThrown === "string") ? errorThrown : errorThrown.message;
    error(message);
  });
}

function ajaxCall(url, success, error) {
  const $ = window.jQuery || window.Zepto || window.$;

  if ($ && $.ajax) {
    $.ajax({
      dataType: "json",
      url: url,
      success: success,
      error: error,
      complete: requestComplete
    });
  } else {
    const xhr = new XMLHttpRequest();
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
