'use strict';

var Requestor = require('./requestor');

var requestors = [];
var REQUESTS = process.env.REQUESTS || 20;
var PARALLELISM = process.env.PARALLEL || 10;
var TARGET = "http://localhost:8080/api";

var MONITOR = "http://localhost:3000";

console.log("Executing " + REQUESTS + " request(s).");

// Create a standard request stream


// Initialize agents
for (var i = 0; i < PARALLELISM; i++) {
  requestors.push(new Requestor({
    method: "GET",
    target: TARGET
  }));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Dispatch requests
for (var r = 0; r < REQUESTS; r++) {
  var requestorIndex = randomInt(0, PARALLELISM);

  requestors[requestorIndex].send();
}

