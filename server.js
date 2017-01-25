// carregar o .env do projeto
require('dotenv').config()

var express     = require('express');//importo o express
var app         = express();//criando o app do tipo express

var http        = require('http');//importando o http
var bodyParser  = require('body-parser');//importo o bodyParser
var mongoose    = require('mongoose');
var morgan      = require('morgan');
var path        = require('path');
var fs          = require('fs');
var multiparty  = require('connect-multiparty');
var jwt         = require('jsonwebtoken');
var config      = require('./config');
var cryptoUtil  = require('./util/cryptoUtil');
var moment      = require('moment')

// Iniciando porta
var port = process.env.PORT || 8080;

// Database
mongoose.connect(config.database);
var db = mongoose.connection;// pegando a conecção


// MODELOS
// ** tem de iniciar depois do mongoose e do autoincrement
var Usuario = require('./models/usuario');
var Ponto   = require('./models/ponto');

// colocando segredo no app
app.set('secret',config.secret);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded());
app.use(bodyParser.json()); //dizendo para o app q será usado json


app.use(morgan('dev'));//ativando o log do servidor para vizualizar as requisições

app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers','Content-Type');
  next();
})

/********** SETUP INICIAL ***************
*        CRIAR CONTA DE ADMIN
*/
Usuario.getByEmail('admin',function(err,usuario){

  if(err) throw err;

  if(!usuario)
  {
    var admin = { nome: "Admin", email:"admin",
    senha:"admin12345", matricula: "00000000000000", admin: true};

    Usuario.add(admin,function(err,usuario){
      if(err) throw err;

      if(usuario)
        console.log("Usuário admin criado com sucesso");
    });
  }
});



var router = express.Router();//criando o roteador



router.get('/',function (req,res) {
  res.send('Você não deveria estar aqui');
});


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
          var token = jwt.sign(usuario, app.get('secret'),{
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
  var usuario = req.body;
  console.log(usuario);
  // Segurança: não deixar o cliente atribuir que é admin...
  usuario.admin = false;
  Usuario.add(usuario,function(err,use){
    var response;
    if(err)
    {
      response = {code:500,message: 'Email já cadastrado'}
      console.log(err);
    }
    else
      response = {code:200,message:'OK'};
    res.json(response);
  });
});



// middleware de login
//****** SÓ PONHA ABAIXO DESSE MIDDLEWARE O QUE PRECISA DE AUTNETICAÇÃO PARA
//******* SER FEITO
router.use(function(req,res,next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token)
  {
    jwt.verify(token,app.get('secret'),function(err, decoded){
      if(err)
        console.log(err);
      else
      {
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
});

//rota: /api/pokemons body={name:nome,type:tipo}
router.post('/ponto',function (req,res) {
  var ponto = req.body;
  var usuario = req.decoded;
  ponto.feitoPor = usuario;

  // Segurança, não deixar o usuário atribuir as horas
  ponto.horasDia = 0;
  var horas = 0;
  for(var chave in ponto.horarios)
  {
    // .hasOwnProperty() ??
    for(var chaveTurno in ponto.horarios[chave])
    {
      if(ponto.horarios[chave][chaveTurno] == true)
        horas += 2;
    }
  }
  ponto.horasDia = horas;

  Ponto.add(ponto,function(err,ponto){
    if(err) throw err;
    res.json(ponto);
  })
});

router.get('/usuario', function(req, res){
  var usuario = req.decoded._doc;
  usuario = { email: usuario.email, nome: usuario.nome,
     matricula: usuario.matricula };

  res.json(usuario);
});


// //delete pokemon
// //rota: /api/pokemons/_name (a,b,c...)
// router.delete('/pokemons/:_name',function(req,res){
//   var name = req.params._name;
//   Pokemon.deletePokemon(name,function(err,pokemon){
//     if(err){
//       res.json("Algo de errado não está certo!");
//     }
//     res.json("Pokemon removed");
//   });
//   /*pokemons.splice(id,1);
//   res.json('Pokemon removed');*/
//   //console.log('[INFO]: Delete Pokemon with _name = '+name);
// });

//definindo a principal caminho (principal rota)
app.use('/api',router);
app.use(express.static('public'));

var httpServer = http.createServer(app);
httpServer.listen(port);
console.log('[INFO]: Servidor rodando na porta ' + port);
