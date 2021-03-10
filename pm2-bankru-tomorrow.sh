#!/bin/sh

# 1 hours period

pm2 delete fx-bankru-tomorrow
PERIOD=tomorrow pm2 start index-fx-bankru.js --name fx-bankru-tomorrow --cron "00 */1 * * *"
pm2 save