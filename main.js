var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const crypto = require('crypto');
const { URL } = require('url');
var path = require('path');
var queue = require('./redis-app/queue');
var bodyParser = require('body-parser')
var spawn = require('child_process').spawn;



var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret: randomString(32), resave: true, saveUninitialized: true}));
app.use(express.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.host);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "True");
    next();
});


const urlValidity = (s) => {
    protocols=["http", "https"]
    try {
        url = new URL(s);
        return protocols
            ? url.protocol
                ? protocols.map(x => `${x.toLowerCase()}:`).includes(url.protocol)
                : false
            : true;
    } catch (err) {
        return false;
    }
};


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


// returns store
// if new session -> store returns false
// else store returns ->
//      the hash
//      if the hash was solved
//      if the solve is still valid
//

function validityChecker(sess){
    var store = {}
    console.log(sess.hash)
    if (sess.hash != undefined && sess.used != true){
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
    // console.log(req.session.hash)
    data = validityChecker(req.session)
    console.log(data)
    if (data == false){
        hash = randomString()
        req.session.hash = hasher(hash)
        req.session.solved = false
        req.session.used = false
    } else if(!data.isHashValid && !data.isSolveValid && data.isHashValid!=undefined){
        hash = randomString()
        req.session.hash = hasher(hash)
        req.session.solved=false
        req.session.used = false
        
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
    body = (req.body)
    let captcha = body.answer+''
    

    data = validityChecker(req.session)
    
    // check if already solved
    if (data.solved && data.isSolveValid) {
        res.json({'status':'Success'})
        res.end()
        return
    } else if (data.solved && !data.isSolveValid){
        res.json({'status':'Failed', 'error':'Validity Exceeded'})
        return
    }
    check = hasher(captcha)
    if(check === req.session.hash){
        req.session.solved = true
        req.session.validity = (Math.floor(+new Date() / 1000)+100)
        res.json({'status':'Success'})
        res.end()
        return
    } else{
        res.json({'status':'Failed', 'error':'Invalid Captcha'})
        res.end()
        return
    }
})

app.get('/status', function(req, res) {
    res.json({'challenge':req.session.hash+'', 'solved':req.session.solved+'', 'validity':req.session.validity+'', "used":req.session.used+''})
    res.end()
    return
})


allowedID = [
    "3m3ly5i4orb8",
    "c09c7f2brvkk",
    "e7ermph9423z"
]


app.post('/visit/:id', function(req, res){
    if (!allowedID.includes(req.params.id)){
        res.json({'status':'failed','error':'invalid challenge id'})
        res.end()
        return 
    }
    data = validityChecker(req.session)
    if (data.solved && data.isSolveValid){
        body = (req.body)
        let url = body.url+''
        if (urlValidity(url)){

            req.session.used = true;

            // add to ds
            queue.push(url,req.params.id);

            res.json({'status':'admin will visit your page'})
            res.end()
            return
        } else {
            res.json({'status':'failed','error':'invalid url'})
            res.end()
            return
        }
    } else {
        res.json({'status':'failed','error':'validity failed'})
        res.end()
        return 
    } 
})

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});




console.log("server starting at port 3000")
app.listen(3000);

