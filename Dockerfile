FROM debian:stretch-slim

RUN apt-get update &&\
    apt-get install -y --no-install-recommends curl nano sudo procps libfontconfig --no-install-recommends


RUN apt-get install -y --no-install-recommends gnupg &&\
    curl -fsSL https://deb.nodesource.com/setup_current.x | bash - &&\
    apt-get install -y --no-install-recommends nodejs


RUN apt-get install -y --no-install-recommends redis-server

WORKDIR /bot

COPY ./package.json ./

RUN npm install

COPY ./bots/ ./bots/
COPY ./public ./public
COPY ./redis-controller ./redis-controller
COPY ./main.js ./main.js

EXPOSE 3000

CMD redis-server --daemonize yes ;npm start
