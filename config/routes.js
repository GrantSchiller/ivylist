var pages_controller = require('../app/controllers/pages_controller'),
    posts_controller = require('../app/controllers/posts_controller'),
    users_controller = require('../app/controllers/users_controller'),
    sessions_controller = require('../app/controllers/sessions_controller');

var helper = require('../lib/helper');

var Post = require('../app/models/post'),
    Category = require('../app/models/category');

module.exports = function(app) {
  app.get('/', posts_controller.index);
  app.get('/about', pages_controller.about);

  app.get('/scroll', posts_controller.scroll);
  app.get('/new', posts_controller.add);

  app.get('/posts', posts_controller.index);
  app.post('/posts/create', posts_controller.create);
  app.get('/posts/confirm/:confirmation_code', posts_controller.confirm);

  app.post('/users/create', users_controller.create);
  app.get('/users/confirm/:confirmation_code', users_controller.confirm);

  app.get('/register', users_controller.add);

  app.get('/login', sessions_controller.login);
  app.get('/logout', sessions_controller.logout);

  app.post('/sessions/create', sessions_controller.create);

  app.param('category', function(request, response, next, slug) {
    Category.findOne({ slug: slug }).exec(function(err, cat) {
      if (cat) {
        request.category = cat;
        next();
      } else {
        helper.renderError(404, response);
      }
    });
  });

  app.param('post_id', function(request, response, next, id) {
    if (id && id.length == 24) {
      Post.findWithCategory(id, request.category).populate('_category').populate('_user').exec(function(err, post) {
        if (post) {
          request.post = post;
          next();
        } else {
          helper.renderError(404, response);
        }
      });
    } else {
      helper.renderError(404, response);
    }
  });

  app.post('/:category/:post_id/delete', function(request, response, next) {
    if (request.user && request.user.email == (request.post.email || request.post._user.email)) {
      next();
    } else {
      helper.renderError(403, response);
    }
  }, posts_controller.destroy);

  app.post('/:category/:post_id/send_email', posts_controller.sendEmail);
  app.get('/:category/:post_id/contact', posts_controller.contact);
  app.get('/:category/:post_id', posts_controller.show);
  app.get('/:category', posts_controller.index);

  app.get('*', function(request, response) {
    helper.renderError(404, response);
  })
}