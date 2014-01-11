var helper = require('../../lib/helper'),
    User = require('../models/user');

function add(response, request, params, postData) {
  if (request.user) {
    helper.redirectTo("/", request, response);
  } else {
    helper.render("users/add.html", { email: request.session.email }, request, response, 200);
  }
}

function create(response, request, params, postData) {
  var email = request.session.confirmedEmail || postData.email;
  var pass = postData.password;

  var user = new User({ email: email });
  user.password = pass;

  user.save(function(err, user) {
    if (err) {
      request.session.confirmedEmail = undefined;
      helper.redirectTo("/register", request, response);
    } else {
      request.session.email = undefined;

      if (request.session.confirmedEmail) {
        helper.signIn(user, request);
        helper.redirectTo("/", request, response);
      } else {
        // Send confirm email
      }
    }
  });
}

exports.add = add;
exports.create = create;