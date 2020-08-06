const puppeteer = require('puppeteer');

async function url_visit () {
    var quote;
    return new Promise(async function(resolve, reject) {
        const browser = await puppeteer.launch();   // add `{ args: ['--no-sandbox'] }` if running as root
    const page = await browser.newPage();
    // login to admin page and view the page provided
    try{
        await page.goto("http://AdminLoginer/admin/login/api?username=user&password=pwd&submit=")
        await page.goto("http://51.145.102.58:8080/report/view/")
    }
    // await page.screenshot({path: 'screenshot.png'})
    catch(e){
        console.log("server not available")
    }    
    await browser.close();
    resolve(quote);
    });
}

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
  }

async function rn(){
    var z = 1
    while(true){
	console.log(z)
        q = await url_visit();
        await sleep(20000)      // view the same page every 20 seconds
        z=z+1
    }
}

rn()
