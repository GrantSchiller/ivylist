var helper = require("../../lib/helper"),
    db = require("../../lib/db"),
    mail = require("nodemailer").mail,
    Post = require('../models/post');

function index(response, request, params, postData) {
  var perPage = 20;
  var currentPage = params.page ? parseInt(params.page) : 1;

  Post.numPages(perPage, function (totalPages) {
    if ((currentPage > 0) && (currentPage <= totalPages)) {
      Post.findPostsOnPage(currentPage, totalPages, perPage).exec(function(err, posts) {
        helper.render("posts/index.html", { posts: posts, currentPage: currentPage, totalPages: totalPages }, response, 200);
      });
    } else {
      helper.renderError(404, response);
    }
  });
}

function add(response, request, params, postData) {
  var post = new Post();
  helper.render("posts/add.html", { post: post, email: request.session.email }, response, 200);
}

function create(response, request, params, postData) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var target = "friendscentral.org";
  if (re.test(postData.email) && (postData.email.substr(postData.email.length - target.length) == target) && (postData.title.trim().length != 0) && (postData.text.trim().length != 0)) {
    var post = new Post({
      title: postData.title,
      email: postData.email,
      text_markdown: postData.text
    });

    post.save(function(err, post) {
      var confirmLink ='http://' + request.headers.host + "/confirm/" + post.confirmation_code;

      mail({
        from: "Max Luzuriaga <max@luzuriaga.com>",
        to: post.email,
        subject: "Confirm your Ivylist post",
        text: confirmLink,
        html: '<a href="' + confirmLink + '">Confirm your post!</a>'
      });

      request.session.email = post.email;

      helper.render("posts/create.html", { post: post }, response, 200);
    });
  } else {
    helper.redirectTo("/new", request, response);
  }
}

function _findPost(id, response, callback) {
  if (id && id.length == 24) {
    Post.findByIdString(id).exec(function(err, post) {
      if (post) {
        callback(post);
      } else {
        helper.renderError(404, response);
      }
    });
  } else {
    helper.renderError(404, response);
  }
}

function show(response, request, params, postData) {
  _findPost(params.id, response, function(post) {
    helper.render("posts/show.html", { post: post }, response, 200);
  });
}

function contact(response, request, params, postData) {
  _findPost(params.id, response, function(post) {
    helper.render("posts/contact.js", { post: post, email: request.session.email }, response, 200);
  });
}

function sendEmail(response, request, params, postData) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var target = "friendscentral.org";
  if (re.test(postData.email) && (postData.email.substr(postData.email.length - target.length) == target) && (postData.email_text.trim().length != 0)) {
    _findPost(params.id, response, function(post) {
      mail({
        from: postData.email,
        to: post.email,
        subject: "Re: " + post.title,
        text: postData.email_text,
        html: postData.email_text
      });

      request.session.email = postData.email;

      helper.render("posts/send_email.js", { post: post }, response, 200);
    });
  } else {
    helper.renderError(403, response);
  }
}

function confirm(response, request, params, postData) {
  Post.findOne({ confirmation_code: params.confirmation_code }, function(err, post) {
    if (post) {
      if (post.confirmed) {
        helper.redirectTo("/posts/" + post.id, request, response);
      } else {
        post.update({ confirmed: true }, function(err) {
          helper.redirectTo("/posts/" + post.id, request, response);
        });
      }
    } else {
      helper.renderError(404, response);
    }
  });
}

exports.index = index;
exports.add = add;
exports.create = create;
exports.show = show;
exports.contact = contact;
exports.sendEmail = sendEmail;
exports.confirm = confirm;