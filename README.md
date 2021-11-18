# The-AdminBot
A standalone service that can be used in CTFs to automate the process of visiting URLs. 


## Features
 - A hash collision based captcha system
 - Ratelimiting feature
 - Easy api based usage
 - Dynamically switch between hash based captcha to ratelimiting or vice-versa
 - All challenges that require a bot could be automated into this
 - Autokill bot if it exceeds maxIdleTime
 - Restart bot automatically when a new URL is sent to it
 - A single user login system to manipulate bots
 - Supports both Firefox and Chrome 


## Setup
 - If Firefox is required uncomment lines 30 - 35 in [./Dockerfile](./Dockerfile)
 - Refer [Chrome Bot Template](./bots/template.js) and [Firefox Bot Template](./bots/template.py)

## To Run
 - `docker build -t adminbot .`
 - `docker run --cap-add=SYS_ADMIN --env username=<> --env password=<> -p 80:3000 -d adminbot`
 - Available Env Parameters:
    - `idleTime` - `int` - Time for which the bot stays idle(in minutes)
    - `hashLevel` - `int` - Length for the hash
    -  `ratelimiting` - `int/int` - Number of requests/Seconds. If set, app will default to ratelimiting
