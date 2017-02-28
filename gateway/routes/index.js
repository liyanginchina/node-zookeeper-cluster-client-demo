var express = require('express');
var router = express.Router();
//反向代理
var httpProxy = require('http-proxy');
var zookeeper = require('node-zookeeper-client');

var proxy = httpProxy.createProxyServer();

proxy.on('error', function (err, req, res) {
  res.end();//响应空白输出
});


var zk = zookeeper.createClient('192.168.112.129:2181,192.168.112.130:2181,192.168.112.131:2181');
zk.connect();
zk.once('connected', function () {
  console.log('Connected to the server.');
});

var znode = '/registry/service';
/* GET home page. */
router.all('/', function (req, res, next) {
  zk.exists(znode, function (event) {
    if (event.NODE_DELETED) {

    }
  }, function (error, stat) {
    if (stat) {
      zk.getChildren(znode, function (err, serviceAddress) {
        console.log(serviceAddress.toString());
        var serverLength = serviceAddress.length;
        if (serverLength === 0) {
          console.log('address node is not exists');
          res.end();
          return;
        }
        var address = '';
        if (serverLength === 1) {
          //只有一个地址
          address = serviceAddress[0];
        } else {
          //多个地址，随机获取一个
          address = serviceAddress[parseInt(Math.random() * serverLength)];
        }
        console.log('addressPath: %s', address);

        //执行反向代理任务
        proxy.web(req, res, {
          target: 'http://' + address //目标地址
        });
      });
    }
  });
  //res.render('index', { title: 'Express' });
});

module.exports = router;
