'use strict';

var http = require('http');
var url = require('url');
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

  function send(payload) {
    var self = this;


    var req = http.request(this.options);
    req.on('response', function (res) {
      var data = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        self.registerResponse.call(self, data, payload, res.statusCode);
      })
    });

    req.on('err', function (e) {
      self.registerResponse.call(self, e, payload, -1);
    });

    if(payload) {
      req.write(payload);
    }

    req.end();
  }

  var Requestor = function (opts) {
    var agent = new http.Agent({
      maxSockets: 1
    });

    this.options = url.parse(opts.target);
    this.options.method = opts.method;
    this.options.agent = agent;
    this.t = process.hrtime();

    this.send = send;
    this.registerResponse = registerResponse;

    this.id = "Requestor " + ++requestorId;
  };

  return Requestor;
})();