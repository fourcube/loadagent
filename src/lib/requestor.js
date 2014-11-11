'use strict';

var http = require('http');
var extend = require('util')._extend;




module.exports = (function () {
  var requestorId = 0;


  function registerResponse(data, payload, status) {
    // Get duration
    var diff = process.hrtime(this.t);
    // Reset timer
    this.t = process.hrtime();

    console.log(this.id, diff);
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
    this.t = process.hrtime();

    this.registerResponse = registerResponse;
    this.id = "Requestor " + ++requestorId;

    consume.call(this);
  };
})();