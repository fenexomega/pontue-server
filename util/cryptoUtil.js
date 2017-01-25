var crypto	=	require('crypto');
var config  = require('../config');


  function toSha256 (message){
    var hash = crypto.createHmac('sha256',config.secret)
            .update(message).digest('hex');
    return hash;
  }



module.exports.toSha256 = toSha256;
