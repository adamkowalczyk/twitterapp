var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var Twitter = require('twitter');
var ecstatic = require('ecstatic')({root: __dirname + '/public'});

// Check for config.json in root
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

//TWITTER STREAM

var streamTweets = [];
// var stream = client.stream('statuses/filter', {track: 'math'}, function(stream){
// 	stream.on('data', function(tweet){
// 		console.log(tweet.text);
// 		if (streamTweets.length < 20) {
// 			streamTweets.push(tweet.text);
// 		}
// 		else {
// 			streamTweets.shift();
// 			streamTweets.push(tweet.text);
// 		}
// 	});
// });


// TWITTER SEARCH FUNCTION  -URL (PARAM) IN - OBJECT OUT
// TODO: Put in module
function twitterSearch(query, callback) {
	var result = [];
	client.get(query, function(error, tweets, response){
		if (error) {
			result.push('ERROR - SEARCH FAILED');
			return callback(result,null);
		}
		else {
			if (tweets.statuses.length > 0) {
				tweets.statuses.forEach(function(tweet){
					var tweetData = {};
					tweetData.userName = tweet.user.screen_name;
					tweetData.text = tweet.text;
					if (tweet.entities.urls[0]) {
						tweetData.expUrl = tweet.entities.urls[0].expanded_url; 
						tweetData.disUrl = tweet.entities.urls[0].display_url;
					}
					if (tweet.entities.media) {
						tweetData.media = tweet.entities.media[0].media_url;
					}
					result.push(tweetData);
				});
				return callback(null,result);
			}
			else {
				result.push('ERROR - NO RESULTS');
				return callback(result, null);
			}
		}
	});
}
// SERVER

var server = http.createServer(function(req, res){
	if (false) {
		// if periodic stream request - send tweetStream array
	}
	else if (false) {
		// if filter - change stream filter HOW? put stream in function, call it?
	}
	else if (req.url.match(/search/)) {
		// if search, call search method, return array of objects, stringified
		console.log('Search request received');
		var urlObj = url.parse(req.url,true);
		var queryURL = 'search/tweets.json?q='+urlObj.query.searchterm+'&result_type=recent';
		console.log('QueryURL: '+queryURL);
		twitterSearch(queryURL, function(err, data){
			if (err) {
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end(err[0]);
				console.log(err[0]);
			}
			else {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(data));
				console.log(JSON.stringify(data));
			}
		});
		
	}
	else {
		ecstatic(req, res);
	}
});

var currentPort = process.env.PORT || 8000;
server.listen(currentPort);
console.log('Running on port '+currentPort);
