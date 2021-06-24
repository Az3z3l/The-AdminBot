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


## To Run
 - `docker build -t adminbot .`
 - `docker run --cap-add=SYS_ADMIN --env username=<> --env password=<> -p 80:3000 adminbot`
 - By default, the bot runs on port 3000


 ## Additions required
 - Single user login system to add/control bots dynamically
