var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' + ' 10.120.0.111:' + (process.env.PORT || '3000') });
});

module.exports = router;
