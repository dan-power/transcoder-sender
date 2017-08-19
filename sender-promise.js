var filesystem = require("fs");
var path = require("path");
var open = require('amqplib').connect('amqp://'+process.env.RABBITMQ);

var q = 'transcode_these';
var top = [];
var options = process.env.HANDBRAKE_OPTS;

// to speed this up a bit, get the first level only first.
// this way we can push to the queue while the rest of the files are being searched.
filesystem.readdirSync(process.env.WATCH_PATH).forEach(function(dir) {
  var stat = filesystem.statSync(process.env.WATCH_PATH+'/'+dir);

  if (stat && stat.isDirectory()) {
    top.push(process.env.WATCH_PATH+'/'+dir);
  }
});

open.then(function(conn) {
  console.log('[-] connected, creating channel');

  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(q).then(function(ok) {
    top.forEach(function(path) {
      _getAllFilesFromFolder(path).forEach(function (file) {
        console.log('[+] pushing %s to rabbitmq', file);
        ch.sendToQueue(q, new Buffer(file));
      });
    });
  });
}).catch(console.warn);

function _getAllFilesFromFolder(dir) {
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
