start:
pm2 -n CARC_PAYPAL -i 2 start "npm run prod"

kill:
pm2 kill

