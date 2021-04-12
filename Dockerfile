FROM node:slim

WORKDIR /bot

COPY ./ ./

RUN npm install

RUN node main.js