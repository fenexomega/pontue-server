var express = require('express');
var jwt     = require('jsonwebtoken');
var router  = express.Router();


var Usuario = require('../../models/usuario');
var config  = require('../../config');



router.post('/autenticar', function(req,res){
/*
*
*   CÓDIGOS DA AUTENTICAÇÃO:
*   0 - SUCESSO,
*   1 - FALHA: USUÁRIO NÃO ENCONTRADO,
*   2 - FALHA: SENHA INCORRETA
*   3 - FALHA: NÃO SOUBE O MOTIVO
*
*/
var json = req.body;

  // Find the usuario
  Usuario.getByEmail(json.email,
    function(err, usuario){
      var text_password = json.senha;
      if(err)
      {
        console.log(err);
        throw err;
      }

      if(!usuario)
      {
        // FIXME, na resopsta tem de enviar o código 403: NOT AUTHORIZED
        res.json({ code: 1, success: false});
      }
      else
      {
        if(text_password != usuario.senha)
        {
          res.json({ code: 2, success: false});
        }
        else
        {
          var token = jwt.sign(usuario, config.secret,{
            expiresIn: 60*60*24 // Expira em 24 horas
          });
          res.json({
            success: true,
            code: 0,
            token: token
          });
        }
      }
  });
});

// Função de cadastro
router.post('/registrar',function (req,res) {
  var status = 200;

  var usuario = req.body;
  console.log(usuario);
  // Segurança: não deixar o cliente atribuir que é admin...
  usuario.admin = false;

  Usuario.add(usuario,function(err,use){
    var response;
    if(err)
    {
      response = {code:500,message: 'Email já cadastrado'}
      status = 500;
      console.log(err);
    }
    else
      response = {code:200,message:'OK'};
    res.json(response).status(status);
  });
});


module.exports = router;
