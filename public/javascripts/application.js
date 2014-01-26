var shouldSubmitForm = true;

var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var target = "upenn.edu";

function _emailValid(email) {
  return (re.test(email) && (email.substr(email.length - target.length) == target)) || (email == "mluzuriaga@friendscentral.org") || (email == "gschiller@friendscentral.org");
}

function sizeTitles() {
	$("li.post p.title").width(function(index) {
		return $(this).parent().parent().width() - $(this).parent().prev().width() - 5;
	});
}

function prepareForms() {
	$("form.ajax").submit(function(e) {
		if (!shouldSubmitForm) {
			e.preventDefault();
			return;
		}

		var formData = $(this).serializeArray(),
			formURL = $(this).attr("action"),
			method = $(this).attr("method").toUpperCase();

		$.ajax({
			url: formURL,
			type: method,
			data: formData,
			error: function(xhr, textStatus, error) {
				console.log(error);
			}
		});

		e.preventDefault();
	});

	$("form.delete-form").submit(function(e) {
		if (!confirm("Are you sure you want to delete your post?")) {
			e.preventDefault();
		}
	});

	$('textarea').elastic();

	$("input, textarea").keypress(function() {
		$(this).parent().removeClass("error");
	});
}

function prepareLinks() {
	$("a.ajax").click(function() {
		var url = this.href;

		$.ajax({
			url: url,
			type: "GET",
			error: function(xhr, textStatus, error) {
				console.log(error);
			}
		});

		return false;
	});
}

function prepareContactForm() {
	$('form.contactForm').submit(function(e) {
		shouldSubmitForm = true;

		if ($("p.email input").length > 0) {
			var email = $(".contactForm p.email input").val();
			if (!_emailValid(email)) {
				$('.contactForm p.email').addClass("error");
				shouldSubmitForm = false;
				e.preventDefault();
			}
		}
		
		var text = $(".contactForm textarea").val();
		if ($.trim(text).length == 0) {
			$('.contactForm p.text').addClass("error");
			shouldSubmitForm = false;
			e.preventDefault();
		}
	});
}

function prepareTextareas() {
	$('textarea').elastic();
	$('textarea').css({ resize: 'none' });
}

function accountForHeader() {
	if ($(window).width() > 600) {
		$('body').css('padding-top', $('header').outerHeight());
	} else {
		$('body').css('padding-top', 0);
	}
}

function offsetFooter() {
	$("body").css('padding-bottom', $("footer").outerHeight());
}

$(function() {
	accountForHeader();
	offsetFooter();
	prepareForms();
	prepareLinks();

	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		$(document).on('focus', 'input', function() {
			$('body').addClass('typing');
		});

		$(document).on('blur', 'input', function() {
			$('body').removeClass('typing');
		});
	}
});

$(window).resize(accountForHeader);
$(window).resize(offsetFooter);