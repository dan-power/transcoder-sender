/*

This is a simple script to automate transcoding of various files to a fixed format.

NOT PRODUCTION READY

*/

var amqp = require('amqplib');
var filesystem = require("fs");

var q = 'transcode_these';
var open = require('amqplib').connect('amqp://'+process.env.RABBITMQ);
var options = process.env.HANDBRAKE_OPTS;

var _getAllFilesFromFolder = function(dir) {
    var results = [];
    filesystem.readdirSync(dir).forEach(function(file) {
        file = dir+'/'+file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else  {
          // make sure this is one of the files we want to transcode.
          if(file.match(new RegExp(process.env.TRANSCODE_FROM+'$'))) {
            results.push(file);
          }
        }
    });

    return results;
};

_getAllFilesFromFolder(process.env.WATCH_PATH).forEach(function (file) {
  const mtime_ms = +file.mtime_ms;

  open.then(function(conn) {
    return conn.createChannel();
  }).then(function(ch) {
    return ch.assertQueue(q).then(function(ok) {
      return ch.sendToQueue(q, new Buffer({
        filename: file,
        options: options
      }));
    });
  }).catch(console.warn);
});
