var helper = require("../../lib/helper"),
    User = require('../models/user');

function create(response, request, params, postData) {
  var email = request.session.confirmedEmail; // TODO: confirm the email is set
  var pass = postData.password;

  var user = new User({email: email});
  user.password = pass; // TODO: confirm the password is not empty

  user.save(function(err, user) {
    if (err) console.log(err);
    request.session.confirmedEmail = undefined;
    console.log(user.hashed_password);
    helper.redirectTo("/", request, response);
  });
  //request.session.confirmedEmail SET TO UNDEFINED
}

exports.create = create;