#Simple website links crawler

-> template generated with express-generator
-> crawler options:
        1. Start - /start?url=<default url=ROOT_URL>
        2. Stop - /stop?url=<default url=ROOT_URL>
        3. List - /list?url=<default url=ROOT_URL>

-> App defaults:
PORT : 3000,
ROOT_URL : http://wiprodigital.com,
MongoDB URL: mongodb://127.0.0.1/webcrawler,
Redis QUEUE_NAME: webcrawler

To run: 
npm install
npm start or node www

To test: 
npm test
