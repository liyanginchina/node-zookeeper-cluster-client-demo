var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var zookeeper = require('node-zookeeper-client');
var client = zookeeper.createClient('192.168.112.129:2181,192.168.112.130:2181,192.168.112.131:2181');

var rootnode = '/registry';
var znode = '/registry/service';

client.once('connected', function () {
  console.log('Connected to the server.');
  createNode(rootnode, zookeeper.CreateMode.PERSISTENT, function () {
    createNode(znode, zookeeper.CreateMode.PERSISTENT, function () {
      var address = '10.120.0.111:' + (process.env.PORT || '3000');
      createNode(znode + '/' + address, zookeeper.CreateMode.EPHEMERAL, function () {
        //setData
        client.setData(znode, new Buffer(address), function (error, stat) {// CreateMode.PERSISTENT
          if (error) {
            console.log(error.stack);
            return;
          }

          console.log('Data is set.     znode=' + address);
        });
      });

    });
  });
});

client.connect();

function createNode(znode, mode, callback) {
  client.exists(znode, function (error, stat) {
    if (error) {
      console.log(error.stack);
      return;
    }

    if (stat) {
      console.log('ZNode exists.');
      if (typeof (callback) === 'function') {
        callback();
      }
    } else {
      console.log('ZNode does not exist.');
      client.create(znode, mode, function (error) {
        //判断根节点并进行创建
        if (error) {
          console.log('Failed to create znode: %s due to: %s.', znode, error);
        } else {
          console.log('ZNode: %s is successfully created.', znode);
        }
        if (typeof (callback) === 'function') {
          callback();
        }
      });
    }
  });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
