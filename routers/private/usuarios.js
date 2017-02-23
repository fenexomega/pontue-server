var express = require('express')
var router  = express.Router()
var Usuario = require('../../models/usuario');



// TODO: fazer teste
router.put('/usuarios',function(req, res){
  var usuario = req.decoded._doc;
  var updateUsuario = req.body;
  Usuario.update(updateUsuario,function(err,usuario){
    if(err){
      error(err);
      res.json({ erro: 'Não foi possível fazer o update'}).status(404);
    }
    else{
      res.json(usuario);
    }
  });

});

router.get('/usuario', function(req, res){
  var usuario = req.decoded._doc;
  usuario = { email: usuario.email, nome: usuario.nome,
     matricula: usuario.matricula };

  res.json(usuario);
});



module.exports = router;
