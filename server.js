// http://www.restapitutorial.com/lessons/httpmethods.html
// carregar o .env do projeto
require('dotenv').config()

https://github.com/PETTIQX/agenda-ufc-server/blob/master/routes/index.js

var express     = require('express');//importo o express
var app         = express();//criando o app do tipo express

var http        = require('http');//importando o http
var https       = require('https');
var bodyParser  = require('body-parser');//importo o bodyParser
var mongoose    = require('mongoose');
var morgan      = require('morgan');
var path        = require('path');
var fs          = require('fs');

var config      = require('./config');
var cryptoUtil  = require('./util/cryptoUtil');
var moment      = require('moment')

// Iniciando porta
var port = process.env.PORT || 8080;
var sslport = process.env.SSLPORT || 8443;

// Database
mongoose.connect(config.database);
var db = mongoose.connection;// pegando a conecção


var privateKey = fs.readFileSync('certs/server.key','utf-8');
var certificate = fs.readFileSync('certs/server.crt','utf-8');
var credentials = {key: privateKey, cert: certificate};

var routers  = require('./routers');

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



//definindo a principal caminho (principal rota)
app.use('/api', routers);
app.use(express.static('public'));

// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials,app);
// set up plain http server
//
// var httpApp = express()
// // set up a route to redirect http to https
// httpApp.get('*',function(req,res){
//     res.redirect('https://localhost:8443'+req.url)
// })
//
// var httpServer = https.createServer(httpApp);


// httpServer.listen(port)
httpsServer.listen(port);
console.log('[INFO]: Servidor rodando na porta ' + port);
