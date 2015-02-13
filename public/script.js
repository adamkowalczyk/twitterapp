
$(document).ready(function(){
	
	// Search button
	$('#search-button').click(function(){
		var query = $('#query-field').val();
		$('#query-field').val('');
		$.getJSON('./search?searchterm='+query)
		.done(function(tweets){
			if ($('#search-results .media').length !== tweets.length) {
				
				$('#search-results').empty();
				var searchElements = '';
				for (var i=0; i<tweets.length; i++) {
					searchElements += '<div id="search-pic-'+i+'" class="media"><div class="media-left"><a id="search-pic-link-'+i+'" href="#"><img id="search-pic-img-'+i+'" class="media-object" src=""></a>'+
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
					//MAKE[ELSE] - CHECK IF NO MEDIA OR URL. HIDE MEDIA ELEM? Placeholder image?
					$('#search-pic-link-'+ind).addClass('hidden');
					$('#search-pic-img-'+ind).addClass('hidden');
				}
				// $('#search-results').on
				console.log(tweet.userName);
				console.log(tweet.text);
				var urlStripped = tweet.text.replace(/(?:https?:\/\/)(?:[\w]+\.)([a-zA-Z\.]{2,63})([\/\w\.-]*)*\/?/g,'');
				$('#search-body-heading-'+ind).text(tweet.userName);
				$('#search-body-text-'+ind).text(urlStripped);
			});
			$('#search-results').removeClass('hidden');
		});
	});

	// Stream button. Change stream filter. Disable for n seconds.

	// Start stop stream toggle button

});