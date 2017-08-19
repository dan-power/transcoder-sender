/*

This is a simple script to automate transcoding of various files to a fixed format.

NOT PRODUCTION READY

*/

var amqp = require('amqplib');
var filesystem = require("fs");

var q = 'transcode_these';
var options = process.env.HANDBRAKE_OPTS;

require('amqplib').connect('amqp://'+process.env.RABBITMQ, function(err, conn) {
  if (err != null) bail(err);

  conn.createChannel(on_open);
});

function bail(err) {
  console.error(err);
  process.exit(1);
}

function on_open(err, ch) {
  if (err != null) bail(err);
  ch.assertQueue(q);

  _getAllFilesFromFolder(process.env.WATCH_PATH).forEach(function (file) {
    ch.sendToQueue(q, new Buffer({
      filename: file,
      options: options
    }));
  });
}

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
