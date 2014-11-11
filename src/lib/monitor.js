'use strict';

var Q = require('q');
var http = require('http');
var url = require('url');

module.exports = {
  startRun: function (monitorURL) {
    var deferred = Q.defer();

    var options = url.parse(url.resolve(monitorURL, '/run'));
    options.method = 'POST';
    options.headers = {
      'Content-Type': 'application/json'
    };

    var req = http.request(options);

    req.on('response', function (res) {
      var data = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        data += chunk;
      });

      res.on('end', function () {
        var run = JSON.parse(data);
        deferred.resolve(run._id);
      });
    });

    req.end();
    return deferred.promise;
  }
};