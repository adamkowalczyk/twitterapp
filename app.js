var config = require('./config.json');
var http = require('http');
var Twitter = require('twitter');
var fs = require('fs');
var path = require('path');

var client = new Twitter({
  consumer_key: config.cKey,
  consumer_secret: config.cSecret,
  access_token_key: config.atKey,
  access_token_secret: config.atSecret
});

var htmlPath = path.join(__dirname,'index.html');
var cssPath = path.join(__dirname,'main.css');

// console.log(htmlPath);
// console.log(cssPath);

var server = http.createServer(function(req, res){
	fs.readFile(htmlPath, function(err, data) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(data);
		res.end();
	});


	fs.readFile(cssPath, function(err, data) {
		res.writeHead(200, {'Content-Type': 'text/css'});
		res.write(data);
		res.end();
	});

	client.get('search/tweets.json?q=apple', function(error, tweets, response){
		tweets.statuses.forEach(function(tweet){
			console.log(tweet.text);
				res.write('<p>'+tweet.text+'</p>');
			});
		res.end();
	});

});

server.listen(8000);
console.log('Running..');
// console.log(__dirname);

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