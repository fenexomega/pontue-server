var express     = require('express');
var router      = express.Router();
var app         = express();
var jwt         = require('jsonwebtoken');
var config      = require('../../config');


// middleware de login
//****** SÓ PONHA ABAIXO DESSE MIDDLEWARE O QUE PRECISA DE AUTNETICAÇÃO PARA
//******* SER FEITO
var auth = function(req,res,next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token)
  {
    jwt.verify(token, config.secret,
    function(err, decoded){
      if(err)
      {
        console.log(err);
        res.status(403).json({error:"Token não autorizado"});
      }
      else
      {
        // log("Usuário foi decodificado")
        req.decoded = decoded;
        next();
      }
    });
  }
  else
  {
    //** code: 1 == invalid
    return res.status(403).send({ code: 1});
  }
}

module.exports = auth;
