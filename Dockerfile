FROM ubuntu:18.04

RUN apt update && apt install -y nano xvfb curl wget software-properties-common unzip --no-install-recommends
RUN curl -sL https://deb.nodesource.com/setup_current.x | bash -
RUN apt install -y nodejs chromium-browser

RUN apt-get install -y --no-install-recommends sudo redis-server

RUN npm --version

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN useradd bot
RUN mkdir -p /home/bot
WORKDIR /home/bot
COPY package.json .
RUN npm install

COPY ./bots/ ./bots/
COPY ./public ./public
COPY ./redis-controller ./redis-controller
COPY ./main.js ./main.js

RUN chown bot:bot /home/bot

EXPOSE 3000
USER bot

CMD redis-server --daemonize yes; sleep 5; npm start;
