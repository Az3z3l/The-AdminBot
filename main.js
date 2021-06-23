var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const spawn = require('child_process').spawn;
const { URL } = require('url');
const firstline = require('firstline')
var path = require('path');
const crypto = require('crypto');
var queue = require('./redis-controller/queue');
const fs = require('fs');
var multer  = require('multer');
// app.use(express.static('./public/static'))



const botFolder = './bots/';

// admin creds
// const USERNAME = "az3z3l"
// const PASSWORD = "lordofstarmanofironkluholik"

const USERNAME = ""
const PASSWORD = ""

var availableBots = {}  // set bot name and last used time
var runnerSpawn = {}    // set bot name and the spawn control object

// init these
const PORT = 3000
var maxIdleTime = ((1)*60)*10   // max time in seconds that the bot is allowed to rest without usage
var interval = ((1e3)*60)*5     // interval in seconds after which bots are checked

var storage =   multer.diskStorage({  
    destination: function (req, file, callback) {
      callback(null, './bots/');
      console.log(1)
      fs.readdir(botFolder, (err, files) => {
        files.forEach(file => {
          console.log(file);
        });
      });
      
    },  
    filename: function (req, file, callback) {  
        callback(null, file.originalname);  
        console.log(2)
        fs.readdir(botFolder, (err, files) => {
          files.forEach(file => {
            console.log(file);
          });
        });
  
    }  
  });  
  var upload = multer({ storage : storage}).single('botjs');  
  

var app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(session({secret: randomString(32), resave: true, saveUninitialized: true, cookie: { sameSite: 'Lax' }}));
app.use(express.json())

//---------- USER ----------// 

app.get('/challenge', function(req, res){
    // console.log(req.session.hash)
    data = validityChecker(req.session)
    // console.log(data)
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
        req.session.validity = (now()+100)
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

app.post('/visit/:id', function(req, res){
    key = req.params.id

    if (availableBots[key] == undefined || availableBots[key]["status"]=="private"){
        res.json({'status':'failed','error':'invalid challenge id'})
        res.end()
        return 
    }
    qid = availableBots[key]["qid"]
    data = validityChecker(req.session)
    if (data.solved && data.isSolveValid){
        body = (req.body)
        let url = body.url+''
        if (urlValidity(url)){

            req.session.used = true;

            // add to ds
            queue.push(url,qid);
            lastUsedTime(key);
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

app.get("/bots", function(req, res){
    toSend = {}
    for (key in availableBots){
        temp = {}
        noww = availableBots[key]
        if (noww["status"] == "public"){
            temp["name"] = noww["name"]
            toSend[key] = temp
        }
    }
    res.json(toSend)
})

app.use('/static', express.static(path.join(__dirname, './public/static')))


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.htm'));
});

//---------- END OF USER ----------//

//---------- ADMIN ----------//

var isAdmin = function (req, res, next) {
    if (req.session.admin === true) {
        next()
    } else {
        res.redirect("/")
    }
}

app.get('/admin/login', function(req, res){
    res.sendFile(path.join(__dirname + '/public/adminlogin.htm'));
})

app.post('/admin/login', function(req, res){
    // console.log(req.body)
    if (USERNAME === req.body.username+"" && PASSWORD === req.body.password+""){
        req.session.admin = true
        // res.redirect("/admin/")
        res.redirect("/admin/bots")
    } else {
        res.redirect("/")
    }
})

app.get('/admin/bots', isAdmin, function(req, res) {
    res.send(availableBots)
})

app.post('/admin/bots/status', isAdmin, function(req, res){
    id = req.body.id
    status = req.body.status
    if (id in availableBots){
        if (status == "public"){
            availableBots[id]["status"] = "public"
            startBot(id)
        } else {
            availableBots[id]["status"] = "private"
            killBot(id)
        }
        res.json({'status':'success'})

    } else {
        res.json({'status':'failed','error':'bot not found'})
    }
})

app.get('/admin/bots/upload', isAdmin, function(req, res) {
    res.sendFile(path.join(__dirname + '/public/adminfileupload.htm'));
})

app.post('/admin/bots/upload',isAdmin, function(req,res){
    upload(req,res,function(err) {  
        if(err) {
            return res.end("Error uploading file.");  
        }
        addBot(req.file.originalname);
        res.end("File is uploaded successfully!");  
    });  
});  
//---------- END OF ADMIN ----------//

//---------- FUNCTIONS ----------//

// takes in the session for user
// returns store
// if new session -> store returns false
// else store returns ->
//      the hash
//      if the hash was solved
//      if the solve is still valid
function validityChecker(sess){
    var store = {}
    // console.log(sess.hash)
    if (sess.hash != undefined && sess.used != true){
        store.hash = sess.hash
        if (sess.solved != undefined){
            if (sess.solved){
                store.solved = true
                store.isHashValid = false
                if (sess.validity <= (now())){
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


// returns current time 
function now () {
    return Math.floor(+new Date() / 1000)
}


// returns if url is valid or not
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


// returns random string
function randomString(size = 7) {  
    return crypto
      .randomBytes(size)
      .toString('hex')
      .slice(0, size)
}


// returns hash of the string passed
function hasher(string) {
    demn = crypto.createHash('sha256').update(string).digest('hex'); 
    x = demn.substr(0,5)
    return x
}


// gets the key for the bot -> updates last used time -> if the service is down, restarts it  
function lastUsedTime(key) {
    if (runnerSpawn[key].killed == true){
        js = botFolder+availableBots[key]["path"]
        runnerSpawn[key] = botSpawner(js)
    } 
    availableBots[key]["time"] = now()
}

async function addBot(file) {
    js = botFolder+file
    temp = {}

    fl =  await firstline(botFolder+"/"+file)
    temp["name"] =  fl.substring(fl.indexOf('//')+2).trim()

    temp["path"] = file
    temp["status"]= "private"
    temp["time"] = now()
    temp["doa"] = "dead"
    temp["qid"] = file.split(".")[0]

    key = randomString(8)
    availableBots[key]=  temp
    console.log(availableBots)
}

// starts the bot
function startBot(key) {
    js = botFolder+availableBots[key]["path"]
    if (runnerSpawn[key] != undefined){
        if(!runnerSpawn[key].killed){
            runnerSpawn[key].kill()
        }
    }
    runnerSpawn[key] = botSpawner(js)
    availableBots[key]["time"] = now()
    availableBots[key]["status"] = "public"
    availableBots[key]["doa"] = "alive"
    console.log("started bot for: ", availableBots[key]["name"])
}

// kills the bot
function killBot(key) {
    if (runnerSpawn[key] != undefined){
        if(!runnerSpawn[key].killed){
            runnerSpawn[key].kill()
        }
    }
    availableBots[key]["time"] = now()
    availableBots[key]["status"] = "private"
    availableBots[key]["doa"] = "dead"

    console.log("killed bot for: ", availableBots[key]["name"])
}

// Spawn bot and return object
function botSpawner(bot) {
    x = spawn('node', [bot], { stdio: 'inherit' })
    return x
}


// crawl the folder that has the bot files and initialize availableBots variable
async function ls(path) {
    dir = await fs.promises.opendir(path)
    for await (dirent of dir) {
        file = dirent.name

        if (file == "template.js"){
            continue
        }

        temp = {}

        fl =  await firstline(botFolder+"/"+file)
        temp["name"] =  fl.substring(fl.indexOf('//')+2).trim()
    
        temp["path"] = file
        temp["status"]= "private"
        temp["time"] = now()
        temp["doa"] = "dead"
        temp["qid"] = file.split(".")[0]

        key = randomString(8)
        availableBots[key]=  temp
    }
}
  

//---------- END OF FUNCTIONS ----------//


ls(botFolder).then(() => {console.log(availableBots)})
  


// check the bots status every 5 minutes and kill them if there has been no activity for more than the maxIdleTime
setInterval(function () {
    console.log("\nbot status:")
    for (key in availableBots){
        deadTime = now() - availableBots[key]["time"]
        challenge = availableBots[key]["name"]
        if (availableBots[key]["status"] == "private"){
            console.log(`${challenge} bot has been private for ${deadTime} seconds`)
        } else if (runnerSpawn[key].killed) {
            console.log(`${challenge} bot has been dead for ${deadTime} seconds`)
        } else if (deadTime>=maxIdleTime){
            runnerSpawn[key].kill()
            availableBots[key]["doa"] = "dead"
            console.log(`${challenge} bot is killed due to inactivity for ${deadTime} seconds`)
            availableBots[key]["time"] = now()
        } else {
            console.log(`${challenge} bot is alive`)
        }
    }
    console.log("\n")
}, interval);


// initBots()
app.listen(PORT,function(){  
    console.log(`server starting at port ${PORT}`)
});  

