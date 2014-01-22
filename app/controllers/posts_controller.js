var helper = require('../../lib/helper'),
    mail = require('nodemailer').mail,
    Category = require('../models/category')
    Post = require('../models/post'),
    User = require('../models/user');

var perPage = 20;

function _findPost(id, request, response, callback) {
  if (id && id.length == 24) {
    Post.findByIdString(id).populate('_category').exec(function(err, post) {
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

function index(request, response) {
  request.session.confirmedEmail = undefined;

  Category.find().sort({ name: 1 }).exec(function(err, categories) {
    if (request.category) {
      request.category.findPosts().sort({date: -1}).limit(perPage).populate('_category').exec(function(err, posts) {
        response.render('posts/index', { customJS: true, categories: categories, category: request.category.slug, posts: posts, morePosts: (posts.length == perPage)});
      });
    } else {
      Post.find({ confirmed: true }).sort({date: -1}).limit(perPage).populate('_category').exec(function(err, posts) {
        response.render('posts/index', { customJS: true, categories: categories, category: '', posts: posts, morePosts: (posts.length == perPage)});
      });
    }
  });
}

function scroll(response, request, params, postData) {
  _findPost(params.id, request, response, function(post) {
    if (params.category == "") {
      Post.find({ confirmed: true, date: { $lt: post.date }}).sort({date: -1}).limit(perPage).populate('_category').exec(function(err, posts) {
        var last = (posts.length < perPage);
        helper.render("posts/scroll.js", { posts: posts, last: last }, request, response, 200);
      });
    } else {
      Category.findOne({ slug: params.category }).exec(function(err, category) {
        Post.find({ _category: category._id, confirmed: true, date: { $lt: post.date }}).sort({date: -1}).limit(perPage).populate('_category').exec(function(err, posts) {
          var last = (posts.length < perPage);
          helper.render("posts/scroll.js", { posts: posts, last: last }, request, response, 200);
        });
      });
    }
  });
}

function add(response, request, params, postData) {
  request.session.confirmedEmail = undefined;

  Category.find().sort({ name: 1 }).exec(function(err, categories) {
    var post = new Post();
    helper.render("posts/add.html", { customJS: true, post: post, categories: categories, email: request.session.email }, request, response, 200);
  });
}

function create(response, request, params, postData, sockets) {
  Category.findOne({ slug: postData.category }).exec(function(err, category) {
    if (category) {
      var post = new Post({
        title: postData.title,
        text_markdown: postData.text,
        _category: category._id
      });

      if (request.user) {
        post._user = request.user._id;
        post.confirmed = true;

        post.save(function(err, post) {
          if (err) {
            helper.redirectTo("/new", request, response); // TODO: display feedback to user for why post was invalid
          } else {
            post.populate('_category', function(err, post) {
              helper.redirectTo(post.url(), request, response);

              helper.renderPartial("posts/_post", { post: post }, function(content) {
                var listeners = sockets[post._category.slug];

                if (listeners) {
                  listeners = listeners.concat(sockets['']);
                  listeners.forEach(function(socket) {
                    socket.emit('new post', { post: content });
                  });
                }
              });
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
    } else {
      helper.redirectTo("/new", request, response);
    }
  });
}

function show(request, response) {
  request.session.confirmedEmail = undefined;

  response.render('posts/show', { post: request.post });
}

function contact(request, response) {
  // _findPost(params.id, request, response, function(post) {
    // if (post._category.slug == params.category) {
      // response.setHeader('Content-Type', 'application/javascript');
      response.render('posts/contact', { post: request.post, email: request.session.email, js: true });
  //   } else {
  //     helper.renderError(404, request, response);
  //   }
  // });
}

function sendEmail(response, request, params, postData) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var target = "friendscentral.org";
  if (postData.email_text.trim().length != 0) {
    _findPost(params.id, request, response, function(post) {
      if (post._category.slug == params.category) {
        var toEmail = post._user ? post._user.email : post.email;
        var fromEmail;

        if (request.user) {
          fromEmail = request.user.email;
        } else if (re.test(postData.email) && (postData.email.substr(postData.email.length - target.length) == target)) {
          fromEmail = postData.email;
        } else {
          helper.renderError(403, request, response);
          return;
        }

        mail({
          from: fromEmail,
          to: toEmail,
          subject: "Re: " + post.title,
          text: postData.email_text,
          html: postData.email_text
        });

        request.session.email = postData.email;

        helper.render("posts/send_email.js", { post: post }, request, response, 200);
      } else {
        helper.renderError(404, request, response);
      }
    });
  } else {
    helper.renderError(403, request, response);
  }
}

function confirm(response, request, params, postData, sockets) {
  Post.findOne({ confirmation_code: params.confirmation_code }).populate('_category').exec(function(err, post) {
    if (post) {
      if (post.confirmed) {
        helper.redirectTo(post.url(), request, response);
      } else {
        post.update({ confirmed: true }, function(err) {
          post.populate('_category', function(err, post) {
            if (!request.user && request.session.email && request.session.email == post.email) {
              request.session.confirmedEmail = request.session.email;
              helper.render("posts/confirm.html", { email: request.session.confirmedEmail, post: post }, request, response, 200);
            } else {
              // Confirming from different device
              helper.redirectTo(post.url(), request, response);
            }

            helper.renderPartial("posts/_post", { post: post }, function(content) {
            var listeners = sockets[post._category.slug];

              if (listeners) {
                listeners = listeners.concat(sockets['']);
                listeners.forEach(function(socket) {
                  socket.emit('new post', { post: content });
                });
              }
            });
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