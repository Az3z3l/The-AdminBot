const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
    host: 'db',
    user: 'root',
    database: 'URL',
    password: 'star7ricks',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
const TableName=""
async function run(id) {
    // to see if any new url has been entered and if entered return the value
    return new Promise(async function(resolve, reject) {
            console.log(id);
            while (true){
                const number = await pool.query("select count(*) as aaa from "+TableName);   // number of entries present
                if (id<=(number[0][0].aaa-1)){
                    break
                }
            }
            const result = await pool.query('SELECT * from '+TableName+' limit  ? ,1', [id]); // select the latest entry
        
            resolve(result[0][0].value);
    });
}


async function url_visit (url) {
    var quote;
    return new Promise(async function(resolve, reject) {
        const browser = await puppeteer.launch();   // add `{ args: ['--no-sandbox'] }` if running as root
	const page = await browser.newPage();  
        // set necessary creds/requirements for the bot to be admin (ie. cookie/session/login with admin account)
        // eg.
        await page.goto("http://web/").then(()=>{
            page.evaluate(()=>document.cookie = 'whoami=Admin; path=/');  
        });
        await page.reload();
        await page.setDefaultNavigationTimeout(5000);  // Timeout duration
        // Goto the URL provided by user
        try{
            var result = await page.goto(url);
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
        q = await url_visit(a);
        z+=1;
    }
}


rn()

