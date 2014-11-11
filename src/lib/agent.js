'use strict';

var Requestor = require('./requestor');
var LinearRequestStream = require('./linear-request-stream');
var ResponseSink = require('./response-sink');
var monitor = require('./monitor');


var requestors = [];
var REQUESTS = process.env.REQUESTS || 300;
var PARALLELISM = process.env.PARALLEL || 10;
var TARGET = "http://localhost:8080/api";
var MONITOR = "http://localhost:3000";

console.log("Executing " + REQUESTS + " request(s).");


monitor.startRun(MONITOR).then(function (runID) {
  console.log("run: ", runID);

  var responseSink = new ResponseSink({
    monitorURL: MONITOR,
    runID: runID
  });

  // Create a standard request stream
  var requestSource = new LinearRequestStream({
    targetURL: TARGET,
    maxRequests: REQUESTS
  });

  // Initialize agents
  for (var i = 0; i < PARALLELISM; i++) {
    requestors.push(new Requestor({
      source: requestSource,
      sink: responseSink
    }));
  }

});

//function randomInt(min, max) {
//  return Math.floor(Math.random() * (max - min) + min);
//}

// Dispatch requests
//for (var r = 0; r < REQUESTS; r++) {
//  var requestorIndex = randomInt(0, PARALLELISM);
//
//  requestors[requestorIndex].send();
//}

