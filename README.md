# The-AdminBot
A standalone service that can be used in CTFs to automate the process of visiting URLs. 


## Features
 - A hash collision based captcha system
 - All challenges that require a bot could be automated into this
 - Autokill bot if it exceeds maxIdleTime
 - Restart bot automatically when a new URL is sent to it


## Setup
 - Edit timeouts from main.js
 - Use the template in bots folder to create your action for bot.
 - Save the file with preferably with a <random string>.js
 - Use the template.html file in public directory to add `report to admin` page from your challenge 


## Starting
 - docker build -t adminbot .
 - docker run adminbot
 - By default, the bot runs on port 3000