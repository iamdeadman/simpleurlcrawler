var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();
const Page = require("../models/page.model");
const TEST_DURATION = 10000;
chai.use(chaiHttp);

describe('Crawler test #1', () => {
    describe('start crawler', () => {
        it('it should start crawling default url', (done) => {
            Page.remove({}, (err) => {
                console.log("DB reset complete");
                chai.request(server).get('/start').end((err, res) => {
                    res.should.have.status(200);
                    setTimeout(function(){
                        done();
                    }, TEST_DURATION);
                });
            });
        });
    });

    describe("crawler results", () => {
        it('it should get results crawled so far', function(done){
            chai.request(server).get('/list').end((err, res) => {
                console.log("Crawled results length: ", res.body.results.length);
                res.should.have.status(200);
                done();
            });
        });
    });
});