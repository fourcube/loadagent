'use strict';

var Readable = require('stream').Readable;
var url = require('url');
var util = require('util');

module.exports = (function () {
  var count = 0;

  var LinearRequestStream = function(options) {
    options = util._extend(options, {objectMode: true});
    Readable.call(this, options);

    var self = this;

    self.produce = function () {
      if(count >= options.maxRequests) {
        console.log("Done.", count);
        self.push(null);
        return;
      }

      var data = url.parse("http://localhost:8080/api");
      data.method = "GET";

      self.push(data);
      count++;
    }
  };

  util.inherits(LinearRequestStream, Readable);

  LinearRequestStream.prototype._read = function () {
    this.produce();
  };

  return LinearRequestStream;
})();