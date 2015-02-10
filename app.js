var config = require('./config.json');
var http = require('http');
var Twitter = require('twitter');
var fs = require('fs');
var path = require('path');
var url = require('url');

var client = new Twitter({
  consumer_key: config.cKey,
  consumer_secret: config.cSecret,
  access_token_key: config.atKey,
  access_token_secret: config.atSecret
});

var indexPath = path.join(__dirname,'index.html');
var cssPath = path.join(__dirname,'main.css');
var jqueryPath = path.join(__dirname,'jquery-2.1.3.min.js');
var testPath = path.join(__dirname,'test.js');

var routes = {
	'index' : {file : indexPath, ctype : {'Content-Type': 'text/html'}},
	'css' : {file : cssPath, ctype : {'Content-Type': 'text/css'}},
	'jquery' : {file : jqueryPath, ctype : {'Content-Type': 'application/javascript'}},
	'test' : {file : testPath, ctype : {'Content-Type': 'application/javascript'}}
};


function getPage(route, res) {
	fs.readFile(routes[route].file, function(err, data) {
					console.log(routes[route].file, routes[route].ctype);
					res.writeHead(200, routes[route].ctype);
					res.write(data);
					res.end();
				});
}

var server = http.createServer(function(req, res){
// Check for page request
		for (var key in routes) {
			if (req.url.indexOf(key) !== -1) {
				getPage(key,res);
			}
		}

// Check for API request
	if (req.url.match(/tweetme/)) {
		var urlObj = url.parse(req.url,true);
		console.log(urlObj.query);
		var queryURL = 'search/tweets.json?q='+urlObj.query.query;
		console.log(queryURL);
		client.get(queryURL, function(error, tweets, response){
			res.writeHead(200, {'Content-Type': 'text/plain'});
			tweets.statuses.forEach(function(tweet){
				// console.log(tweet.text);
				res.write('<p>'+tweet.text+'</p>');
			});
			res.end();
		});
	}
});

server.listen(process.env.PORT || 8000);
console.log('Running..');


// client.get('search/tweets.json?q=apple', function(error, tweets, response){
// 	tweets.statuses.forEach(function(tweet){
// 		console.log(tweet.text);
// 	});	
// });



// var server = http.createServer(function(req, res){
	
// 	// Working stream code, got me rate limited pretty quickly..

// 	// client.stream('statuses/filter', {track: 'kitkat'},  function(stream){
//  //  		stream.on('data', function(tweet) {
//  //    		res.writeHead(200, {'Content-Type': 'text/plain' });
//  //    		res.write(tweet.text);
//  //  		});

//  //  		stream.on('error', function(error) {
//  //    		console.log(error);
//  //  		});
// 	// });
// });
	

// server.listen(8000);