$(document).ready(function(){
	
	var printed = [];
	function getStream() {
		$.get('./hose')
		.done(function(data) {
			data = JSON.parse(data);
			
			$.each(data, function(ind, val){
				if ($.inArray(val,printed) === -1) {
					$('#stream-results').prepend('<p class="stream-tweet">'+val+'</p>');
					if(printed.length < 20) {
						printed.push(val);
					}
					else {
						printed.shift();
						printed.push(val);
					}
				}
			});

			$('.stream-tweet').slice(20).remove();

			setTimeout(function() {
				getStream();
			}, 1000);
		});
	}

	setTimeout(function() {
		getStream();
	}, 1000);

});
