
var http = require('http');
var Twitter = require('twitter');
var fs = require('fs');
var path = require('path');
var url = require('url');

// Use config.json if running locally (without foreman), else use env vars
var configCheck = true;
var config;
try {
	fs.readFileSync(path.join(__dirname,'config.json'));
}
catch (e) {
	configCheck = false;
}
if (configCheck) {
	config = require('./config.json');
}

// DUH! JUST USE THE .ENV? but, can I require a non json file?

// Instantiate client 
var client;
if (configCheck) {
	client = new Twitter({
		consumer_key: config.cKey,
		consumer_secret: config.cSecret,
		access_token_key: config.atKey,
		access_token_secret: config.atSecret
	});
}
else {
	client = new Twitter({
		consumer_key: process.env.C_KEY,
		consumer_secret: process.env.C_SECRET,
		access_token_key: process.env.AT_KEY,
		access_token_secret: process.env.AT_SECRET
	});
}

// File paths
var indexPath = path.join(__dirname,'index.html');
var streamPath = path.join(__dirname,'stream.html');
var cssPath = path.join(__dirname,'main.css');
var jqueryPath = path.join(__dirname,'jquery-2.1.3.min.js');
var testPath = path.join(__dirname,'test.js');
var page2Path = path.join(__dirname,'page2.js');

var routes = {
	'index' : {file : indexPath, ctype : {'Content-Type': 'text/html'}},
	'stream' : {file : streamPath, ctype : {'Content-Type': 'text/html'}},
	'css' : {file : cssPath, ctype : {'Content-Type': 'text/css'}},
	'jquery' : {file : jqueryPath, ctype : {'Content-Type': 'application/javascript'}},
	'test' : {file : testPath, ctype : {'Content-Type': 'application/javascript'}},
	'page2' : {file : page2Path, ctype : {'Content-Type': 'application/javascript'}}
};


function getPage(route, res) {
	fs.readFile(routes[route].file, function(err, data) {
		console.log(routes[route].file, routes[route].ctype);
		res.writeHead(200, routes[route].ctype);
		res.write(data);
		res.end();
	});
}


//TWITTER STREAM

var streamTweets = [];
client.stream('statuses/filter', {track: 'math'}, function(stream){
	stream.on('data', function(tweet){
		console.log(tweet.text);
		if (streamTweets.length < 20) {
			streamTweets.push(tweet.text);
		}
		else {
			streamTweets.shift();
			streamTweets.push(tweet.text);
		}
	});
});

// Dummy Stream
// var count = 1;
// setInterval(function(){
// 	if (streamTweets.length < 20) {
// 			streamTweets.push(count);
// 			count++;
// 		}
// 		else {
// 			streamTweets.shift();
// 			streamTweets.push(count);
// 			count++;
// 		}},1000);


// SERVER //

var server = http.createServer(function(req, res){

	// Check for requested page
	var pageExists = false;
	var pageKey = '';
	for (var key in routes) {
		if (req.url.indexOf(key) !== -1) {
			pageExists = true;
			pageKey = key;
		}
	}
	// Serve Pages
	console.log('Req.url: '+req.url);
	if (req.url === '/') {
		getPage('index', res);
	}
	else if (pageExists) {
		getPage(pageKey, res);
	}
	else if (req.url.match(/tweetme/)) {
		var urlObj = url.parse(req.url,true);
		console.log(urlObj.query);
		var queryURL = 'search/tweets.json?q='+urlObj.query.query+'&result_type=recent';
		console.log('Query url: '+queryURL);
		
		client.get(queryURL, function(error, tweets, response){
			res.writeHead(200, {'Content-Type': 'text/plain'});
			if (tweets.statuses.length > 0) {
				tweets.statuses.forEach(function(tweet){
					res.write('<div class="tweet-div">');
					res.write('<p class="tweet tweet-name">'+tweet.user.screen_name+'<p>');
					// console.log('User: '+tweet.user.screen_name);
					res.write('<p class="tweet tweet-text">'+tweet.text+'</p>');
					// console.log('Text: '+tweet.text);
					if (tweet.entities.urls[0]) {
						res.write('<br/><a class="tweet tweet-link" href="'+tweet.entities.urls[0].expanded_url+'">'+tweet.entities.urls[0].display_url+'</a>');
						// console.log('URL: '+tweet.entities.urls[0].expanded_url);
					}
					if (tweet.entities.media) {
						res.write('<img class="tweeet tweet-img" width="20%" height="20%" src="'+tweet.entities.media[0].media_url+'"/>');
						// console.log('Image URL: '+tweet.entities.media[0].media_url);
					}
					res.write('</div>');
				});
			}	
			res.end();
		});
	}
	else if (req.url.match(/hose/)) {
		var tweetsJSON = JSON.stringify(streamTweets); 
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(tweetsJSON);
		console.log(tweetsJSON);
		res.end();
	}
	else {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.end('404 - Page not found');
	}
});

var currentPort = process.env.PORT || 8000;
server.listen(currentPort);
console.log('Running on port '+currentPort);
