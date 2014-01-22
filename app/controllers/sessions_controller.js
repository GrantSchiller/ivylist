var helper = require('../../lib/helper'),
    User = require('../models/user');

function login(request, response) {
  if (request.user) {
    helper.redirectTo("/", request, response); // TODO: redirect to the page the user was on
  } else {
    request.session.email = undefined;
    response.render('sessions/login', { email: request.session.email });
  }
}

function logout(request, response) {
  helper.signOut(request);
  response.redirect('/'); // TODO: redirect to the page the user was on
}

function create(request, response) {
  var email = request.body.email;
  var password = request.body.password;

  User.authenticate(email, password, function(user) {
    if (user) {
      helper.signIn(user, request);
      response.redirect('/'); // TODO: redirect to the page the user was on
    } else {
      response.redirect('/login');
    }
  });
}

exports.login = login;
exports.logout = logout;
exports.create = create;