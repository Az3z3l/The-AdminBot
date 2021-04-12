# The-AdminBot
A standalone service that can be used in CTFs to automate the process of visiting URLs. 

## Features
 - A captcha system
 - All challenges that require a bot could be automated into this

## To do
 - Run the bots as child process of main.js
 - After x inactive duration, kill it
 - When a new request for that bot, spawn it and restart timer

## Setup
 - Install Chrome and Nodejs(above v12)
 - Install mariadb/mysql to use bot-db.js
 - Install [Forever module](https://www.npmjs.com/package/forever) using `npm install forever -g`
 - Install [Puppeteer module](https://www.npmjs.com/package/puppeteer) and [Mysql2 module](https://www.npmjs.com/package/mysql2) using `npm install` 
