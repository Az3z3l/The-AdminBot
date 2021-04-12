const puppeteer = require('puppeteer');
var queue = require('../redis-app/queue');


const thecookie = {
	domain: "https://webhook.site/47a60543-987b-405b-9841-cbb4294046df",
	name: "admin_cookie",
	value: "secretvalue",
	httpOnly: true,
	secure: true,
	sameSite: 'None'
}

async function url_visit (url) {
    var quote;
    return new Promise(async function(resolve, reject) {

        const browser = await puppeteer.launch();   // add `{ args: ['--no-sandbox'] }` if running as root
        const page = await browser.newPage();  
        // set necessary creds/requirements for the bot to be admin (ie. cookie/session/login with admin account)
        // eg.
        await page.setCookie(thecookie)
        await page.setDefaultNavigationTimeout(10000);  // Timeout duration    // use either this or wait for navigation
        // Goto the URL provided by user
        try{
            var result = await page.goto(url);
            // await page.waitForNavigation(); // wait till the page finishes loading              
        }
        catch(e){
            console.log("timeout exceeded");
        }
        await browser.close();
        resolve(quote);

    });
}



async function rn(){
    var z = 0;
    while(true){
        a = await run(z);
        console.log("return value=>"+a);
        await url_visit(a);
        z+=1;
    }
}

function popMe(){
    queue.pop("3m3ly5i4orb8",sendUrl)
}

async function sendUrl(err, url) {
    if (err) {
        throw err;
    }
    console.log(url)

    if (!url) {
        setTimeout(popMe, 1e3);
    } else {
        q = await url_visit(url)
        popMe();
    } 
}

console.log("Started bot for chall A")
popMe()

