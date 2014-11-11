'use strict';

var Writable = require('stream').Writable;
var url = require('url');
var http = require('http');
var util = require('util');

module.exports = (function () {
  var count = 0;
  util.inherits(ResponseSink, Writable);

  function ResponseSink (options) {
    options = util._extend(options, {objectMode: true});
    Writable.call(this, options);

    var self = this;

    self.store = function (data) {
      var storeRequest = url.parse(url.resolve(options.monitorURL, '/run/' + options.runID));
      storeRequest.method = 'PUT';
      storeRequest.headers = {
        'Content-Type': 'application/json'
      };

      var req = http.request(storeRequest);

      req.on('error', function (e) {
        console.error(e);
      });

      req.on('response', function (res) {
        res.on('data', function () {});
      });

      req.end(JSON.stringify(data));
    }
  }

  ResponseSink.prototype._write = function (data, encoding, callback) {
    this.store(data, callback);
    callback();
  };

  return ResponseSink;
})();