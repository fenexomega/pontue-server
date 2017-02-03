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

module.exports.getByUsuarioAndNumeroSemanaAndByAno = function(usuario, numeroSemana, ano, callback)
{
	var query = {ano: ano, numeroSemana: numeroSemana, feitoPor: usuario._id };
	Ponto.find(query,callback);
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
			data.horarios = ponto.horarios;
			data.comentario = ponto.comentario;
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
