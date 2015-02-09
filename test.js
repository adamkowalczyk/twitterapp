$(document).ready(function(){
	$('#search').click(function(){
		$.get('http://localhost:8000/tweetme')
		.done(function(data){
			$('#results').html(data);
		});
	});
});