var express = require('express');
var router = express.Router();

router.use('/', require('./autenticar'));

module.exports = router;
