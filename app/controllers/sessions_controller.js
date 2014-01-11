var helper = require('../../lib/helper'),
    User = require('../models/user');

function login(response, request, params, postData) {
  if (request.user) {
    helper.redirectTo("/", request, response); // TODO: redirect to the page the user was on
  } else {
    helper.render("sessions/login.html", { email: request.session.email }, request, response, 200);
  }
}

function logout(response, request, params, postData) {
  helper.signOut(request);
  helper.redirectTo("/", request, response); // TODO: redirect to the page the user was on
}

function createSession(response, request, params, postData) {
  var email = postData.email;
  var password = postData.password;

  User.authenticate(email, password).exec(function(err, user) {
    if (user) {
      helper.signIn(user, request);
      helper.redirectTo("/", request, response); // TODO: redirect to the page the user was on
    } else {
      helper.redirect("/login", request, response);
    }
  });
}

exports.login = login;
exports.logout = logout;
exports.createSession = createSession;