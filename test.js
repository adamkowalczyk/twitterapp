


$(document).ready(function(){
	$('#search').click(function(){
		$.get('./tweetme?query='+$('#query').val())
		.done(function(data){
			$('#results').html(data);
		});
	});
});