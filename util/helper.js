
function log(message){
  console.log("[INFO] " + message);
}

function debug(message){
  console.log("[DEBUG] " + message);
}

function error(message){
  console.error("[ERROR] " + message);
}


module.exports.log = log;
module.exports.debug = debug;
module.exports.error = error;
