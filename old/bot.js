const puppeteer = require('puppeteer');

async function url_visit (url) {
    var quote;
    return new Promise(async function(resolve, reject) {
        const browser = await puppeteer.launch();   // add `{ args: ['--no-sandbox'] }` if running as root
    const page = await browser.newPage();
    // login to admin page and view the page provided by user
    try{
        await page.goto("http://AdminLoginer/admin/login/api?username=user&password=pwd&submit=")
    }
    // await page.screenshot({path: 'screenshot.png'})
    catch(e){
        console.log("admin server not available")
    }    
    // View the page user sent
    try{
        await page.goto(url)
    }
    // await page.screenshot({path: 'screenshot.png'})
    catch(e){
        console.log("visit server not available")
    }
    await browser.close();
    resolve(quote);
    });
}


async function rn(urla){
        q = await url_visit(urla);
}

rn("http://www.google.com")
