#! /usr/bin/bash

pm2 start /home/ji8842zh-s/PON-SC+/nodejs-backend/pon_scp_express_srv.js --name pon-scp
pm2 --name view-scp start "export PORT=4998 && yarn --cwd /home/ji8842zh-s/PON-SC+/react-scripts-frontend/ start"
