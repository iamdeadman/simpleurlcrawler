#Simple website url crawler

App defaults:
  1. PORT : 3000,
  2. ROOT_URL : http://wiprodigital.com,
  3. MongoDB URL: mongodb://127.0.0.1/webcrawler,
  4. Redis QUEUE_NAME: webcrawler

To install and build: 
npm install

To run: 
npm start or node www

To test: 
npm test

crawler options:
  1. Start - /start?url=encoded_url_to_be_crawled
  2. Stop - /stop?url=encoded_url_to_stop_crawling
  3. List - /list?url=encoded_url_to_list_crawled_results
