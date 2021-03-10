#!/bin/sh

# 1 hours period

pm2 delete fx-bankru-today
PERIOD=today pm2 start index-fx-bankru.js --name fx-bankru-today --cron "00 */1 * * *"
pm2 save