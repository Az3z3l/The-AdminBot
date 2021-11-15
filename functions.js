const spawn = require('child_process').spawn;
const crypto = require('crypto');
const { URL } = require('url');

/**
 * takes in the session for user and returns store. 
 * if (new session) {false}
 * else {
 *      the hash,
 *      if the hash was solved,
 *      if the solve is still valid.
 *  }
 */
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

/**
 * returns current time
 */
function now () {
    return Math.floor(+new Date() / 1000)
}

/**
 * returns if url is valid or not
 */
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

/** 
 * returns random string
*/
function randomString(size = 7) {  
    return crypto
      .randomBytes(size)
      .toString('hex')
      .slice(0, size)
}

/**
 * returns hash of the string passed
*/
function hasher(string) {
    demn = crypto.createHash('sha256').update(string).digest('hex'); 
    x = demn.substr(0,challengeLevel)
    return x
}

/**
 * gets the key for the bot -> updates last used time -> if the service is down, restarts it  
*/
function lastUsedTime(key) {
    if (runnerSpawn[key].killed == true){
        js = botFolder+availableBots[key]["path"]
        availableBots[key]["doa"] = "alive"
        runnerSpawn[key] = botSpawner(js)
    } 
    availableBots[key]["time"] = now()
}

/**
 * add a new bot
*/
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

/**
 * starts the bot
*/
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

/**
 * kills the bot
*/
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

/**
 * Spawn bot and return object
*/
function botSpawner(bot) {
    if (bot.endsWith(".js")){
        x = spawn('node', [bot], { stdio: 'inherit' })
        return x
    } else {
        x = spawn('python3', [bot], { stdio: 'inherit' })
        return x
    }
}

/**
 * format time
*/
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


/**
 * crawl the folder that has the bot files and initialize availableBots variable
*/
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

module.exports = { killBot, ls, fmtTime, startBot, validityChecker, now, urlValidity, randomString, hasher, lastUsedTime };