var helper = require('../../lib/helper'),
    mail = require('nodemailer').mail,
    Category = require('../models/category')
    Post = require('../models/post'),
    User = require('../models/user');

var perPage = 30;

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

function scroll(request, response) {
  var id = request.query.id;

  if (id && id.length == 24) {
    Post.findByIdString(request.query.id).exec(function(err, post) {;
      if (request.query.category == '') {
        Post.find({ confirmed: true, date: { $lt: post.date }}).sort({date: -1}).limit(perPage).populate('_category').exec(function(err, posts) {
          var last = (posts.length < perPage);
          response.render('posts/scroll', { posts: posts, last: last, js: true });
        });
      } else {
        Category.findOne({ slug: request.query.category }).exec(function(err, category) {
          if (category) {
            Post.find({ _category: category._id, confirmed: true, date: { $lt: post.date }}).sort({date: -1}).limit(perPage).populate('_category').exec(function(err, posts) {
              var last = (posts.length < perPage);
              response.render('posts/scroll', { posts: posts, last: last, js: true });
            });
          }
        });
      }
    });
  } else {
    helper.renderError(404, response);
  }
}

function add(request, response) {
  request.session.confirmedEmail = undefined;

  Category.find().sort({ name: 1 }).exec(function(err, categories) {
    var post = new Post();
    response.render('posts/add', { customJS: true, post: post, categories: categories, email: request.session.email });
  });
}

function _notifyNewPost(post, sockets) {
  helper.renderPartial('posts/_post', { post: post }, function(content) {
    var listeners = sockets[post._category.slug] || [];
    var allPostsListeners = sockets[''] || [];

    listeners = listeners.concat(allPostsListeners);

    listeners.forEach(function(socket) {
      socket.emit('new post', { post: content });
    });
  });
}

function create(request, response) {
  Category.findOne({ slug: request.body.category }).exec(function(err, category) {
    if (category) {
      var post = new Post({
        title: request.body.title,
        text_markdown: request.body.text,
        _category: category._id
      });

      if (request.user) {
        post._user = request.user._id;
        post.confirmed = true;

        post.save(function(err, post) {
          if (err) {
            response.redirect('/new'); // TODO: display feedback to user for why post was invalid
          } else {
            post.populate('_category', function(err, post) {
              response.redirect(post.url());

              _notifyNewPost(post, request.sockets);
            });
          }
        });
      } else {
        post.email = request.body.email,

        post.save(function(err, post) {
          if (err) {
            response.redirec('/new'); // TODO: display feedback to user for why post was invalid
          } else {
            request.session.email = post.email;
            response.render('posts/create', { post: post });

            var confirmLink ='http://' + request.headers.host + "/posts/confirm/" + post.confirmation_code;

            helper.renderPartial('emails/confirm_post', { post: post, confirmLink: confirmLink }, function(body) {
              helper.sendEmail({
                fromname: "PennGems",
                from: "penngems@gmail.com",
                to: post.email,
                subject: 'Confirm your PennGems post: "' + post.title + '"',
                text: body
              });
            });
          }
        });
      }
    } else {
      response.redirect('/new');
    }
  });
}

function confirm(request, response) {
  Post.findOne({ confirmed: false, confirmation_code: request.params.confirmation_code }).populate('_category').exec(function(err, post) {
    if (post) {
      post.update({ confirmed: true }, function(err) {
        post.populate('_category', function(err, post) {
          User.findOne({ email: post.email }, function(err, user) {
            if (user) {
              post.update({ _user: user._id }, function(err) {
                response.redirect(post.url());
              });
            } else {
              if (!request.user && request.session.email && request.session.email == post.email) {
                request.session.confirmedEmail = request.session.email;
                response.render('posts/confirm', { email: request.session.confirmedEmail, post: post });
              } else {
                response.redirect(post.url());
              }
            }

            _notifyNewPost(post, request.sockets);
          });
        });
      });
    } else {
      helper.renderError(404, response);
    }
  });
}

function show(request, response) {
  request.session.confirmedEmail = undefined;

  response.render('posts/show', { post: request.post });
}

function destroy(request, response) {
  request.post.remove(function(err, post) {
    response.redirect("/");
  });
}

function contact(request, response) {
  response.render('posts/contact', { post: request.post, email: request.session.email, js: true });
}

function sendEmail(request, response) {
  if (request.body.email_text.trim().length != 0) {
    var toEmail = request.post._user ? request.post._user.email : request.post.email;
    var fromEmail;

    if (request.user) {
      fromEmail = request.user.email;
    } else if (helper.emailValid(request.body.email)) {
      fromEmail = request.body.email;
    } else {
      helper.renderError(403, response);
      return;
    }

    helper.renderPartial('emails/contact', { fromEmail: fromEmail, emailText: request.body.email_text, post: request.post }, function(body) {
      helper.sendEmail({
        fromname: "PennGems",
        from: "penngems@gmail.com",
        to: toEmail,
        replyto: fromEmail,
        subject: "Response Re: " + request.post.title,
        text: body
      });
    });

    request.session.email = request.body.email;

    response.render('posts/send_email', { post: request.post, js: true });
  } else {
    helper.renderError(403, response);
  }
}

exports.index = index;
exports.scroll = scroll;
exports.add = add;
exports.create = create;
exports.show = show;
exports.destroy = destroy;
exports.contact = contact;
exports.sendEmail = sendEmail;
exports.confirm = confirm;