var express = require('express');
var router = express.Router();
const Page = require("../models/page.model");
const CRAWLER_SERVICE = require("../helpers/crawler");
const ROOT_URL = "http://wiprodigital.com";

router.get('/:action', function(req, res, next) {
    var URL = ROOT_URL;
    if(req.query != null && req.query.url != null) {
        URL = req.query.url;
    }
    const action = req.params.action;
    switch(action) {
        case "start":
            Page.findOne({baseUrl: URL}).then(page => {
                if(page != null) {
                    page.status = "crawling";
                    page.save().then(saved => {
                        CRAWLER_SERVICE.sendNotification({url: URL});
                        return res.json({success: true, message: "Crawler started for: " + URL});
                    });
                } else {
                    const newPage = new Page({baseUrl: URL, related: [], status: "crawling"});
                    newPage.save().then(saved => {
                        CRAWLER_SERVICE.sendNotification({url: URL});
                        return res.json({success: true, message: "Crawler started for: " + URL});
                    });
                }
          });
          break;
        case "stop":
            Page.findOne({baseUrl: URL}).then(page => {
                if(page != null) {
                    page.status = "idle";
                    page.save().then(saved => {
                        CRAWLER_SERVICE.purgeQueue(function(err, resp){
                            return res.json({success: true, message: "Crawler stopped for: " + URL});
                        });
                    });
                } else return res.json({success: false, message: "Crawler never started for URL: ", URL});
            });
            break;
        case "list":
            Page.findOne({baseUrl: URL}).then(page => {
                if(page != null) {
                    return res.json({success: true, results: page.related});
                } else return res.json({success: false, message: "Crawler not started yet for URL: ", URL});
            });
            break;
    }
});

module.exports = router;
