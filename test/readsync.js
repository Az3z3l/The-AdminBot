const fs = require('fs');
const firstline = require('firstline')
const crypto = require('crypto');

var botFolder = "../bots/"
var availableBots = {}  // set bot name and last used time

function randomString(size = 6) {  
    return crypto
      .randomBytes(size)
      .toString('base64')
      .slice(0, size)
}

time = 0
// fs.readdirSync(botFolder).forEach(async (file) => {
//     key = await randomString(6)
//     console.log(time++, key)

//     key = await file.split(".")[0]
//     temp = {}
//     fl =  await firstline(botFolder+"/"+file)
//     temp["name"] =  fl.substring(fl.indexOf('//')+2).trim()

//     temp["path"] = file
//     temp["status"]= await "private"
//     availableBots[key]= await temp

//     key = file.split(".")[0]
//     availableBots[key]=temp

//     console.log(availableBots)
// });

// console.log(availableBots)


async function ls(path) {
    dir = await fs.promises.opendir(path)
    for await (dirent of dir) {
        file = dirent.name

        temp = {}

        fl =  await firstline(botFolder+"/"+file)
        temp["name"] =  fl.substring(fl.indexOf('//')+2).trim()
    
        temp["path"] = file
        temp["status"]= "private"

        key = randomString(8)
        availableBots[key]=  temp
    }
}
  
ls(botFolder).then(() => {delete availableBots["template"];console.log(availableBots)})
  
