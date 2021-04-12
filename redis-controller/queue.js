var redis = require('./redis');

exports.push = push;  
exports.pop = pop;

function push(url, where, cb) {  
  redis.lpush(where, url);
}



function pop(where, cb) {  
  redis.rpop(where, function(err, url) {
    if (err) {
      cb(err);
    }
    else {
      cb(null, url);
    }
  });
}