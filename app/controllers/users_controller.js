var helper = require('../../lib/helper'),
    mail = require('nodemailer').mail,
    User = require('../models/user');

function add(request, response) {
  if (request.user) {
    response.redirect('/');
  } else {
    response.render('users/add', { email: request.session.email });
  }
}

function create(request, response) {
  var user = new User();
  user.password = request.body.password;
  user.password_confirmation = request.body.password_confirmation;

  var email;
  if (request.session.confirmedEmail) {
    user.email = request.session.confirmedEmail;
    user.confirmed = true;
  } else {
    user.email = request.body.email;
  }

  user.save(function(err, user) {
    request.session.email = request.session.confirmedEmail;
    request.session.confirmedEmail = undefined;

    if (err) {
      response.redirect('/register');
    } else {
      request.session.email = undefined;

      if (user.confirmed) {
        helper.signIn(user, request);
        response.redirect('/');
      } else {
        var confirmLink ='http://' + request.headers.host + "/users/confirm/" + user.confirmation_code;

        helper.renderPartial('emails/confirm_user', { user: user, confirmLink: confirmLink }, function(body) {
          helper.sendEmail({
            fromname: "PennGems",
            from: "penngems@gmail.com",
            to: user.email,
            subject: "Confirm your PennGems account",
            text: body
          });
        });

        response.render('users/create', { user: user });
      }
    }
  });
}

function confirm(request, response) {
  User.findOne({ confirmed: false, confirmation_code: request.params.confirmation_code }, function(err, user) {
    if (user) {
      user.update({ confirmed: true }, function(err) {
        helper.signIn(user, request);

        response.redirect('/');
      });
    } else {
      helper.renderError(404, response);
    }
  });
}

exports.add = add;
exports.create = create;
exports.confirm = confirm;