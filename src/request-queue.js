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
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    requestComplete();
    if (xhr.status === 200) {
      success(JSON.parse(xhr.responseText));
    } else {
      error(xhr.statusText);
    }
  };
  xhr.send();
}

export { pushRequest };
