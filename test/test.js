const puppeteer = require('puppeteer');

const challName = "Notepad 2"

const thecookie = {
    name: 'id',
    value: 'vfYZ35mry2cVqOPNo1xnL1HE0VW5tp7oMX',
    domain: '9db5fca7c60f.ngrok.io',
    expires: -1,
    httpOnly: true,
    secure: true,
    session: true,
    sameSite: 'Lax',
  }



async function url_visit (url) {
    var quote;
    return new Promise(async function(resolve, reject) {
        // start modification
        
        const browser = await puppeteer.launch({headless:false});  // add `{ args: ['--no-sandbox'] }` if running as root
        const page = await browser.newPage();     
        await page.setCookie(thecookie)
        
        // const page = await browser.newPage();     
        // await pagec.close()
        console.log(await page.cookies('https://9db5fca7c60f.ngrok.io'));

        await page.setDefaultNavigationTimeout(1e3*15);  // Timeout duration in milliseconds    // use either this or wait for navigation
        try{
            // var result = await page.goto("https://faaa112cfbca.ngrok.io");
            // console.log(await page.cookies('https://faaa112cfbca.ngrok.io'));

            await page.waitForNavigation(); // wait till the page finishes loading              
        }
        catch(e){
            console.log("timeout exceeded");
        }        
        // await browser.close();
        console.log(await page.cookies('https://faaa112cfbca.ngrok.io'));
        // end modification
        resolve(quote);
    });
}


url = "https://faaa112cfbca.ngrok.io"
url_visit(url)
        