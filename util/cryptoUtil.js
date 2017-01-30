var crypto	=	require('crypto');
var config  = require('../config');


  function toSha256 (message){
    var hash = crypto.createHash('sha256')
            .update(message).digest('hex');
    return hash;
  }



module.exports.toSha256 = toSha256;
