var helper = require('../../lib/helper'),
    User = require('../models/user');

function create(response, request, params, postData) {
  var email = request.session.confirmedEmail; // TODO: confirm the email is set
  var pass = postData.password;

  var user = new User({ email: email });
  user.password = pass; // TODO: confirm the password is not empty

  user.save(function(err, user) {
    request.session.confirmedEmail = undefined;
    
    if (err) {
      helper.redirectTo("/register", request, response);
    } else {
      request.session.email = undefined;

      helper.signIn(user, request);
      helper.redirectTo("/", request, response);
    }
  });
}

exports.create = create;