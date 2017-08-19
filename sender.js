#!/usr/bin/env node
var amqp = require('amqplib'),
    WatchIO = require('watch.io'),
    watcher = new WatchIO()
;

const FILE_PATH = process.env.WATCH_PATH;
var q = 'transcode_these';
var open = require('amqplib').connect('amqp://'+process.env.RABBITMQ);

var options = process.env.HANDBRAKE_OPTS;

watcher.watch(FILE_PATH);

function pushToQueue( file, stat ) {
  if (file.match(new RegExp(process.env.TRANSCODE_FROM))) {
    console.log('create: '+file);
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
  }
}

watcher.on('create', pushToQueue);
watcher.on('refresh', pushToQueue);

watcher.on('error', function ( err, file ) {
  console.log('Oops! Error: '+ err + ' on file: ' + file);

  watcher.close(FILE_PATH);
  watcher.removeAllListeners();
});
