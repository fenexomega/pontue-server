var mongoose 			= require('mongoose');
var moment				=	require('moment');

var pontoSchema = mongoose.Schema({
	feitoPor: {
		type: mongoose.Schema.Types.ObjectId,
		ref:'Usuario',
		required: true
	 },
	numeroSemana: { type: Number, required: true },
	numeroDia: { type: Number, required: true }, // Domingo = 0, Segunda = 1,.. Sábado = 6
	numeroMes: { type: Number, required: true }, // Janeiro = 0, Fevereiro = 1...
	horasDia: { type: Number, required: true },
	ano: { type: Number, required: true},
	dataCriacao: { type: Date, required: true },
	dataUltAtualizacao: Date,
	aceito: { type: Boolean, default: true},
	comentario: { type: String, required: true },
	horarios:{
		manha:{
			ab: { type: Boolean, default: false},
			cd: { type: Boolean, default: false}
		},
		tarde:{
			ab: { type: Boolean, default: false},
			cd: { type: Boolean, default: false}
		},
		noite:{
			ab: { type: Boolean, default: false},
			cd: { type: Boolean, default: false}
		}
	}
});

function definirHoras(ponto)
{
	// Segurança, não deixar o usuário atribuir as horas
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
}

pontoSchema.index({feitoPor: 1, numeroSemana: 1, numeroDia: 1, ano: 1}, { unique: true });

var Ponto = module.exports = mongoose.model('Ponto',pontoSchema);

module.exports.get = function(callback,limit)
{
  Ponto.find(callback).limit(limit);
};

module.exports.getByUsuarioAndNumeroSemanaAndByAno = function(usuario, numeroSemana, ano, callback)
{
	var query = {ano: ano, numeroSemana: numeroSemana, feitoPor: usuario._id };
	Ponto.find(query,callback);
}

module.exports.getByMesmoDiaDaData = function(usuario, date,callback)
{
	var mymoment =  moment(date);
	var year 	= mymoment.weekYear();
	var week 	= mymoment.week();
	var day		=	mymoment.day();
	var query	=	{ano: year, numeroSemana: week, numeroDia: day,
		feitoPor: usuario._id};
	Ponto.findOne(query,callback);
}

module.exports.getByAno = function(ano, callback)
{
	Ponto.find({ano: ano},callback);
}

module.exports.getByUsuarioAndAno = function(usuario, ano, callback)
{
	Ponto.find({ano: ano, feitoPor: usuario._id },callback);
}

module.exports.add = function(ponto,callback)
{
	definirHoras(ponto);
	Ponto.create(ponto,callback);
}

module.exports.update = function(id,ponto,callback)
{
	Ponto.findById(id, function(err, data){
		if(err){
			callback(err,data);
			return;
		}
		try{
			definirHoras(ponto);
			data.horarios = ponto.horarios;
			data.comentario = ponto.comentario;
			data.horasDia 	=	ponto.horasDia;
			data.dataUltAtualizacao = new Date();

			data.save(function(err,pontoNovo){
				if(err){
					callback(err);
					return;
				}
				callback(err,pontoNovo);
			});
		}
		catch(err)
		{
			callback(err,data);
		}
	});
}

module.exports.getById = function(id,callback)
{
  var query = {_id:id};
  Ponto.find(query,callback);
};
