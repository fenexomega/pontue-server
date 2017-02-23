var express = require('express');
var router  = express.Router();

router.use('/',require('./public'));
router.use('/', require('./private'));

module.exports  = router;
