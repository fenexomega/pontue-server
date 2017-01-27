var mongoose = require('mongoose');
var cryptoUtil =  require('../util/cryptoUtil');

var usuarioSchema = mongoose.Schema({
  nome:{
    type: String,
	  required: true
  },
  email: {
    type: String,
    index: {unique: true},
    required: true
  },
  senha:{
    type: String,
    required: true
  },
  matricula:{
    type: String,
    required: true
  },
  ativo: {
    type: Boolean,
    default: true
  },
  admin: {
    type: Boolean,
    default: false
  }
});

var Usuario = module.exports = mongoose.model('Usuario',usuarioSchema);

//get usuario by name
module.exports.getByName = function (name, callback) {
  var query = {nome: nome};
  Usuario.findOne(query,callback);
};

module.exports.getByEmail = function(email, callback){
  var query = { "email": email };
  Usuario.findOne(query, callback);
};

// https://stackoverflow.com/questions/13352735/mongoose-document-update-error?noredirect=1&lq=1
module.exports.update = function(usuario,callback)
{
  var id = usuario._id;
  delete usuario._id;
  Usuario.update(id,usuario,callback);
}

//add usuarioSchema
module.exports.add = function (usuario, callback) {
	var hash	=	cryptoUtil.toSha256(usuario.senha);
	usuario.senha =	hash;

  Usuario.create(usuario,callback);
};
