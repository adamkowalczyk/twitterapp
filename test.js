


$(document).ready(function(){
	$('#search').click(function(){
		$.get('http://localhost:8000/tweetme?query='+$('#query').val())
		.done(function(data){
			$('#results').html(data);
		});
	});
});