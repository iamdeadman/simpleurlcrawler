const RedisSMQ = require("rsmq");
const URL = require("url");
const RSMQWorker = require("rsmq-worker");
const Page = require("../models/page.model");
const rsmq = new RedisSMQ( {host: "127.0.0.1", port: 6379, ns: "rsmq"} );
const request = require('request');
const cheerio = require('cheerio');
const mongoose = require("mongoose");
const _ = require("lodash");
const QUEUE_NAME = "urlcrawler";

function findIndexOfObjInArray(arr, attr, val) {
    for (var item = 0; item < arr.length; item++) {
        if (arr[item][attr] && arr[item][attr] == val) return item;
    }
    return -1;
}

//// Queuing logic

rsmq.createQueue({qname: QUEUE_NAME}, function (err, resp) {
    if (resp===1) {
        console.log("::::DEBUG:::: ", QUEUE_NAME, " queue created");
    } else console.log(err, resp);
});

const notificationWorker = new RSMQWorker( "urlcrawler" , {
    timeout: 30000,
    rsmq: rsmq,
});

function sendNotification(data){
    notificationWorker.send(JSON.stringify(data));
}

function purgeQueue(cb){
    rsmq.deleteQueue({qname: QUEUE_NAME}, function(err1){
        console.log("::::DEBUG:::: ", QUEUE_NAME, " queue purged");
        rsmq.createQueue({qname: QUEUE_NAME}, function (err2, resp) {
            console.log("::::DEBUG:::: ", QUEUE_NAME, " queue re-created");
            cb(err2, resp);
        });
    });
}

notificationWorker.on("message", function(msg, next, id) {
    const payload = JSON.parse(msg);
    console.log("::::DEBUG:::: ", payload.url, " got crawl request");
    if(payload.url != null) {
        try {
            var url = new URL.URL(payload.url);
            if(url.pathname == "/") {
                initCrawling(payload.url, next);
            } else {
                Page.findOne({baseUrl: new RegExp("^https?://" + url.host + "$")}).lean().then(page => {
                    if(page != null) {
                        var idx = findIndexOfObjInArray(page.related, "url", payload.url);
                        if(idx == -1) {
                            initCrawling(payload.url, next);
                        } else {
                            console.log("::::DEBUG:::: ", payload.url, " already crawled");
                            next();
                        }
                    } else {
                        next();
                    }
                });
            }
        } catch(e){
            next();
        }
    } else next();
});

notificationWorker.on('error', function( err, msg ){
    console.log("::::DEBUG:::: ", err, " with queue");
});

notificationWorker.on('timeout', function( msg ){
    console.log("::::DEBUG:::: ", msg.src, " queue timeout");
});

notificationWorker.start();

//// Crawling Logic

function initCrawling(url, done){
    console.log("::::DEBUG:::: ", url, " crawling now");
    request(url, function (err, res, body) {
        if(err) {
            console.log(err, "error occured while hitting URL");
        } else {
            let $ = cheerio.load(body);  //loading of complete HTML body
            var results = [];
            $('a').each(function(index){
                const link = $(this).attr('href');
                const text = $(this).text().replace(/\n/g,' ').replace(/\s+/g,' ').trim();
                console.log("::::DEBUG:::: ", text, " (", link, ") link found in page.", url);
                results.push({url: link, title: text});
            });
            commitCrawledResults(url, results, done);
        }
    });
}

//// Database Logic

function commitCrawledResults(url, results, done) {
    try {
        var currentUrl = new URL.URL(url);
        const baseUrl = currentUrl.protocol + "//" + currentUrl.host;
        console.log("::::DEBUG:::: ", baseUrl, " saving ", results.length, "crawled urls in db");
        Page.findOne({baseUrl: baseUrl}).then(page => {
            if(page != null) {
                var newUrls = [];
                if(page.related == null) page.related = [];
                _.forEach(results, function(result){
                    var idx = findIndexOfObjInArray(page.related, "url", result.url);
                    if (idx == -1) {
                        page.related.push(result);
                        newUrls++;
                        if(result.url.startsWith(baseUrl)) {
                            newUrls.push(result);
                        } else {
                            console.log("::::DEBUG:::: ", result.url, " external url found for base ", baseUrl);
                        }
                    }
                });
                page.save().then(saved => {
                    console.log("::::DEBUG:::: ", baseUrl, " saved ", newUrls.length, " new crawled urls in db");
                    _.forEach(newUrls, function(payload){
                        sendNotification(payload);
                    });
                    done();
                });
            } else {
                console.log("::::DEBUG:::: ", baseUrl, " error not found in db");
                done();
            }
        });
    } catch(e){
        done();
    }
}

module.exports = {initCrawling: initCrawling, sendNotification: sendNotification, purgeQueue: purgeQueue};