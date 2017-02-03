// http://www.restapitutorial.com/lessons/httpmethods.html
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
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers','Content-Type,X-Access-Token');

  if(req.method == 'OPTIONS')
  {
    res.send(200);
  }
  else {
    next();
  }

})

function log(message){
  console.log("[INFO] " + message);
}

function debug(message){
  console.log("[DEBUG] " + message);
}

function error(message){
  console.error("[ERROR] " + message);
}

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



// middleware de login
//****** SÓ PONHA ABAIXO DESSE MIDDLEWARE O QUE PRECISA DE AUTNETICAÇÃO PARA
//******* SER FEITO
router.use(function(req,res,next){


  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token)
  {
    jwt.verify(token,app.get('secret'),
    function(err, decoded){
      if(err)
      {
        console.log(err);
        res.json({error:"Token não autorizado"}).status(403);
      }
      else
      {
        log("Usuário foi decodificado")
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

// TODO: get pontos por dia da semana (as ultimas segunda, terça, quarta,...)
router.get('/pontos', function(req,res){
  var usuario = req.decoded._doc;
  var ano, semana;
  if(req.query.hasOwnProperty('ano'))
    ano = req.query.ano;
  if(req.query.hasOwnProperty('semana'))
    semana = req.query.semana;

  if(semana == undefined)
  {
    console.log("Ano = " + ano);
    if(ano == undefined)
    {
      error("Ano indefinido!")
      res.send(403);
    }
    Ponto.getByUsuarioAndAno(usuario, ano, function(err,data)
    {
      if(err)
      {
        error(err);
        res.status(500).json({messagem: "Erro"});
      }
      res.json(data);
    });
  }
  else
  {
    Ponto.getByUsuarioAndNumeroSemanaAndByAno(usuario, semana, ano, function(err,data)
     {
      if(err)
      {
        error(err);
        res.send(500);
      }
      res.json(data);
    });
  }
});

// Submeter ponto
router.post('/pontos',function (req,res) {
  var ponto = req.body;
  var usuario = req.decoded._doc;
  ponto.feitoPor = usuario._id;

  ponto.dataCriacao = Date();
  var momentInstance = moment(ponto.data);

  // Por segurança, o usuario não deve colocar a data do ponto...
  // isso pode acarretar em um usuário colocando ponto em um dia que...
  // ele não foi. Isso só vale para o admin.
  if(!ponto.hasOwnProperty('numeroDia') || usuario.admin == false)
    ponto.numeroDia = Number(momentInstance.format('d'));
  if(!ponto.hasOwnProperty('numeroMes') || usuario.admin == false)
    ponto.numeroMes = Number(momentInstance.format('M')) - 1;
  if(!ponto.hasOwnProperty('numeroSemana') || usuario.admin == false)
    ponto.numeroSemana = Number(momentInstance.format('w'));
  if(!ponto.hasOwnProperty('ano') || usuario_admin == false)
    ponto.ano = Number(momentInstance.format('YYYY'));

  if(ponto.hasOwnProperty('comentario') == false)
  {
    res.json({ messagem:"[ERRO] Está faltando a propriedade 'comentario'." }).status(403);
    return;
  }

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
    if(err){
      error(err);
      res.json({sucesso:false, messagem:"O seu objeto não foi validado."}).status(403);
      return;
    }
    ponto.populate('feitoPor');
    res.json(ponto);
  });
});

router.put('/pontos',function(req, res){
  var usuario = req.decoded._doc;
  var newPonto = req.body;
  // FIXME falha de lógica. não checa se o usuário é o dono do ponto
  Ponto.update(newPonto._id,newPonto,function(err,ponto){
    if(err)
    {
      error(err);
      res.json({ mensagem: "ERRO: Não existe o registro com id = "
       + newPonto._id}).status(404);
      return;
    }
    res.json(ponto);
  });
});

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


//definindo a principal caminho (principal rota)
app.use('/api',router);
app.use(express.static('public'));

var httpServer = http.createServer(app);
httpServer.listen(port);
console.log('[INFO]: Servidor rodando na porta ' + port);
