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


client.stream('statuses/filter', {track: 'love'}, function(stream){
	stream.on('data', function(tweet){
		console.log(tweet.text);
	});
});