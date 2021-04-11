var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const crypto = require('crypto');
const { time } = require('console');
var app = express();

app.use(cookieParser());
app.use(session({secret: randomString(32)}));
app.use(express.json())

function randomString(size = 6) {  
    return crypto
      .randomBytes(size)
      .toString('base64')
      .slice(0, size)
}

function hasher(hash) {
    demn = crypto.createHash('sha256').update(hash).digest('hex'); 
    x = demn.substr(0,5)
    return x
}

function validityChecker(sess){
    var store = {}
    console.log(sess.hash)
    if (sess.hash != undefined){
        store.hash = sess.hash
        if (sess.solved != undefined){
            if (sess.solved){
                store.solved = true
                store.isHashValid = false
                if (sess.validity <= (Math.floor(+new Date() / 1000))){
                    store.isSolveValid = false
                } else {
                    store.isSolveValid = true
                }
            } else {
                store.solved = false
                store.isHashValid = true
            }
        }
    } else {
        store = false
    }
    return store
}

app.get('/challenge', function(req, res){
    data = validityChecker(req.session)
    console.log(data)
    if (data == false){
        hash = randomString()
        req.session.hash = hasher(hash)
    } else if(!data.isHashValid && !data.isSolveValid && data.isHashValid!=undefined){
        hash = randomString()
        req.session.hash = hasher(hash)
        req.session.solved=false
        
    }
    console.log(hash + " : "+req.session.hash)
    res.json({'challenge':req.session.hash})
    res.end()
    return
});

app.post('/solve', function(req, res){
    if (!req.body){
        res.json({'error':'empty data sent'})
        res.end()
        return
    }
    console.log(req.body)
    body = (req.body)
    let captcha = body.hash+''
    

    data = validityChecker(req.session)
    
    // check if already solved
    if (data.solved && data.isSolveValid) {
        res.json({'captcha':'Success'})
        res.end()
        return
    }
    else if (data.solved && !data.isSolveValid){
        res.json({'captcha':'Failure', 'error':'Validity Timed Out'})
        return
    }
    check = hasher(captcha)
    if(check === req.session.hash){
        req.session.solved = true
        req.session.validity = (Math.floor(+new Date() / 1000)+9)
        res.json({'captcha':'Success'})
        res.end()
        return
    }
    else{
        res.json({'captcha':'Failure', 'error':'Invalid Captcha'})
        res.end()
        return
    }
})

app.get('/status', function(req, res) {
    res.json({'challenge':req.session.hash+'', 'solved':req.session.solved+'', 'validity':req.session.validity+''})
    res.end()
    return
})

app.get('visit/:i')



app.listen(3000);

