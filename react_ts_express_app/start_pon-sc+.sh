#! /usr/bin/bash

pm2 start /home/ji8842zh-s/PON-SC+/nodejs-backend/pon_scp_express_srv.js --name pon-scp
cd /home/ji8842zh-s/PON-SC+/react-scripts-frontend/ && export PORT=3011 && pm2 start /home/ji8842zh-s/PON-SC+/react-scripts-frontend/node_modules/react-scripts/scripts/start.js --name view-scp
