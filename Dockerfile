FROM ubuntu:18.04

# setup node with other prereq
RUN apt update && apt install -y --no-install-recommends nano xvfb curl wget software-properties-common unzip 
RUN curl -sL https://deb.nodesource.com/setup_current.x | bash -
RUN apt install -y nodejs

RUN apt install -y --no-install-recommends sudo redis-server

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# setup a new user and install modules we need
RUN useradd bot
RUN mkdir -p /home/bot
WORKDIR /home/bot


# install chrome
RUN apt install -y --no-install-recommends libappindicator3-1 libasound2 libatk1.0-0 libatspi2.0-0 libc6 libcairo2 libcap2 libcups2 libdrm2 libevdev2 libexpat1 libfontconfig1 libfreetype6 libgbm1 libglib2.0-0 libgtk-3-0 libpam0g libpango-1.0-0 libpci3 libpcre3 libpixman-1-0 libspeechd2 libstdc++6 libsqlite3-0 libuuid1 libwayland-egl1-mesa libx11-6 libx11-xcb1 libxau6 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxdmcp6 libxext6 libxfixes3 libxi6 libxinerama1 libxrandr2 libxrender1 libxtst6 zlib1g
RUN apt install -y --no-install-recommends libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev
COPY ./installers/chromium-latest.sh ./
RUN chmod +x ./chromium-latest.sh
RUN ./chromium-latest.sh

# npm install
COPY package.json .
RUN npm install

# copy the js files
COPY ./bots/ ./bots/
COPY ./public ./public
COPY ./redis-controller ./redis-controller
COPY ./main.js ./main.js

RUN chown -R bot:bot /home/bot
RUN chmod 755 /home/bot/bots

RUN echo '## LoGGer ##' > ./logs/log.txt

EXPOSE 3000


USER bot

CMD redis-server --daemonize yes; sleep 5; npm start;
