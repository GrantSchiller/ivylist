var helper = require('../../lib/helper'),
    mail = require('nodemailer').mail,
    Category = require('../models/category')
    Post = require('../models/post'),
    User = require('../models/user');

var perPage = 20;

function _findPost(id, request, response, callback) {
  if (id && id.length == 24) {
    Post.findByIdString(id).exec(function(err, post) {
      if (post) {
        callback(post);
      } else {
        helper.renderError(404, request, response);
      }
    });
  } else {
    helper.renderError(404, request, response);
  }
}

function index(response, request, params, postData) {
  request.session.confirmedEmail = undefined;

  Category.find().sort({ name: 1 }).exec(function(err, categories) {
    if (params.category == '') {
      Post.find({ confirmed: true }).sort({date: -1}).populate('_category').limit(perPage).exec(function(err, posts) {
        helper.render("posts/index.html", { customJS: true, categories: categories, category: params.category, posts: posts, morePosts: (posts.length == perPage) }, request, response, 200);
      });
    } else {
      Category.findOne({ slug: params.category }).exec(function(err, cat) {
        if (cat) {
          cat.findPosts().sort({date: -1}).populate('_category').exec(function(err, posts) {
            helper.render("posts/index.html", { customJS: true, categories: categories, category: params.category, posts: posts, morePosts: (posts.length == perPage) }, request, response, 200);
          });
        } else {
          helper.renderError(404, request, response);
        }
      });
    }
  });
}

function scroll(response, request, params, postData) {
  _findPost(params.id, request, response, function(post) {
    Post.find({ confirmed: true, date: { $lt: post.date }}).sort({date: -1}).limit(perPage).populate('_category').exec(function(err, posts) {
      var last = (posts.length < perPage);
      helper.render("posts/scroll.js", { posts: posts, last: last }, request, response, 200);
    });
  });
}

function add(response, request, params, postData) {
  request.session.confirmedEmail = undefined;

  var post = new Post();
  helper.render("posts/add.html", { customJS: true, post: post, email: request.session.email }, request, response, 200);
}

function create(response, request, params, postData, sockets) {
  var post = new Post({
    title: postData.title,
    text_markdown: postData.text,
    category: "misc"
  });;

  if (request.user) {
    post._user = request.user._id;
    post.confirmed = true;

    post.save(function(err, post) {
      if (err) {
        helper.redirectTo("/new", request, response); // TODO: display feedback to user for why post was invalid
      } else {
        helper.redirectTo("/posts/" + post.id, request, response);

        helper.renderPartial("posts/_post", { post: post }, function(content) {
          sockets.emit('new post', { post: content });
        });
      }
    });
  } else {
    post.email = postData.email,

    post.save(function(err, post) {
      if (err) {
        helper.redirectTo("/new", request, response); // TODO: display feedback to user for why post was invalid
      } else {
        var confirmLink ='http://' + request.headers.host + "/posts/confirm/" + post.confirmation_code;

        mail({
          from: "Max Luzuriaga <max@luzuriaga.com>",
          to: post.email,
          subject: "Confirm your Ivylist post",
          text: confirmLink,
          html: '<a href="' + confirmLink + '">Confirm your post!</a>'
        });

        request.session.email = post.email;

        helper.render("posts/create.html", { post: post }, request, response, 200);
      }
    });
  }
}

function show(response, request, params, postData) {
  request.session.confirmedEmail = undefined;

  _findPost(params.id, request, response, function(post) {
    helper.render("posts/show.html", { js: true, post: post }, request, response, 200);
  });
}

function contact(response, request, params, postData) {
  _findPost(params.id, request, response, function(post) {
    helper.render("posts/contact.js", { post: post, email: request.session.email }, request, response, 200);
  });
}

function sendEmail(response, request, params, postData) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var target = "friendscentral.org";
  if (re.test(postData.email) && (postData.email.substr(postData.email.length - target.length) == target) && (postData.email_text.trim().length != 0)) {
    _findPost(params.id, request, response, function(post) {
      var toEmail = post._user ? post._user.email : post.email;
      
      mail({
        from: postData.email,
        to: toEmail,
        subject: "Re: " + post.title,
        text: postData.email_text,
        html: postData.email_text
      });

      request.session.email = postData.email;

      helper.render("posts/send_email.js", { post: post }, request, response, 200);
    });
  } else {
    helper.renderError(403, request, response);
  }
}

function confirm(response, request, params, postData, sockets) {
  Post.findOne({ confirmation_code: params.confirmation_code }, function(err, post) {
    if (post) {
      if (post.confirmed) {
        helper.redirectTo("/posts/" + post.id, request, response);
      } else {
        post.update({ confirmed: true }, function(err) {
          if (!request.user && request.session.email && request.session.email == post.email) {
            request.session.confirmedEmail = request.session.email;
            helper.render("posts/confirm.html", { email: request.session.confirmedEmail, post: post }, request, response, 200);
          } else {
            // Confirming from different device
            helper.redirectTo("/posts/" + post.id, request, response);
          }

          helper.renderPartial("posts/_post", { post: post }, function(content) {
            sockets.emit('new post', { post: content });
          });
        });
      }
    } else {
      helper.renderError(404, request, response);
    }
  });
}

exports.index = index;
exports.scroll = scroll;
exports.add = add;
exports.create = create;
exports.show = show;
exports.contact = contact;
exports.sendEmail = sendEmail;
exports.confirm = confirm;