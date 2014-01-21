var posts_controller = require('../app/controllers/posts_controller'),
    users_controller = require('../app/controllers/users_controller'),
    sessions_controller = require('../app/controllers/sessions_controller');

module.exports = function(app) {
  app.get('/', posts_controller.index);

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

  app.post('/:category/:id/send_email', posts_controller.sendEmail);
  app.get('/:category/:id/contact', posts_controller.contact);
  app.get('/:category/:id', posts_controller.show);
  app.get('/:category', posts_controller.index);
}