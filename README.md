#Simple website links crawler

App defaults:
  PORT : 3000,
  ROOT_URL : http://wiprodigital.com,
  MongoDB URL: mongodb://127.0.0.1/webcrawler,
  Redis QUEUE_NAME: webcrawler

To run: 
npm install
npm start or node www

To test: 
npm test

crawler options:
  1. Start - /start?url=encoded_url_to_be_crawled
  2. Stop - /stop?url=encoded_url_to_stop_crawling
  3. List - /list?url=encoded_url_to_list_crawled_results
