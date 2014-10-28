var async = require('async');
var request = require('request');
var http = require('http');

http.globalAgent.maxSockets = 1000

var responses = {};

function requestFor(fuzzNum, reqNum) {
    var path =
        "http://128.208.1.214/fuzz-me" + fuzzNum + ".php?" +
        "id=tyoverby" +
        "&input=" + reqNum;
    return function (callback) {
        var cur_time = Date.now();
        request(path, function(err, response, body) {
            var bdy = {
                num: reqNum,
                body: body,
                err: err,
                delta: Date.now() - cur_time
            };
            console.log(bdy);
            if (responses[body] === undefined) {
                console.log(reqNum, body);
                responses[body] = reqNum;
            }
            callback(err,bdy);
        });
    }
}

function limiter(limit) {
    this.limit = limit;
    this.current = 0;
    this.idx = 0;
    this.fn = null;
    this.start = function() {
        var i = this.idx;
        if (i < 0) {return;}
        this.idx += 1;
        this.current += 1;
        this.fn(i)(function (err, result){
            this.current -= 1;
            while (this.current < this.limit) {
                this.start();
            }
            console.log(this.current);
        }.bind(this));
    }.bind(this);
}

/*
async.parallelLimit(generateRequests(2, 0, 100000000, 103), 10, function (err, data) {
    console.log(err, data);
    console.log(responses);
});
*/

var l = new limiter(1);
l.fn = function(i){ return requestFor(2, i * 103); };
l.start();

module.exports = requestFor;
