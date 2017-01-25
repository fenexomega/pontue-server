var mongoose 			= require('mongoose');
var moment				=	require('moment');

var pontoSchema = mongoose.Schema({
	feitoPor: { type: mongoose.Schema.Types.ObjectId, ref:'Usuario'},
	numeroSemana: Number,
	numeroDia: Number, // Domingo = 0, Segunda = 1,.. Sábado = 6
	numeroMes: Number, // Janeiro = 1, Fevereiro = 2...
	horasDia: Number,
	data: Date,
	aceito: { type: Boolean, default: true},
	comentario:String,
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
	var query = {numeroSemana: numeroSemana};
	Ponto.find(query,callback).where('data').gte(moment(ano,'YYYY').toDate());
}

module.exports.add = function(ponto,callbacl)
{
	Ponto.create(ponto,callback);
}

module.exports.getById = function(id,callback)
{
  var query = {_id:id};
  Ponto.find(query,callback);
};
