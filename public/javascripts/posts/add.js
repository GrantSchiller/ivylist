$(function() {
	prepareTextareas();
	
	$('.postForm').submit(function(e) {
		if ($("p.email input").length > 0) {
			var email = $("p.email input").val();
			if (!_emailValid(email)) {
				$('.postForm p.email').addClass("error");
				e.preventDefault();
			}
		}

		var title = $("p.title input").val();
		if ($.trim(title).length == 0) {
			$('.postForm p.title').addClass("error");
			e.preventDefault();
		}

		var text = $("p.text textarea").val();
		if ($.trim(text).length == 0) {
			$('.postForm p.text').addClass("error");
			e.preventDefault();
		}
	});
});