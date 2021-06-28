#!/bin/bash

INSTALL_DIR="/usr/bin/."

json=$(curl -s https://api.github.com/repos/mozilla/geckodriver/releases/latest)
url=$(echo "$json" | jq -r '.assets[].browser_download_url | select(contains("linux64.tar.gz"))')
IFS=' '
read -a strarr <<< "$url"
curl -s -L "${strarr[0]}" | tar -xz
chmod +x geckodriver
sudo mv geckodriver "$INSTALL_DIR"
echo "installed geckodriver binary in $INSTALL_DIR"