var queue = require('./queue');
var missing = 10;

for(var i = 0 ; i < 10 ; i ++) {
    let x;
    if(i%2==0){
        x="even"
    } else { 
        x="odd"
    }
    queue.push(i,x, pushed);
}



function pushed(err) {  
  if (err) {
    throw err;
  }
  if (-- missing == 0) {
    console.log('all work is pushed');
    poll();
  }
}



function poll() {  
  queue.pop("odd",popped);
}


function popped(err, url) {  
  if (err) {
    throw err;
  }
  console.log(url);
//   if (! work) {
//     setTimeout(poll, 1e3);
//   }
//   else {
//     poll();
//   }
}