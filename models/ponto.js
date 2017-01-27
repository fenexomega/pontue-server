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

var Ponto = module.exports = mongoose.model('Ponto',pontoSchema);

module.exports.get = function(callback,limit)
{
  Ponto.find(callback).limit(limit);
};

module.exports.getByNumeroSemanaAndByAno = function(numeroSemana,ano, callback)
{
	Ponto.find(query,callback)
	.where('ano').gte(ano)
	.where('numeroSemana').equals(numeroSemana);
}

module.exports.getByAno = function(ano, callback)
{
	Ponto.find({},callback)
	.where('ano').equals(ano);
}

module.exports.add = function(ponto,callback)
{
	Ponto.create(ponto,callback);
}

module.exports.update = function(ponto,callback)
{
	var id = ponto._id;
	delete ponto._id;
	Ponto.update(id,ponto,callback);
}

module.exports.getById = function(id,callback)
{
  var query = {_id:id};
  Ponto.find(query,callback);
};
