var loading = false;
var finishedScrolling = false;

function infiniteScroll() {
	if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
		if (loading || finishedScrolling) return;
		loading = true;
		var id = $("#main ol li").last().prop('id');
		$.ajax({
			url: "/scroll?id=" + id + "&category=" + category,
			type: "GET",
			error: function(xhr, textStatus, error) {
				console.log(error);
			},
			success: function() {
				loading = false;
			}
		});
	}
}

function offsetFooter() {
	$("body").css('padding-bottom', $("footer").outerHeight());
}

$(function() {
	$("footer").css({
		'position': 'fixed',
		'bottom': 0
	})

	offsetFooter();
	sizeTitles();

	document.addEventListener("scroll", infiniteScroll);

	var socket = io.connect('/');
	socket.emit('listening', { category: category });
	socket.on('new post', function(data) {
		$(data.post).prependTo("#main ol");
		sizeTitles();
	});

	$(window).resize(sizeTitles);
	$(window).resize(offsetFooter)
});