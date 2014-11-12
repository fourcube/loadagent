'use strict';

var http = require('http');
var extend = require('util')._extend;




module.exports = (function () {
  var requestorId = 0;

  function registerResponse(data, payload, status) {
    // Get duration
    var diff = process.hrtime(this.t),
      timeInMillis,
      result;

    // Reset timer
    this.t = process.hrtime();

    timeInMillis = Math.floor(((diff[0] * 1e9) + diff[1]) / 1e6);

    result = {
      // The response data
      data: data,
      // Payload we sent with the request
      payload: payload,
      // Response Status code (can be -1 on error)
      statusCode: status,
      // Time between request and response
      timeInMillis: timeInMillis,
      // Timestamp of the response
      received_at: new Date()
    };

    console.log(result);

    this.sink.write(result);
  }

  function consume(payload) {
    var self = this;

    self.source.on('readable', function () {
      var queuedRequest = self.source.read();
      self.source.pause();

      if(!queuedRequest) {
        return;
      }

      queuedRequest.agent = self.agent;

      var req = http.request(queuedRequest);
      req.on('response', function (res) {
        var data = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
          data += chunk;
        });

        res.on('end', function () {
          self.registerResponse.call(self, data, payload, res.statusCode);
          self.source.resume();
        })
      });

      req.on('err', function (e) {
        self.registerResponse.call(self, e, payload, -1);
        self.source.resume();
      });

      if(payload) {
        req.write(payload);
      }

      self.t = process.hrtime();
      req.end();
    });
  }

  return function (opts) {
    this.agent = new http.Agent({
      maxSockets: 20
    });

    if (!opts.source) {
      throw new Error("No 'source' given for Requestor.");
    }

    this.source = opts.source;
    this.sink = opts.sink;

    this.registerResponse = registerResponse;
    this.id = "Requestor " + ++requestorId;

    consume.call(this);
  };
})();
