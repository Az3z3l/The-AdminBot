const crypto = require('crypto'); 
  
// Defining key 
const secret = 'Hi'; 
  
// Calling createHash method 
const hash = crypto.createHash('sha256', secret).update('How are you?').digest('hex'); 
  
// Displays output 
console.log(hash); 