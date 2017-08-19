const filesystem = require("fs");
const RabbitMQ = require('rabbitmq-node');
const rabbitmq = new RabbitMQ('amqp://'+process.env.RABBITMQ);

const q = 'transcode_these';
var top = [];
var options = process.env.HANDBRAKE_OPTS;
const watchPath = process.env.WATCH_PATH;

rabbitmq.on('error', function(err) {
  console.error(err);
});
rabbitmq.on('logs', function(print_log) {
  console.info(print_log);
});

// to speed this up a bit, get the first level only first.
// this way we can push to the queue while the rest of the files are being searched.
filesystem.readdirSync(watchPath).forEach(function(dir) {
  console.log('[x] preparing top level directories.');

  var stat = filesystem.statSync(watchPath+'/'+dir);

  if (stat && stat.isDirectory()) {
    top.push(watchPath+'/'+dir);
  }
});

top.forEach(function(path) {
  _getAllFilesFromFolder(path).forEach(function (file) {
    console.log('[+] pushing %s to rabbitmq', file);
    rabbitmq.publish(q, {
      filename: file,
      options: options
    });
  });
});

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
