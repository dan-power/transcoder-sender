var filesystem = require("fs");
var open = require('amqplib').connect('amqp://'+process.env.RABBITMQ);

var q = 'transcode_these';
var options = process.env.HANDBRAKE_OPTS;

open.then(function(conn) {
  console.log('[-] connected, creating channel');

  return conn.createChannel();
}).then(function(ch) {
  return ch.assertQueue(q).then(function(ok) {
    console.log('[-] queue asserted');

    _getAllFilesFromFolder(process.env.WATCH_PATH).forEach(function (file) {
      console.log('[+] pushing %s to rabbitmq', file);

      ch.sendToQueue(q, new Buffer({
        filename: file,
        options: options
      }));
    });

    // return ch.sendToQueue(q, new Buffer('something to do'));
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
          console.log('[?] is %s an avi?', file);

          // make sure this is one of the files we want to transcode.
          if(file.match(new RegExp(process.env.TRANSCODE_FROM+'$'))) {
            results.push(file);
          }
        }
    });

    return results;
};
