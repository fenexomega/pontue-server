var express = require('express');
var router = express.Router();

var autenticacao = require('./autenticar');

router.use('/',autenticacao, require('./usuarios'));
router.use('/',autenticacao, require('./pontos'));

module.exports = router;
