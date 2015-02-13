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
client.stream('statuses/filter', {track: 'yolo'}, function(stream){
	client.streamServer = stream;
	console.log('Stream running...\nTopic: yolo');
	stream.on('data', function(tweet){
		var tweetObj = {};
		tweetObj.userName = tweet.user.screen_name;
		tweetObj.text = tweet.text;
		if (tweet.entities.urls[0]) {
			tweetObj.expUrl = tweet.entities.urls[0].expanded_url; 
			tweetObj.disUrl = tweet.entities.urls[0].display_url;
		}
		if (tweet.entities.media) {
			tweetObj.media = tweet.entities.media[0].media_url;
		}

		if (streamTweets.length < 20) {
			streamTweets.push(tweetObj);
		}
		else {
			streamTweets.shift();
			streamTweets.push(tweetObj);
		}
	});
});

// Dummy Stream
// var num = 1;
// setInterval(function(){
// 	if (streamTweets.length < 20) {
// 			count = num.toString();
// 			streamTweets.push({userName:count,text:count,expUrl:count,disUrl:count,media:count});
// 			console.log(streamTweets);
// 			num++;
// 		}
// 		else {
// 			count = num.toString();
// 			streamTweets.shift();
// 			streamTweets.push({userName:count,text:count,expUrl:count,disUrl:count,media:count});
// 			console.log(streamTweets);
// 			num++;
// 		}},3000);



// TWITTER SEARCH FUNCTION  -URL (PARAM) IN - ARRAY OUT
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
	if (req.url.match(/poll/)) {
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(streamTweets));
	}
	else if (req.url.match(/stream/)) {
		// TODO: Make this, and onload server, a function call
		console.log('Stream filter change received');
		var urlObj = url.parse(req.url,true);
		var filter = urlObj.query.filter;
		console.log('Filter is: '+filter);
		if (client.streamServer) {
			client.streamServer.destroy(); 
		}
		console.log('streamServer destroyed');
		streamTweets = [];
		// streamServer = null; => does nothing?
		client.stream('statuses/filter', {track: filter}, function(stream){
			client.streamServer = stream;
			console.log('Stream running...\nTopic: '+filter);
			stream.on('data', function(tweet){
				var tweetObj = {};
				tweetObj.userName = tweet.user.screen_name;
				tweetObj.text = tweet.text;
				if (tweet.entities.urls[0]) {
					tweetObj.expUrl = tweet.entities.urls[0].expanded_url; 
					tweetObj.disUrl = tweet.entities.urls[0].display_url;
				}
				if (tweet.entities.media) {
					tweetObj.media = tweet.entities.media[0].media_url;
				}

				if (streamTweets.length < 20) {
					streamTweets.push(tweetObj);
				}
				else {
					streamTweets.shift();
					streamTweets.push(tweetObj);
				}
			});
		});
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(filter));
	}
	else if (req.url.match(/kill/)) {
		if (client.streamServer) {
			client.streamServer.destroy();
			console.log('Stream server stopped'); 
		}
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify('Stream server stopped'));
	}
	else if (req.url.match(/search/)) {
		console.log('Search request received');
		var urlObj = url.parse(req.url,true);
		var queryURL = 'search/tweets.json?q='+urlObj.query.searchterm+'&result_type=recent';
		console.log('QueryURL: '+queryURL);
		twitterSearch(queryURL, function(err, data){
			if (err) {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(err[0]));
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
console.log('Server running on port '+currentPort);
