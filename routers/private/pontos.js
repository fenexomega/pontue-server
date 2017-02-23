var express = require('express');
var router  = express.Router();
var Ponto = require('../../models/ponto');
var moment = require('moment');


// TODO: get pontos por dia da semana (as ultimas segunda, terça, quarta,...)
router.get('/pontos', function(req,res){
  var usuario = req.decoded._doc;
  var ano, semana, dia;
  if(req.query.hasOwnProperty('ano'))
    ano     = req.query.ano;
  if(req.query.hasOwnProperty('semana'))
    semana  = req.query.semana;
  if(req.query.hasOwnProperty('dia'))
    dia     = req.query.dia;

    if(ano == undefined)
    {
      Ponto.getByMesmoDiaDaData(new Date(),function(err,data){
        if(err){
          //  error(err);
           res.status(500).json({messagem: "error"});
           return;
        }
        res.json(data);
      });
      return;
    }

    if(semana == undefined)
    {
      Ponto.getByUsuarioAndAno(usuario, ano, function(err,data){
        if(err)
        {
          // error(err);
          res.status(500).json({messagem: "Erro"});
          return;
        }
        res.json(data);
      });
    }
    else
    {
      if(dia == undefined)
      {
        Ponto.getByUsuarioAndNumeroSemanaAndByAno(usuario, semana, ano,
          function(err,data){
            if(err)
            {
              // error(err);
              res.send(500);
            }
            res.json(data);
          });
      }
      else
      {
        // FIXME
        Ponto.findOne()
      }

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
  if(!ponto.hasOwnProperty('ano') || usuario.admin == false)
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
      // error(err);
      res.status(403).json({sucesso:false, messagem:"O seu objeto não foi validado."});
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
      // error(err);
      res.json({ mensagem: "ERRO: Não existe o registro com id = "
       + newPonto._id}).status(404);
      return;
    }
    res.json(ponto);
  });
});

module.exports = router;
