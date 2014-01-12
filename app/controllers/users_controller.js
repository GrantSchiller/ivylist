var helper = require('../../lib/helper'),
    mail = require('nodemailer').mail,
    User = require('../models/user');

function add(response, request, params, postData) {
  if (request.user) {
    helper.redirectTo("/", request, response);
  } else {
    helper.render("users/add.html", { email: request.session.email }, request, response, 200);
  }
}

function create(response, request, params, postData) {
  var user = new User();
  user.password = postData.password;
  user.password_confirmation = postData.password_confirmation;

  var email;
  if (request.session.confirmedEmail) {
    user.email = request.session.confirmedEmail;
    user.confirmed = true;
  } else {
    user.email = postData.email;
  }

  user.save(function(err, user) {
    request.session.confirmedEmail = undefined;

    if (err) {
      helper.redirectTo("/register", request, response);
    } else {
      request.session.email = undefined;

      if (user.confirmed) {
        helper.signIn(user, request);
        helper.redirectTo("/", request, response);
      } else {
        var confirmLink ='http://' + request.headers.host + "/users/confirm/" + user.confirmation_code;

        mail({
          from: "Max Luzuriaga <max@luzuriaga.com>",
          to: user.email,
          subject: "Confirm your Ivylist account",
          text: confirmLink,
          html: '<a href="' + confirmLink + '">Confirm your account.</a>'
        });

        helper.render("users/create.html", { user: user }, request, response, 200);
      }
    }
  });
}

function confirm(response, request, params, postData) {
  User.findOne({ confirmation_code: params.confirmation_code }, function(err, user) {
    if (user) {
      if (!user.confirmed) {
        user.update({ confirmed: true }, function(err) {
          helper.signIn(user, request);

          helper.redirectTo("/", request, response);
        });
      } else {
        helper.redirectTo("/", request, response);
      }
    } else {
      helper.renderError(404, request, response);
    }
  });
}

exports.add = add;
exports.create = create;
exports.confirm = confirm;