# The-AdminBot
A standalone service that can be used in CTFs to automate the process of visiting URLs. 


## Features
 - A hash collision based captcha system
 - All challenges that require a bot could be automated into this
 - Autokill bot if it exceeds maxIdleTime
 - Restart bot automatically when a new URL is sent to it
 - A single user login system to manipulate bots.
 - Supports both Firefox and Chrome 


## Setup
 - Edit timeouts from main.js
 - If Firefox is required uncomment lines 30 - 35 in [./Dockerfile](./Dockerfile)
 - Refer [Chrome Bot Template](./bots/template.js) and [Firefox Bot Template](./bots/template.py)

## To Run
 - `docker build -t adminbot .`
 - `docker run --cap-add=SYS_ADMIN --env username=<> --env password=<> -p 80:3000 -d adminbot`
