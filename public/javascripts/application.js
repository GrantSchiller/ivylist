function sizeTitles() {
	$("li.post time").height(function(index ) {
		return $(this).next().height();
	});
}

$(function() {
	sizeTitles();
});

$(window).resize(sizeTitles);