FROM debian:stretch-slim

RUN apt-get update &&\
    apt-get install -y --no-install-recommends curl nano sudo ca-certificates procps libfontconfig --no-install-recommends


RUN apt-get install -y --no-install-recommends gnupg &&\
    curl -fsSL https://deb.nodesource.com/setup_current.x | bash - &&\
    apt-get install -y --no-install-recommends nodejs

RUN apt-get install -y --no-install-recommends redis-server

WORKDIR /bot

COPY ./ ./

RUN npm install

RUN npm start

EXPOSE 3000