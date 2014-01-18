var loading = false;
var sidebarTop;
var finishedScrolling = false;

function positionSidebar() {
	if ($(window).width() < 875) {
		$(".categories-list").css('position', 'static');
		$(".categories-list").css('width', '90%');
		$(".categories-list").css('padding', '5%');
		return;
	}

	var windowTop = $(window).scrollTop();

	if (sidebarTop < windowTop + 20) {
		$(".categories-list").css({ position: 'fixed', top: 20 });
		$(".categories-list").css('width', 700 * .13);
		$(".categories-list").css('padding', 700 * .03);
	} else {
		$(".categories-list").css('position', 'static');
		$(".categories-list").css('width', '13%');
		$(".categories-list").css('padding', '3%');
	}
}

function infiniteScroll() {
	if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
		if (loading || finishedScrolling) return;
		loading = true;
		var id = $("#main ol li").last().prop('id');
		$.ajax({
			url: "/scroll?id=" + id,
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

$(function() {
	sizeTitles();

	sidebarTop = $(".categories-list").offset().top;

	document.addEventListener("scroll", function() {
		positionSidebar();
		infiniteScroll();
	});

	var socket = io.connect('/');
	socket.on('new post', function(data) {
		$(data.post).prependTo("#main ol");
		sizeTitles();
	});

	$(window).resize(sizeTitles);
});