// Challenge Name Goes Here # TEMPLATE FOR CHROME
const puppeteer = require('puppeteer');
var queue = require('../redis-controller/queue');
const queueName = __filename.split(".")[0].split("/").pop();

const challName = "bot"

const thecookie = {
    "name": 'xoxo',
    "value": "xoxo",
    "domain": 'localhost',
    "httpOnly": true,
    "sameSite": 'Lax',
  }



async function url_visit (url) {
    var quote;
    return new Promise(async function(resolve, reject) {
        // start modification

        const browser = await puppeteer.launch({executablePath: '/home/bot/latest/chrome'}); 
        const page = await browser.newPage();  
        await page.setCookie(thecookie)
        await page.setDefaultNavigationTimeout(1e3*15);  // Timeout duration in milliseconds    // use either this or wait for navigation
        try{
            var result = await page.goto(url);
            await page.waitForNavigation(); // wait till the page finishes loading              
        }
        catch(e){
            console.log();
        }        
        await browser.close();

        // end modification
        resolve(quote);
    });
}



function popMe(){
    queue.pop(queueName,sendUrl)
}

async function sendUrl(err, url) {
    if (err) {
        throw err;
    }

    if (!url) {
        setTimeout(popMe, 1e3); // if null is returned, wait for a sec before retrying
    } else {
        console.log(url)
        q = await url_visit(url)
        popMe();
    } 
}

console.log(`Started bot for chall ${challName} with id ${queueName}`)
popMe()

