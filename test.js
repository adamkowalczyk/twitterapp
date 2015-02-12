// TODO - HTML formatting here, not server
// server should send a json object?


$(document).ready(function(){
	
	$('#search').click(function(){
		if ($('#query').val().length > 0) {
			// %23 == #    to search by hashtag
			$.get('./tweetme?query='+$('#query').val())
			.done(function(data){
				$('#search-results').html(data);
			});
		}	
	});

});