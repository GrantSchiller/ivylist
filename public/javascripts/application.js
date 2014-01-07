function sizeTitles() {
	$("li.post time").height(function(index ) {
		return $(this).next().height();
	});
}

$(function() {
	sizeTitles();
	$('textarea').elastic();
	$('textarea').css({ resize: 'none' });

	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var target = "friendscentral.org";

	$('.postForm').submit(function(e) {
		var email = $("p.email input").val();
		if (!(re.test(email) && (email.substr(email.length - target.length) == target))) {
			$('.postForm p.email').addClass("error");
			e.preventDefault();
		}

		var title = $("p.title input").val();
		if (title == "") {
			$('.postForm p.title').addClass("error");
			e.preventDefault();
		}

		var text = $("p.text textarea").val();
		if (text == "") {
			$('.postForm p.text').addClass("error");
			e.preventDefault();
		}
	});

	$("input, textarea").keypress(function() {
		$(this).parent().removeClass("error");
	});
});

$(window).resize(sizeTitles);