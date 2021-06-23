const spawn = require('child_process').spawn;
const crypto = require('crypto');
const { URL } = require('url');


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
function randomString(size = 6) {  
    return crypto
      .randomBytes(size)
      .toString('base64')
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
        js = botFolder+key+".js"
        runnerSpawn[key] = botSpawner(js)
    } 
    availableBots[key] = now()
}


// starts all the bot for the first time
function initBots() {
    for (key in availableBots){
        js = botFolder+key+".js"
        runnerSpawn[key] = botSpawner(js)
        availableBots[key] = now()
        console.log("started bot: ", key)
    }
}


// Spawn bot and return object
function botSpawner(bot) {
    x = spawn('node', [bot], { stdio: 'inherit' })
    return x
}

module.exports = { validityChecker, now, urlValidity, randomString, hasher, lastUsedTime, initBots};