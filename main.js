var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const morgan = require('morgan');
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
const USERNAME = process.env.username || "az3z3l"
const PASSWORD = process.env.password || randomString(12)

console.log(USERNAME,":",PASSWORD)
// const USERNAME = ""
// const PASSWORD = ""

var availableBots = {}  // set bot name and last used time
var runnerSpawn = {}    // set bot name and the spawn control object
var challengeLevel = 5  // length that needs to be returned by the challenge 


// init these
const PORT = 3000
var maxIdleTime = ((1)*60)*10   // max time in seconds that the bot is allowed to rest without usage
var interval = ((1e3)*60)*5     // interval in seconds after which bots are checked

var storage =   multer.diskStorage({  
    destination: function (req, file, callback) {
      callback(null, './bots/');
    },  
    filename: function (req, file, callback) {  
        callback(null, file.originalname);  
    }  
  });  
  var upload = multer({ storage : storage}).single('botjs');  
  

var app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(session({secret: randomString(32), resave: true, saveUninitialized: true, cookie: { sameSite: 'Lax' }}));
app.use(express.json())
app.use(morgan('common'));

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
    } else if(req.session.hash.length != challengeLevel) {
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
    res.json({'challenge':req.session.hash+'', 'solved':req.session.solved+'', 'validity':req.session.validity+'', "used":req.session.used+'', "level":challengeLevel})
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

app.get('/wtf', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/wtf.htm'));
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
    res.sendFile(path.join(__dirname + '/public/admin/login.htm'));
})

app.post('/admin/login', function(req, res){
    // console.log(req.body)
    if (USERNAME === req.body.username+"" && PASSWORD === req.body.password+""){
        req.session.admin = true
        res.redirect("/admin")
    } else {
        res.redirect("/")
    }
})

app.get('/admin', isAdmin, function(req, res){
    res.sendFile(path.join(__dirname + '/public/admin/index.htm'));
})

app.use('/admin/static',isAdmin, express.static(path.join(__dirname, '/public/admin/static')))

app.get('/admin/logs', isAdmin, function(req, res){
    res.sendFile(path.join(__dirname + '/logs/log.txt'));
})

app.get('/admin/bots/template/chrome', isAdmin, function(req, res){
    res.sendFile(path.join(__dirname + '/bots/template.js'));
})

app.get('/admin/bots/template/firefox', isAdmin, function(req, res){
    res.sendFile(path.join(__dirname + '/bots/template.py'));
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

app.post('/admin/challenge/level', isAdmin, function(req, res){
    level = parseInt(req.body.level, 10)
    if (!isNaN(level)){
        challengeLevel = level
        res.json({'status':'success'})
    } else {
        res.json({'status':'failed','error':'not a number'})
    }
})

app.post('/admin/bots/delete', isAdmin, function(req, res){
    id = req.body.id
    if (id in availableBots){
        killBot(id)
        try {
            fs.unlinkSync(botFolder+availableBots[id]["path"])
            console.log(`Deleted bot for ${availableBots[id]["name"]}`)
            delete availableBots[id]
            res.json({'status':'success'})
        } catch(err) {
            res.json({'status':'failed','error':err})
        }
    } else {
        res.json({'status':'failed','error':'bot not found'})
    }
})

app.post('/admin/bots/upload',isAdmin, function(req,res){
    upload(req,res,function(err) {  
        if(err) {
            return res.redirect(`/admin?err=${err}`);  
        }
        addBot(req.file.originalname);
        return res.redirect(`/admin`);  
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
    x = demn.substr(0,challengeLevel)
    return x
}


// gets the key for the bot -> updates last used time -> if the service is down, restarts it  
function lastUsedTime(key) {
    if (runnerSpawn[key].killed == true){
        js = botFolder+availableBots[key]["path"]
        availableBots[key]["doa"] = "alive"
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
    console.log("\n------Added Bot------")
    console.log(availableBots)
    console.log("------Added Bot------\n")

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
    if (bot.endsWith(".js")){
        x = spawn('node', [bot], { stdio: 'inherit' })
        return x
    } else {
        x = spawn('python3', [bot], { stdio: 'inherit' })
        return x
    }
}

// format time
function fmtTime(time) {   
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}



// crawl the folder that has the bot files and initialize availableBots variable
async function ls(path) {
    dir = await fs.promises.opendir(path)
    for await (dirent of dir) {
        file = dirent.name

        if (file == "template.js" || file == "template.py"){
            continue
        }

        if (file.split(".").length == 0){
            continue
        } else if(file.split(".")[1] != "js" && file.split(".")[1] != "py"){
            continue
        }

        await addBot(file)
    }
}
  

//---------- END OF FUNCTIONS ----------//


// ls(botFolder).then(() => {console.log(availableBots)})
  


// check the bots status every 5 minutes and kill them if there has been no activity for more than the maxIdleTime
setInterval(function () {
    console.log("\n---------------bot status---------------")
    for (key in availableBots){
        deadTime = now() - availableBots[key]["time"]
        challenge = availableBots[key]["name"]
        if (availableBots[key]["status"] == "private"){
            console.log(`${challenge} bot has been private for ${fmtTime(deadTime)}`)
        } else if (runnerSpawn[key].killed) {
            console.log(`${challenge} bot has been dead for ${fmtTime(deadTime)}`)
        } else if (deadTime>=maxIdleTime){
            runnerSpawn[key].kill()
            availableBots[key]["doa"] = "dead"
            console.log(`${challenge} bot is killed due to inactivity for ${fmtTime(deadTime)}`)
            availableBots[key]["time"] = now()
        } else {
            console.log(`${challenge} bot is alive`)
        }
    }
    console.log("---------------bot status---------------\n")
}, interval);


// initBots()
app.listen(PORT,function(){  
    console.log(`server starting at port ${PORT}`)
});  

