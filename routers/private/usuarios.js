var express = require('express')
var router  = express.Router()
var Usuario = require('../../models/usuario');


// TODO: fazer teste
router.put('/usuario',function(req, res){
  var usuario = req.decoded._doc;
  var updateUsuario = req.body;
  console.log('id ' + updateUsuario._id);
  Usuario.findById(updateUsuario._id, function(error, usuarioDB){
    if(!error){
      for(var key in updateUsuario){
        usuarioDB[key] = updateUsuario[key];
      }
      usuarioDB.save(function(error, usuario){
        if(!error){
          res.json(usuario);
        }else{
          res.json({"error":"Não foi possível atualizar"});
        }
      });
    }else{
      res.json({"error": "Usuário não encontrado por ID"});
    }
  })
});


router.get('/usuario', function(req, res){
  var usuario = req.decoded._doc;
  /* JORDY: não gostei do fato de voltar o hash da senha do usuário, isso pode acarretar
      ...em um incidente de segurança. O hash JAMAIS deve sair do backend/servidor.
     ...Por comodidade, vou deixar aqui. */
  usuario = {_id: usuario._id, email: usuario.email, senha: usuario.senha,
    nome: usuario.nome, matricula: usuario.matricula };
  res.json(usuario);
});

router.get('/usuario/valido', function(req, res){
    res.status(200).json({message:'OK'});
});


module.exports = router;
