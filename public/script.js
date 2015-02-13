
$(document).ready(function(){
	var streamToggle = true;
	var printed = [];
	var toPrint = [];
	
	function getStream() {
		$.getJSON('./poll?')
		.done(function(tweets) {
			console.log('tweets ',tweets);
			console.log('printed ',printed);
			$.each(tweets, function(ind, tweet){
				if ($.inArray(JSON.stringify(tweet),printed) === -1) {
					// Check if tweet is new. If so, shove in toPrint, and printed.
					toPrint.push(tweet);
					// track the 20 tweets on page with 'printed'
					if(printed.length < 20) {
						printed.push(JSON.stringify(tweet));
					}
					else {
						printed.shift();
						printed.push(JSON.stringify(tweet));
					}
				}
			});
			console.log('toPrint, before',toPrint);
			// stick toPrint elements in DOM, then empty toPrint
			$.each(toPrint, function(ind, tweet){ //HOW?  check for media elems, if else, append whole chunk depending on context. bleurg.
				var urlStripped = tweet.text.replace(/(?:https?:\/\/)(?:[\w]+\.)([a-zA-Z\.]{2,63})([\/\w\.-]*)*\/?/g,'');
				if (tweet.hasOwnProperty('media')) {
					$('#stream-results').prepend('<div class="media stream-tweet"><div class="media-left"><a href="'+tweet.media+'"><img class="media-object" src="'+tweet.media+'"></a>'+
												'</div><div class="media-body"><h4 class="media-heading">'+tweet.userName+'</h4><p>'+urlStripped+'</p></div></div>');
					}
				else if (tweet.hasOwnProperty('expUrl')) {
				// check for twitpic etc with regex? use for src if so
					$('#stream-results').prepend('<div class="media stream-tweet"><div class="media-left"><a href="'+tweet.expUrl+'"><img class="media-object" src="/media/link.png"></a>'+
												'</div><div class="media-body"><h4 class="media-heading">'+tweet.userName+'</h4><p>'+urlStripped+'</p></div></div>');
				}
				else {
					$('#stream-results').prepend('<div class="media stream-tweet"><div class="media-body"><h4 class="media-heading">'+tweet.userName+'</h4><p>'+urlStripped+'</p></div></div>');
				}
			});
			toPrint = [];
			console.log('toPrint, after',toPrint);
			$('.stream-tweet').slice(20).remove();
			if (streamToggle) {
				setTimeout(function() {
					getStream();
				}, 3000);
			}
		});
	}
	// Start stream (on load)
	if (streamToggle) {
		setTimeout(function() {
			getStream();
		}, 3000);
	}

	// Search button
	$('#search-btn').click(function(){
		var query = $('#query-field').val();
		$('#query-field').val('');
		$.getJSON('./search?searchterm='+query)
		.done(function(tweets){
			if ($.isArray(tweets)) {
				if ($('#search-results .media').length !== tweets.length) {
					
					$('#search-results').empty();
					var searchElements = '';
					// TODO $tweets.each surely?
					for (var i=0; i<tweets.length; i++) {
						searchElements += '<div id="search-media-"'+i+' class="media"><div id="search-pic-'+i+'"  class="media-left"><a id="search-pic-link-'+i+'" href="#"><img id="search-pic-img-'+i+'" class="media-object" src=""></a>'+
										'</div><div id="search-body-'+i+'" class="media-body"><h4 id="search-body-heading-'+i+'" class="media-heading">UserName</h4><p id="search-body-text-'+i+'">TweetText</p></div></div>';
					}
					$('#search-results').append(searchElements);
				}
				
				console.log(tweets);
				$.each(tweets, function(ind,tweet){
					if (tweet.hasOwnProperty('media')) {
					$('#search-pic-link-'+ind).removeClass('hidden');
					$('#search-pic-img-'+ind).removeClass('hidden');
					$('#search-pic-link-'+ind).attr('href',tweet.media);
					$('#search-pic-img-'+ind).attr('src',tweet.media);
					}
					else if (tweet.hasOwnProperty('expUrl')) {
					// check for twitpic etc with regex? use for src if so
					$('#search-pic-link-'+ind).removeClass('hidden');
					$('#search-pic-img-'+ind).removeClass('hidden');
					$('#search-pic-link-'+ind).attr('href',tweet.expUrl);
					$('#search-pic-img-'+ind).attr('src','/media/link.png');
					}
					else {
						$('#search-pic-link-'+ind).addClass('hidden');
						$('#search-pic-img-'+ind).addClass('hidden');
					}
					console.log(tweet.userName);
					console.log(tweet.text);
					var urlStripped = tweet.text.replace(/(?:https?:\/\/)(?:[\w]+\.)([a-zA-Z\.]{2,63})([\/\w\.-]*)*\/?/g,'');
					$('#search-body-heading-'+ind).text(tweet.userName);
					$('#search-body-text-'+ind).text(urlStripped);

					$('#search-results').removeClass('hidden');
				});
			}
			// not an array? it's an error string.
			else {
				alert(tweets);
			}
		});
	});

	// Stream button. Change stream filter. Disable for n seconds to try and avoid rate limit
	$('#stream-filter-btn').click(function(){
		$(this).attr('disabled','disabled');
		streamToggle = false;
		var query = $('#query-field').val();
		$('#query-field').val('');
		setTimeout(function() {$.getJSON('./stream?filter='+query)
								.done(function(response){
									alert('Stream filter set to: '+response);
								});
		},3000);
		setTimeout(function() {streamToggle = true; getStream();},3000);
		setTimeout(function() { $('#stream-filter-btn').removeAttr('disabled'); }, 20000); // <= bigger number?
	});
	// START/STOP stream display

	$('#stream-toggle-btn').click(function(){
		if (streamToggle) {
			$(this).text('Start stream - local');
			streamToggle = false;
		}
		else {
			$(this).text('Stop stream - local');
			streamToggle = true;
			getStream();
		}
	});

	$('#stream-kill-btn').click(function(){
		$.getJSON('./kill')
		.done(function(response){
			alert('Stream killed on server. Add new filter to restart.');
		});
	});

});